document.getElementById("findBtn").addEventListener("click", findRecipes);

async function findRecipes() {
    const ingredientsInput = document.getElementById("ingredients").value;

    if (!ingredientsInput) {
        alert("Please enter ingredients");
        return;
    }

    const ingredients = ingredientsInput
        .toLowerCase()
        .split(",")
        .map(i => i.trim());

    const type = document.querySelector('input[name="type"]:checked').value;

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p style='text-align:center;'>🍳 Cooking up ideas...</p>";

    try {
        const response = await fetch("http://localhost:3000/recipes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ingredients, type })
        });

        const recipes = await response.json();

        resultsDiv.innerHTML = "";

        recipes.slice(0, 5).forEach(recipe => {
            const div = document.createElement("div");
            div.className = "recipe";

            div.innerHTML = `
                <h3>${recipe.name}</h3>
                <p><strong>Ingredients:</strong> ${recipe.ingredients.join(", ")}</p>
                <p>${recipe.description}</p>
            `;

            resultsDiv.appendChild(div);
        });

    } catch (err) {
        resultsDiv.innerHTML = "Something went wrong 😢";
        console.error(err);
    }
}
