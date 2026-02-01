const form = document.getElementById("recipeForm");
const resultsDiv = document.getElementById("results");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const ingredientsInput = document.getElementById("ingredients").value.trim();
    const type = document.querySelector("input[name='type']:checked").value;

    if (!ingredientsInput) return;

    const ingredients = ingredientsInput
        .split(",")
        .map(i => i.trim().toLowerCase())
        .filter(Boolean);

    resultsDiv.style.display = "block";
    resultsDiv.innerHTML = "⏳ Generating recipes… please wait";

    try {
        const response = await fetch("/recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ingredients, type })
        });

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            resultsDiv.innerHTML = "No recipes found. Try different ingredients.";
            return;
        }

        resultsDiv.innerHTML = "";

        data.forEach(recipe => {
            resultsDiv.innerHTML += `
                <div class="recipe">
                    <h3>${recipe.name}</h3>
                    <p><strong>Ingredients:</strong> ${recipe.ingredients.join(", ")}</p>
                    <p>${recipe.description}</p>
                </div>
            `;
        });

    } catch {
        resultsDiv.innerHTML =
            "⚠️ Service is waking up. Please try again in a few seconds.";
    }
});
