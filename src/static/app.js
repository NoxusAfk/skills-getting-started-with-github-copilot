document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  async function loadActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      for (const [name, data] of Object.entries(activities)) {
        const card = document.createElement("div");
        card.className = "activity-card";

        const participantsList = (data.participants || [])
          .map(
            (email) => `
            <li class="participant-item">
              <span>${email}</span>
              <button class="delete-btn" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(email)}" title="Unregister">&times;</button>
            </li>`
          )
          .join("");

        card.innerHTML = `
          <h3>${name}</h3>
          <p>${data.description}</p>
          <p><strong>Schedule:</strong> ${data.schedule}</p>
          <p><strong>Availability:</strong> ${data.participants.length}/${data.max_participants} enrolled</p>
          <div class="participants-section">
            <h4>Participants:</h4>
            ${
              data.participants.length > 0
                ? `<ul class="participants-list">${participantsList}</ul>`
                : `<p class="no-participants">No participants yet</p>`
            }
          </div>
        `;

        activitiesList.appendChild(card);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      }

      // Attach unregister click listeners
      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const act = decodeURIComponent(e.currentTarget.dataset.activity);
          const mail = decodeURIComponent(e.currentTarget.dataset.email);
          try {
            const res = await fetch(`/activities/${encodeURIComponent(act)}/signup?email=${encodeURIComponent(mail)}`, {
              method: "DELETE",
            });
            if (res.ok) {
              await loadActivities();
            }
          } catch (err) {
            console.error("Error unregistering:", err);
          }
        });
      });
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const activityName = activitySelect.value;
    const email = document.getElementById("email").value;

    try {
      const response = await fetch(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        messageDiv.textContent = data.message;
        messageDiv.className = "message success";
        signupForm.reset();
        await loadActivities(); // Automatically re-render without page refresh
      } else {
        messageDiv.textContent = data.detail || "Registration failed";
        messageDiv.className = "message error";
      }
    } catch (error) {
      messageDiv.textContent = "Error submitting registration";
      messageDiv.className = "message error";
    }
  });

  loadActivities();
});