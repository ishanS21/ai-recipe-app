import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/test", (req, res) => {
  res.json({ status: "Backend working" });
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post("/recipes", async (req, res) => {
  const { ingredients, type } = req.body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.json([]);
  }

  const dietRule =
    type === "veg"
      ? "Recipes must be strictly vegetarian. Do NOT include meat, fish, egg, or seafood."
      : "Recipes may include non-vegetarian items like chicken, meat, fish, or egg.";

  const prompt = `
Return ONLY valid JSON. No markdown. No extra text.

User ingredients:
${ingredients.join(", ")}

Rules:
- ${dietRule}
- You may use ANY SUBSET of the user ingredients.
- Prefer recipes that use MORE of the given ingredients.

JSON format:
[
  {
    "name": "Recipe name",
    "ingredients": ["ingredient1", "ingredient2"],
    "description": "Short description"
  }
]
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    const rawOutput =
      completion?.choices?.[0]?.message?.content || "[]";

    let recipes = [];
    try {
      recipes = JSON.parse(rawOutput);
    } catch {
      return res.json([]);
    }

    const scoredRecipes = recipes.map(r => {
      const matchCount = r.ingredients.filter(i =>
        ingredients.includes(i.toLowerCase())
      ).length;

      return { ...r, matchScore: matchCount };
    });

    scoredRecipes.sort((a, b) => b.matchScore - a.matchScore);

    return res.json(
      scoredRecipes.slice(0, 5).map(r => ({
        name: r.name,
        ingredients: r.ingredients,
        description: r.description
      }))
    );

  } catch (error) {
    console.error("Groq Error:", error.message);
    return res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
