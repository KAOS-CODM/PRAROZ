class SearchBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
            <style>
                .search-container {
                    display: flex;
                    justify-content: center; /* Centers horizontally */
                    gap: 10px;
                    width: 60%; /* Adjust width to keep it centered */
                    max-width: 500px; /* Prevent it from stretching too much */
                    margin: 20px auto; /* Centers it with equal space on both sides */
                }
                
                input {
                    flex-grow: 1;
                    padding: 12px; /* Increased height */
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    font-size: 16px; /* Slightly larger text */
                }
                
                button {
                    padding: 12px 16px; /* Increased height */
                    background-color: #007BFF;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                }

                button:hover {
                    background-color: #0056b3;
                }

                /* Responsive for 760px */
                @media (max-width: 760px) {
                    .search-container {
                        width: 80%; /* Wider for better fit */
                    }
                    
                    input, button {
                        font-size: 14px; /* Slightly smaller text */
                        padding: 10px;
                    }
                }

                /* Responsive for 480px */
                @media (max-width: 480px) {
                    .search-container {
                        width: 90%; /* Almost full width */
                        flex-direction: column; /* Stack input and button vertically */
                    }

                    button {
                        width: 100%; /* Full width for better usability */
                    }
                }
            </style>

            <div class="search-container">
                <input type="text" id="searchInput" placeholder="Search recipe or category...">
                <button id="searchButton">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </div>
         `;
    }

    connectedCallback() {
        const input = this.shadowRoot.getElementById("searchInput");
        const button = this.shadowRoot.getElementById("searchButton");

        input.addEventListener("input", () => this.performSearch());
        button.addEventListener("click", () => this.performSearch());
    }

    performSearch() {
        const query = this.shadowRoot.getElementById("searchInput").value.toLowerCase().trim();
        const recipeItems = document.querySelectorAll(".recipe-card");
        const recipeCards = document.querySelectorAll(".recipe-card-link"); // For grid layout
        const categoryHeadings = document.querySelectorAll("h2"); // Categories are in <h2>

        let found = false;
        let matchedCategory = null;

        // If search bar is empty, reset everything
        if (query === "") {
            categoryHeadings.forEach(heading => heading.style.display = "block");
            recipeItems.forEach(item => item.style.display = "block");
            recipeCards.forEach(card => card.style.display = "block");

            // Remove "no results" message if it exists
            let message = document.getElementById("noResultsMessage");
            if (message) message.remove();
            return;
        }

        // Hide everything initially
        categoryHeadings.forEach(heading => heading.style.display = "none");
        recipeItems.forEach(item => item.style.display = "none");
        recipeCards.forEach(card => card.style.display = "none");

        // Check if query matches a category
        categoryHeadings.forEach(heading => {
            const categoryName = heading.textContent.toLowerCase();
            if (categoryName.includes(query)) {
                matchedCategory = heading;
                heading.style.display = "block"; // Show category
                found = true;
            }
        });

        // Show recipes under the matched category OR recipes with matching names
        recipeItems.forEach(item => {
            const recipeName = item.querySelector("h3")?.textContent.toLowerCase() || "";
            if (recipeName.includes(query)) {
                item.style.display = "block";
                found = true;
            } else if (matchedCategory) {
                // If a category matched, show all recipes under it
                let nextElement = matchedCategory.nextElementSibling;
                while (nextElement && nextElement.classList.contains("recipe-card")) {
                    nextElement.style.display = "block";
                    nextElement = nextElement.nextElementSibling;
                }
            }
        });

        // Search for recipes in grid layout
        recipeCards.forEach(card => {
            const recipeName = card.querySelector(".recipe-title")?.textContent.toLowerCase() || "";
            if (recipeName.includes(query)) {
                card.style.display = "block";
                found = true;
            }
        });

        // Show a "no results" message if nothing is found
        let message = document.getElementById("noResultsMessage");
        if (!found) {
            if (!message) {
                message = document.createElement("p");
                message.id = "noResultsMessage";
                message.textContent = "No matching recipes or categories found.";
                document.getElementById("recipe-list")?.appendChild(message);
            }
        } else if (message) {
            message.remove();
        }
    }
}

customElements.define("search-bar", SearchBar);
