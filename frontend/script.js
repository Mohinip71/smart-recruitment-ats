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

    // 6. Handle Recruiter Job Posting Form Submission
  const createJobForm = document.getElementById("createJobForm");
  if (createJobForm) {
    createJobForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("New Job Posting Published Successfully!");
      createJobForm.reset();
    });
  }
  }
  // 7. Handle View Details Modal on My Applications Page
  const detailsModal = document.getElementById("detailsModal");
  const closeDetailsModal = document.getElementById("closeDetailsModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const viewDetailsBtns = document.querySelectorAll(".table-section .btn");

  if (detailsModal && viewDetailsBtns.length > 0) {
    viewDetailsBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        if (row) {
          const jobTitle = row.cells[0].innerText;
          const company = row.cells[1].innerText;
          const date = row.cells[2].innerText;
          const status = row.cells[3].innerText;

          document.getElementById("modalJobTitleDetail").innerText = jobTitle;
          document.getElementById("modalCompanyDetail").innerText = company;
          document.getElementById("modalDateDetail").innerText = date;
          document.getElementById("modalStatusDetail").innerText = status;

          detailsModal.style.display = "flex";
        }
      });
    });

    if (closeDetailsModal) {
      closeDetailsModal.addEventListener("click", () => {
        detailsModal.style.display = "none";
      });
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        detailsModal.style.display = "none";
      });
    }

    window.addEventListener("click", (e) => {
      if (e.target === detailsModal) {
        detailsModal.style.display = "none";
      }
    });
  }
});