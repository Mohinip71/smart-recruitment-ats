/* --- Day 5: Candidate Dashboard & Application Modal Interactivity --- */

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".filter-input");
  const jobCards = document.querySelectorAll(".job-card");
  const applyButtons = document.querySelectorAll(".apply-btn");
  
  const modal = document.getElementById("applyModal");
  const closeBtn = document.querySelector(".close-btn");
  const modalJobTitle = document.getElementById("modalJobTitle");
  const applicationForm = document.getElementById("applicationForm");

  // 1. Live Job Search Filtering
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();

      jobCards.forEach(card => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        const description = card.querySelector(".job-description").textContent.toLowerCase();
        
        if (title.includes(query) || description.includes(query)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  }

  // 2. Open Modal when clicking "Apply Now" or "View Details"
  applyButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      const card = e.target.closest(".job-card");
      const jobTitle = card.querySelector("h3").textContent;
      const company = card.querySelector(".company-name").textContent;

      // Set modal title text
      modalJobTitle.textContent = `${jobTitle} at ${company}`;
      
      // Show modal
      modal.style.display = "flex";
    });
  });

  // 3. Close Modal when clicking the 'X'
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // 4. Close Modal when clicking outside the modal box
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // 5. Handle Application Form Submission
  if (applicationForm) {
    applicationForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Success! Your application has been submitted successfully to the ATS.");
      modal.style.display = "none";
      applicationForm.reset();
    });
  }
});