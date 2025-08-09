document.getElementById('recipe-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = {
        recipeName: document.getElementById('recipe-name').value.trim(),
        ingredients: document.getElementById('ingredients').value
       .split("\n").map(line => line.trim()).filter(line => line !== ""),
       instructions: document.getElementById('instructions').value
       .split("\n").map(line => line.trim()).filter(line => line !== ""),
        category: document.getElementById('category').value,
        prepTime: document.getElementById('prep-time').value,
        cookTime: document.getElementById('cook-time').value,
        servingSize: document.getElementById('serving-size').value.trim(),
    };

    // Send data to the backend
    fetch(`${window.API_BASE_URL}/submit-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('response-message').textContent = data.message;
        document.getElementById('response-message').style.color = "green";
        document.getElementById('recipe-form').reset();
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById('response-message').textContent = "Error submitting recipe.";
        document.getElementById('response-message').style.color = "red";
    });
});
