document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("comments-list");
  const form = document.getElementById("comment-form");

  // Extract slug from the URL: e.g. /desserts/chocolate-cake.html → "chocolate-cake"
  const recipeSlug = window.location.pathname.split('/').pop().replace('.html', '');

  function loadComments() {
    fetch(`/api/comments/${recipeSlug}`)
      .then(res => res.json())
      .then(data => {
        list.innerHTML = data.length
          ? data.map(c => `
            <div class="comment">
              <div class="comment-profile">
                <img src="placeholder-profile.png" alt="User profile">
                <small>${c.name}</small>
              </div>
              <div class="comment-body">
                <small>${new Date(c.created_at).toLocaleString()}</small>
                <p>${c.comment}</p>
              </div>
            </div>
          `).join('')
          : "<p>No comments yet. Be the first!</p>";
      });
  }

  const nameInput = document.getElementById("comment-name");
  const textarea = document.getElementById("comment-text");
  const sendBtn = document.getElementById("send-comment");

  // Show name field when textarea is focused
  textarea.addEventListener("focus", () => {
    nameInput.classList.add("show");
  });

  // Hide name field if empty + textarea empty on blur
  textarea.addEventListener("blur", () => {
    setTimeout(() => { // small delay so it doesn't collapse too quickly
      if (!textarea.value.trim() && !nameInput.value.trim()) {
        nameInput.classList.remove("show");
      }
    }, 200);
  });

  // Enable/disable send button
  function toggleSendButton() {
    if (textarea.value.trim() && nameInput.value.trim()) {
      sendBtn.disabled = false;
    } else {
      sendBtn.disabled = true;
    }
  }

  textarea.addEventListener("input", toggleSendButton);
  nameInput.addEventListener("input", toggleSendButton);

  // Init state
  sendBtn.disabled = true;


  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("comment-name").value.trim();
    const comment = document.getElementById("comment-text").value.trim();

    fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: recipeSlug, name, comment })
 // ✅ slug used here
    })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      form.reset();
      loadComments();
    });
  });

  loadComments();
});