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

    window.addEventListener("click", (e) => {
    if (e.target === detailsModal) {
      detailsModal.style.display = "none";
    }
  });

  // --- PASTE NEW LOCALSTORAGE & RECRUITER CODE HERE ---

  const createJobForm = document.getElementById("createJobForm");
  if (createJobForm) {
    createJobForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("jobTitle").value;
      const company = document.getElementById("companyName").value || "TechCorp Solutions";
      const location = document.getElementById("jobLocation").value || "Remote";
      const type = document.getElementById("jobType").value || "Full-time";

      const newJob = { id: Date.now(), title, company, location, type };
      
      let existingJobs = JSON.parse(localStorage.getItem("ats_jobs")) || [];
      existingJobs.push(newJob);
      localStorage.setItem("ats_jobs", JSON.stringify(existingJobs));

      alert("New Job Posting Published Successfully and synced to Candidate Dashboard!");
      createJobForm.reset();
    });
  }

  const jobContainer = document.querySelector(".job-grid");
  if (jobContainer) {
    const customJobs = JSON.parse(localStorage.getItem("ats_jobs")) || [];
    customJobs.forEach(job => {
      const jobCard = document.createElement("div");
      jobCard.className = "job-card";
      jobCard.style.cssText = "background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;";
      jobCard.innerHTML = `
        <div>
          <h3 style="color: #2d3748; margin-bottom: 8px;">${job.title}</h3>
          <p style="color: #4e73df; font-weight: 600; margin-bottom: 6px;">${job.company}</p>
          <p style="color: #707ebe; font-size: 14px; margin-bottom: 12px;">📍 ${job.location} | 💼 ${job.type}</p>
        </div>
        <button class="btn apply-btn" style="background: #4e73df; color: #fff; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">Apply Now</button>
      `;
      jobContainer.appendChild(jobCard);
    });
  }

  const resumeModal = document.getElementById("resumeModal");
  const closeResumeModal = document.getElementById("closeResumeModal");
  const closeResumeBtn = document.getElementById("closeResumeBtn");
  const viewResumeBtns = document.querySelectorAll(".view-resume-btn");

  if (resumeModal && viewResumeBtns.length > 0) {
    viewResumeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        resumeModal.style.display = "flex";
      });
    });

    if (closeResumeModal) closeResumeModal.addEventListener("click", () => resumeModal.style.display = "none");
    if (closeResumeBtn) closeResumeBtn.addEventListener("click", () => resumeModal.style.display = "none");
    window.addEventListener("click", (e) => {
      if (e.target === resumeModal) resumeModal.style.display = "none";
    });
  }

} // <--- Closes the DOMContentLoaded function
});