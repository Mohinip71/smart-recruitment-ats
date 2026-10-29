/* --- Smart Recruitment & ATS Platform - Main Script --- */

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

  // 2. Open Modal when clicking "Apply Now"
  applyButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      const card = e.target.closest(".job-card");
      if (card && modalJobTitle && modal) {
        const jobTitle = card.querySelector("h3").textContent;
        const company = card.querySelector(".company-name").textContent;

        modalJobTitle.textContent = `${jobTitle} at ${company}`;
        modal.style.display = "flex";
      }
    });
  });

  // 3. Close Modal when clicking the 'X'
  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // 4. Close Modal when clicking outside the modal box
  window.addEventListener("click", (e) => {
    if (modal && e.target === modal) {
      modal.style.display = "none";
    }
  });

  // 5. Handle Application Form Submission & Save to localStorage
  if (applicationForm) {
    applicationForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const candidateName = document.getElementById("candidateName")?.value || "Kale Prasanna";
      const candidateEmail = document.getElementById("candidateEmail")?.value || "prasannakale882@gmail.com";
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const jobTitle = modalJobTitle?.innerText || "Software Engineer";

      const newApplication = {
        title: jobTitle,
        company: "TechCorp Solutions",
        date: currentDate,
        status: "In Review",
        applicantName: candidateName,
        email: candidateEmail
      };

      let existingApps = JSON.parse(localStorage.getItem("ats_applications")) || [];
      existingApps.push(newApplication);
      localStorage.setItem("ats_applications", JSON.stringify(existingApps));

      alert("Success! Your application has been submitted and saved to localStorage.");
      
      if (modal) modal.style.display = "none";
      applicationForm.reset();
    });
  }

  // 6. Handle Recruiter Job Posting Form Submission
  const createJobForm = document.getElementById("createJobForm");
  if (createJobForm) {
    createJobForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("jobTitle")?.value || "Software Engineer";
      const company = document.getElementById("companyName")?.value || "TechCorp Solutions";
      const location = document.getElementById("jobLocation")?.value || "Remote";
      const type = document.getElementById("jobType")?.value || "Full-time";

      const newJob = { id: Date.now(), title, company, location, type };
      
      let existingJobs = JSON.parse(localStorage.getItem("ats_jobs")) || [];
      existingJobs.push(newJob);
      localStorage.setItem("ats_jobs", JSON.stringify(existingJobs));

      alert("New Job Posting Published Successfully!");
      createJobForm.reset();
    });
  }

  // Render Custom Jobs on Dashboard from localStorage
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

  // 7. Render Dynamic Applications in Recruiter Table
  const recruiterTableBody = document.querySelector("table tbody");
  if (recruiterTableBody) {
    const savedApps = JSON.parse(localStorage.getItem("ats_applications")) || [];
    savedApps.forEach(app => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${app.applicantName}</td>
        <td>${app.title}</td>
        <td>${app.email || "prasannakale882@gmail.com"}</td>
        <td><span class="badge" style="background: #e6f4ea; color: #137333; padding: 4px 8px; border-radius: 4px;">${app.status}</span></td>
        <td>
          <button class="btn view-resume-btn" style="background: #4e73df; color: #fff; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">View Resume</button>
        </td>
      `;
      recruiterTableBody.appendChild(tr);
    });
  }

  // 8. Universal Resume Modal Handler for ALL rows (Static & Dynamic)
  const resumeModal = document.getElementById("resumeModal");
  const closeResumeModal = document.getElementById("closeResumeModal");
  const closeResumeBtn = document.getElementById("closeResumeBtn");

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-resume-btn");
    if (btn) {
      const row = btn.closest("tr");
      if (row) {
        const applicantName = row.cells[0]?.innerText.trim() || "Candidate Name";
        const jobTitle = row.cells[1]?.innerText.trim() || "Software Engineer";
        const applicantEmail = row.cells[2]?.innerText.trim() || "candidate@email.com";

        if (resumeModal) {
          const nameElement = resumeModal.querySelector("h3") || resumeModal.querySelector(".candidate-name");
          if (nameElement) nameElement.innerText = applicantName;

          const paragraphs = resumeModal.querySelectorAll("p");
          paragraphs.forEach(p => {
            const text = p.innerText.toLowerCase();
            if (text.includes("email") || text.includes("@")) {
              p.innerHTML = `<strong>Email:</strong> ${applicantEmail}`;
            }
            if (text.includes("position") || text.includes("software") || text.includes("developer")) {
              p.innerHTML = `<strong>Applied Position:</strong> ${jobTitle}`;
            }
          });

          resumeModal.style.display = "flex";
        }
      }
    }
  });

  // Close Resume Modal Handlers
  if (resumeModal) {
    if (closeResumeModal) closeResumeModal.addEventListener("click", () => resumeModal.style.display = "none");
    if (closeResumeBtn) closeResumeBtn.addEventListener("click", () => resumeModal.style.display = "none");
    window.addEventListener("click", (e) => {
      if (e.target === resumeModal) resumeModal.style.display = "none";
    });
  }

});