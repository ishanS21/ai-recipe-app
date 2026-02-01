import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";

// --------------------
// App setup
// --------------------
const app = express();
const PORT = 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// Middleware
// --------------------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// Routes
// --------------------

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check
app.get("/test", (req, res) => {
  res.json({ status: "Backend working" });
});

// --------------------
// Groq client
// --------------------
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// --------------------
// Recipes API
// --------------------
app.post("/recipes", async (req, res) => {
  const { ingredients, type } = req.body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.json([
      {
        name: "Input Error",
        ingredients: [],
        description: "Please enter at least one ingredient."
      }
    ]);
  }

  // Veg / Non-Veg rule
  const dietRule =
    type === "veg"
      ? "Recipes must be strictly vegetarian. Do NOT include meat, fish, egg, or seafood."
      : "Recipes may include non-vegetarian items like chicken, meat, fish, or egg.";

  const prompt = `
Return ONLY valid JSON. No markdown. No extra text.

You are a smart recipe recommendation engine.

User ingredients:
${ingredients.join(", ")}

Rules:
- ${dietRule}
- You may use ANY SUBSET of the user ingredients.
- You do NOT need to use all ingredients.
- Prefer recipes that use MORE of the given ingredients.
- Do NOT invent rare ingredients unnecessarily.

Generate 5 recipes in the JSON format below.

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

    const rawOutput = completion.choices[0].message.content;

    let recipes;
    try {
      recipes = JSON.parse(rawOutput);
    } catch (parseError) {
      console.error("JSON Parse Error:", rawOutput);
      return res.json([
        {
          name: "Formatting Error",
          ingredients,
          description: "AI returned invalid format. Please try again."
        }
      ]);
    }

    // Optional: Score recipes by ingredient match
    const scoredRecipes = recipes.map(r => {
      const matchCount = r.ingredients.filter(i =>
        ingredients.includes(i.toLowerCase())
      ).length;

      return {
        ...r,
        matchScore: matchCount
      };
    });

    // Sort by best match
    scoredRecipes.sort((a, b) => b.matchScore - a.matchScore);

    // Return top 5 clean recipes
    res.json(
      scoredRecipes.slice(0, 5).map(r => ({
        name: r.name,
        ingredients: r.ingredients,
        description: r.description
      }))
    );

  } catch (error) {
    console.error("Groq Error:", error.message);
    res.json([
      {
        name: "AI Error",
        ingredients,
        description: "Unable to generate recipes right now."
      }
    ]);
  }
});

// --------------------
// Start server
// --------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
