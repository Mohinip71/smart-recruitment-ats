/* --- Day 4: Candidate Dashboard Interactivity --- */

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".filter-input");
  const jobCards = document.querySelectorAll(".job-card");
  const applyButtons = document.querySelectorAll(".apply-btn");

  // 1. Live Job Search Filtering
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();

      jobCards.forEach(card => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        const description = card.querySelector(".job-description").textContent.toLowerCase();
        
        // Show card if title or description matches the search query
        if (title.includes(query) || description.includes(query)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  }

  // 2. Interactive Application / Details Trigger
  applyButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      const card = e.target.closest(".job-card");
      const jobTitle = card.querySelector("h3").textContent;
      const company = card.querySelector(".company-name").textContent;

      alert(`Application Action: You selected "${jobTitle}" at ${company}. Your profile has been noted for review!`);
    });
  });
});