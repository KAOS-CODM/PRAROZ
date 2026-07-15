document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("recipeForm");
    const responseMessage = document.getElementById("responseMessage");
    const toast = document.getElementById("toast");

    const ingredientsEl = document.getElementById("ingredients");
    const instructionsEl = document.getElementById("instructions");
    const descriptionEl = document.getElementById("description");
    const chefTipsEl = document.getElementById("chefTips");

    const ingredientCounter = document.getElementById("ingredients-count");
    const instructionCounter = document.getElementById("steps-count");
    const descriptionCounter = document.getElementById("description-count");
    const chefTipsCounter = document.getElementById("chefTips-count");

    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");

    const successModal = document.getElementById("success-modal");
    const closeSuccess = document.getElementById("close-success");
    const imagePreview = document.getElementById("image-preview");
    const previewImage = document.getElementById("preview-image");

    function showToast(message, color = "red") {
        if (!toast) return;

        const colorToClass = {
            red: "bg-red-600",
            error: "bg-red-600",
            green: "bg-green-600",
            success: "bg-green-600",
            orange: "bg-orange-600",
            warning: "bg-amber-600"
        };

        const bgClass = colorToClass[color] || "bg-red-600";

        toast.textContent = message;
        toast.className = `fixed top-5 right-5 px-5 py-3 rounded-xl shadow-lg text-white ${bgClass}`;

        setTimeout(() => {
            toast.classList.add("hidden");
        }, 3000);
    }

    function updateTextareaHeight(textarea) {
        const scrollHeight = "240";
        textarea.style.height = scrollHeight + "px";
    }

    function countLines(text) {
        return (text || "")
            .split("\n")
            .map(l => l.trim())
            .filter(Boolean).length;
    }

    function updateCounters() {
        if (ingredientsEl && ingredientCounter) {
            const total = countLines(ingredientsEl.value);
            ingredientCounter.textContent = `${total} Ingredient${total === 1 ? "" : "s"}`;
        }

        if (instructionsEl && instructionCounter) {
            const total = countLines(instructionsEl.value);
            instructionCounter.textContent = `${total} Step${total === 1 ? "" : "s"}`;
        }

        if (descriptionEl && descriptionCounter) {
            const length = descriptionEl.value.length;
            descriptionCounter.textContent = `${length}/500`;
            descriptionCounter.classList.remove(
                "text-slate-500",
                "text-yellow-500",
                "text-red-500"
            );
            
            if (length > 450) {
            
                descriptionCounter.classList.add("text-red-500");
            
            }
            
            else if (length > 350) {
            
                descriptionCounter.classList.add("text-yellow-500");
            
            }
            
            else {
            
                descriptionCounter.classList.add("text-slate-500");
            
            }
        }

        if (chefTipsEl && chefTipsCounter) {
            const length = chefTipsEl.value.length
            chefTipsCounter.textContent = `${length}/400`;
            chefTipsCounter.classList.remove(
                "text-slate-500",
                "text-yellow-500",
                "text-red-500"
            );
            
            if (length > 350) {
            
                chefTipsCounter.classList.add("text-red-500");
            
            }
            
            else if (length > 250) {
            
                chefTipsCounter.classList.add("text-yellow-500");
            
            }
            
            else {
            
                chefTipsCounter.classList.add("text-slate-500");
            
            }
        }
    }

    // Auto-resize and counters should be wired once on load.
    document.querySelectorAll("textarea").forEach(textarea => {
        updateTextareaHeight(textarea);
        textarea.addEventListener("input", () => updateTextareaHeight(textarea));
    });

    [ingredientsEl, instructionsEl, descriptionEl, chefTipsEl].forEach(el => {
        if (!el) return;
        el.addEventListener("input", updateCounters);
    });

    updateCounters();

    if (!form) {
        console.error("Form element not found!");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector("button[type='submit']");
        if (!submitBtn) return;

        const category = document.getElementById("category").value;
        const name = document.getElementById("name").value;
        const description = descriptionEl ? descriptionEl.value : document.getElementById("description").value;

        const instructionsArray = instructionsEl
            ? instructionsEl.value.split("\n").map(i => i.trim()).filter(Boolean)
            : document.getElementById("instructions").value.split("\n").map(i => i.trim()).filter(Boolean);

        const ingredientsArray = ingredientsEl
            ? ingredientsEl.value.split("\n").map(i => i.trim()).filter(Boolean)
            : document.getElementById("ingredients").value.split("\n").map(i => i.trim()).filter(Boolean);

        const formattedInstructions = instructionsArray.join("\n");
        const formattedIngredients = ingredientsArray.join("\n");

        const prepTime = `${document.getElementById("prepTimeValue").value} ${document.getElementById("prepTimeUnit").value}`;
        const cookTime = `${document.getElementById("cookTimeValue").value} ${document.getElementById("cookTimeUnit").value}`;
        const servings = `${document.getElementById("servingsValue").value} ${document.getElementById("servingsUnit").value}`;
        const chefTips = chefTipsEl ? chefTipsEl.value : document.getElementById("chefTips").value;

        const imageFile = document.getElementById("image").files[0];

        const allowed = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp"
        ];

        if (!imageFile) {
            showToast("Please select a recipe image.", "error");
            return;
        }

        if (!allowed.includes(imageFile.type)) {
            showToast("Unsupported image format.", "error");
            return;
        }

        if (imageFile.size > 5 * 1024 * 1024) {
            showToast("Image must be under 5MB.", "error");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Submitting...
        `;

        if (progressBar) {
            progressBar.classList.remove("hidden");
            progressBar.style.width = "10%";
        }
        if (progressText) progressText.textContent = "10%";

        try {
            if (progressBar) {
                progressBar.style.width = "30%";
            }
            if (progressText) progressText.textContent = "30%";

            const imageUrl = await uploadImageToCloudinary(imageFile);

            if (progressBar) {
                progressBar.style.width = "55%";
            }

            const formData = new FormData();
            formData.append("category", category);
            formData.append("name", name);
            formData.append("description", description);
            formData.append("instructions", formattedInstructions);
            formData.append("instructions_array", JSON.stringify(instructionsArray));
            formData.append("ingredients", formattedIngredients);
            formData.append("prepTime", prepTime);
            formData.append("cookTime", cookTime);
            formData.append("servings", servings);
            formData.append("chefTips", chefTips);
            formData.append("image", imageFile);
            formData.append("imageUrl", imageUrl);

            if (progressBar) {
                progressBar.style.width = "80%";
            }

            const response = await fetch(`${window.API_BASE_URL}/submit-recipe`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error("Unable to submit recipe.");
            }

            const result = await response.json();

            if (progressBar) {
                progressBar.style.width = "100%";
            }

            showToast(result.message);

            if (successModal) {
                successModal.classList.remove("hidden");
                successModal.classList.add("flex");
            }

            if (responseMessage) {
                responseMessage.innerHTML = `
                    <div
                        class="
                            mt-6
                            rounded-2xl
                            border
                            border-green-300
                            bg-green-50
                            dark:bg-green-900/20
                            dark:border-green-700
                            p-5
                            text-center
                            text-green-700
                            dark:text-green-300
                        "
                    >
                        <i class="fas fa-circle-check text-3xl mb-3"></i>

                        <h3 class="text-xl font-bold">
                            Recipe Submitted!
                        </h3>

                        <p class="mt-2">
                            Your recipe has been sent for review.
                            Once approved it will appear on PraRoz Recipes.
                        </p>
                    </div>
                `;
            }

            form.reset();

            if (imagePreview) imagePreview.classList.add("hidden");
            if (previewImage) previewImage.src = "";

            updateCounters();
        } catch (error) {
            console.error(error);
            showToast("Submission failed. Please try again.", "error");

            if (responseMessage) {
                responseMessage.innerHTML = `
                    <div
                        class="
                            mt-6
                            rounded-2xl
                            border
                            border-red-300
                            bg-red-50
                            dark:bg-red-900/20
                            dark:border-red-700
                            p-5
                            text-center
                            text-red-700
                            dark:text-red-300
                        "
                    >
                        <i class="fas fa-circle-xmark text-3xl mb-3"></i>

                        <h3 class="text-xl font-bold">
                            Submission Failed
                        </h3>

                        <p class="mt-2">
                            Something went wrong while submitting your recipe.
                            Please try again.
                        </p>
                    </div>
                `;
            }
        } finally {
            if (progressBar) {
                progressBar.classList.add("hidden");
                progressBar.style.width = "0%";
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <i class="fas fa-paper-plane"></i>
                Submit Recipe
            `;
        }
    });

    if (closeSuccess) {
        closeSuccess.addEventListener("click", () => {
            if (successModal) successModal.classList.add("hidden");
        });
    }

    // Image drag & drop + preview
    const dropZone = document.getElementById("drop-zone");
    const imageInput = document.getElementById("image");

    function showImagePreview(file) {
        if (!file || !previewImage || !imagePreview) return;
        if (!file.type || !file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            previewImage.src = ev.target.result;
            imagePreview.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    }

    function handleFiles(files) {
        const file = files && files[0];
        if (!file) return;
        showImagePreview(file);
    }

    if (dropZone && imageInput) {
        // Click-to-browse is already handled by the label[for] attribute.
        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
        });

        imageInput.addEventListener("change", () => {
            handleFiles(imageInput.files);
        });
    }

    // Upload Image to Cloudinary
    async function uploadImageToCloudinary(imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", window.CLOUDINARY_UPLOAD_PRESET);
        formData.append("cloud_name", window.CLOUDINARY_CLOUD_NAME);


        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${window.CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("Cloudinary upload failed.");
        }

        const data = await response.json();
        if (!data.secure_url) {
            throw new Error("Image URL not returned.");
        }

        return data.secure_url;
    }
});

