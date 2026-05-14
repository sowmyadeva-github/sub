let accounts = JSON.parse(localStorage.getItem("opsAccounts")) || [];
let currentUser = JSON.parse(localStorage.getItem("opsCurrentUser")) || null;
let tasks = JSON.parse(localStorage.getItem("opsTasks")) || [];
let notifications = JSON.parse(localStorage.getItem("opsNotifications")) || [];

function saveAll() {
  localStorage.setItem("opsAccounts", JSON.stringify(accounts));
  localStorage.setItem("opsCurrentUser", JSON.stringify(currentUser));
  localStorage.setItem("opsTasks", JSON.stringify(tasks));
  localStorage.setItem("opsNotifications", JSON.stringify(notifications));
}

function showAuth(type) {
  document.getElementById("loginBox").classList.toggle("hidden", type !== "login");
  document.getElementById("signupBox").classList.toggle("hidden", type !== "signup");
  document.getElementById("loginTab").classList.toggle("active", type === "login");
  document.getElementById("signupTab").classList.toggle("active", type === "signup");
}

function createAccount() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const role = document.getElementById("signupRole").value;
  const password = document.getElementById("signupPassword").value.trim();

  if (!name || !email || !role || !password) {
    alert("Please fill all fields.");
    return;
  }

  if (accounts.some(user => user.email === email)) {
    alert("Account already exists. Please login.");
    showAuth("login");
    return;
  }

  accounts.push({ id: Date.now(), name, email, role, password });
  localStorage.setItem("opsAccounts", JSON.stringify(accounts));

  alert("Account created successfully. Please login.");
  showAuth("login");

  document.getElementById("signupName").value = "";
  document.getElementById("signupEmail").value = "";
  document.getElementById("signupRole").value = "";
  document.getElementById("signupPassword").value = "";
}

function loginUser() {
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  const user = accounts.find(item => item.email === email && item.password === password);

  if (!user) {
    alert("Invalid login details or account not found.");
    return;
  }

  currentUser = user;
  saveAll();
  openApp();
}

function logoutUser() {
  localStorage.removeItem("opsCurrentUser");
  currentUser = null;
  document.getElementById("appPage").classList.add("hidden");
  document.getElementById("authPage").classList.remove("hidden");
  showAuth("login");
}

function openApp() {
  document.getElementById("authPage").classList.add("hidden");
  document.getElementById("appPage").classList.remove("hidden");

  document.getElementById("profileName").innerText = currentUser.name;
  document.getElementById("profileRole").innerText = currentUser.role.toUpperCase();
  document.getElementById("profileAvatar").innerText = currentUser.name.charAt(0).toUpperCase();

  setupNav();
  loadInternDropdown();
  showDefaultPage();
  renderAll();
}

function setupNav() {
  const nav = document.getElementById("navMenu");

  if (currentUser.role === "manager") {
    nav.innerHTML = `
      <button class="nav-btn active" onclick="openPage('tasksPage', this)">☑ Tasks</button>
      <button class="nav-btn" onclick="openPage('notificationsPage', this)">🔔 Notifications</button>
    `;

    document.getElementById("pageTitle").innerText = "Tasks";
    document.getElementById("newTaskBtn").classList.remove("hidden");
    document.getElementById("managerStats").classList.remove("hidden");
    document.getElementById("internStats").classList.add("hidden");
    document.getElementById("internProgressBadge").classList.add("hidden");
    document.getElementById("managerExtra").classList.remove("hidden");
    document.getElementById("myTasksTab").style.display = "none";
  } else {
    nav.innerHTML = `
      <button class="nav-btn active" onclick="openPage('tasksPage', this)">☑ My Tasks</button>
      <button class="nav-btn" onclick="openPage('notificationsPage', this)">🔔 My Notifications</button>
    `;

    document.getElementById("pageTitle").innerText = "My Tasks";
    document.getElementById("newTaskBtn").classList.add("hidden");
    document.getElementById("managerStats").classList.add("hidden");
    document.getElementById("internStats").classList.remove("hidden");
    document.getElementById("internProgressBadge").classList.remove("hidden");
    document.getElementById("managerExtra").classList.add("hidden");
    document.getElementById("myTasksTab").style.display = "inline-block";
  }
}

function showDefaultPage() {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.getElementById("tasksPage").classList.add("active");
}

function openPage(id, button) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  button.classList.add("active");

  renderAll();
}

function switchTab(tab) {
  document.querySelectorAll(".tab").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-view").forEach(view => view.classList.remove("active"));

  if (tab === "board") {
    document.getElementById("boardTab").classList.add("active");
    document.getElementById("boardView").classList.add("active");
  }

  if (tab === "list") {
    document.getElementById("listTab").classList.add("active");
    document.getElementById("listView").classList.add("active");
  }

  if (tab === "my") {
    document.getElementById("myTasksTab").classList.add("active");
    document.getElementById("myTasksView").classList.add("active");
  }

  renderAll();
}

function openTaskModal() {
  if (currentUser.role !== "manager") return;
  document.getElementById("taskModal").style.display = "flex";
}

function closeTaskModal() {
  document.getElementById("taskModal").style.display = "none";
}

function closeDetailsModal() {
  document.getElementById("detailsModal").style.display = "none";
}

function loadInternDropdown() {
  const select = document.getElementById("assignIntern");
  select.innerHTML = `<option value="">Select intern</option>`;

  accounts
    .filter(user => user.role === "intern")
    .forEach(intern => {
      const option = document.createElement("option");
      option.value = intern.email;
      option.textContent = `${intern.name} (${intern.email})`;
      select.appendChild(option);
    });
}

function visibleTasks() {
  if (currentUser.role === "manager") return tasks;
  return tasks.filter(task => task.internEmail === currentUser.email);
}

function getMyTasks() {
  return tasks.filter(task => task.internEmail === currentUser.email);
}

function getSelectedRequirements() {
  const values = [];
  document.querySelectorAll(".requirements input:checked").forEach(input => values.push(input.value));
  return values;
}

function assignTask() {
  if (currentUser.role !== "manager") return;

  const title = document.getElementById("taskTitle").value.trim();
  const internEmail = document.getElementById("assignIntern").value;
  const priority = document.getElementById("priority").value;
  const description = document.getElementById("taskDescription").value.trim();
  const requirements = getSelectedRequirements();
  const intern = accounts.find(user => user.email === internEmail);

  if (!title || !internEmail || !priority || !description) {
    alert("Please fill task title, intern, priority and description.");
    return;
  }

  tasks.push({
    id: Date.now(),
    title,
    internName: intern.name,
    internEmail: intern.email,
    priority,
    description,
    requirements,
    status: "todo",
    progress: 10,
    dailyUpdate: "",
    blocker: "",
    helpNeeded: "",
    frontendLink: "",
    backendLink: "",
    liveLink: "",
    readme: "",
    screenshots: "",
    notes: "",
    feedback: "",
    createdAt: new Date().toLocaleString(),
    timeline: [{ text: "📝 Task assigned by manager", time: new Date().toLocaleString() }]
  });

  addNotification("📝 New Task Assigned", `${intern.name} received a new task: ${title}`, intern.email);

  document.getElementById("taskTitle").value = "";
  document.getElementById("assignIntern").value = "";
  document.getElementById("priority").value = "";
  document.getElementById("taskDescription").value = "";
  document.querySelectorAll(".requirements input").forEach(input => input.checked = false);

  closeTaskModal();
  saveAll();
  renderAll();
}

function addNotification(title, message, targetEmail = "manager") {
  notifications.unshift({
    id: Date.now(),
    title,
    message,
    targetEmail,
    time: new Date().toLocaleString()
  });
  saveAll();
}

function getVisibleNotifications() {
  if (currentUser.role === "manager") {
    return notifications.filter(note => note.targetEmail === "manager" || note.targetEmail === "all");
  }
  return notifications.filter(note => note.targetEmail === currentUser.email || note.targetEmail === "all");
}

function clearNotifications() {
  if (currentUser.role === "manager") {
    notifications = notifications.filter(note => note.targetEmail !== "manager" && note.targetEmail !== "all");
  } else {
    notifications = notifications.filter(note => note.targetEmail !== currentUser.email && note.targetEmail !== "all");
  }

  saveAll();
  renderAll();
}

function getStatusText(status) {
  if (status === "todo") return "To Do";
  if (status === "progress") return "In Progress";
  if (status === "review") return "Review";
  if (status === "done") return "Done";
  if (status === "blocked") return "Blocked";
  return status;
}

function startTask(id) {
  const task = tasks.find(item => item.id === id);

  if (!task || currentUser.role !== "intern" || task.internEmail !== currentUser.email) return;

  task.status = "progress";
  task.progress = 40;
  task.timeline.push({ text: "🚀 Intern started the task", time: new Date().toLocaleString() });

  addNotification("🚀 Task Started", `${task.internName} started working on ${task.title}.`, "manager");
  saveAll();
  renderAll();
}

function submitDailyUpdate(id) {
  const task = tasks.find(item => item.id === id);

  if (!task || currentUser.role !== "intern" || task.internEmail !== currentUser.email) return;

  const completed = document.getElementById(`completed-${id}`).value.trim();
  const working = document.getElementById(`working-${id}`).value.trim();
  const blocker = document.getElementById(`blocker-${id}`).value.trim();
  const help = document.getElementById(`help-${id}`).value.trim();

  if (!completed && !working && !blocker && !help) {
    alert("Please add at least one update.");
    return;
  }

  task.dailyUpdate = `Completed: ${completed || "Not mentioned"} | Working on: ${working || "Not mentioned"}`;
  task.blocker = blocker;
  task.helpNeeded = help;

  if (blocker || help) {
    task.status = "blocked";
    task.progress = 35;
    addNotification("⚠️ Blocker Alert", `${task.internName} is blocked in ${task.title}: ${blocker || help}`, "manager");
  } else if (task.status === "todo") {
    task.status = "progress";
    task.progress = 40;
  }

  task.timeline.push({ text: "📌 Daily progress update added", time: new Date().toLocaleString() });
  addNotification("📌 Daily Update", `${task.internName} updated progress for ${task.title}.`, "manager");

  saveAll();
  renderAll();
}

function submitWork(id) {
  const task = tasks.find(item => item.id === id);

  if (!task || currentUser.role !== "intern" || task.internEmail !== currentUser.email) return;

  task.frontendLink = document.getElementById(`frontend-${id}`).value.trim();
  task.backendLink = document.getElementById(`backend-${id}`).value.trim();
  task.liveLink = document.getElementById(`live-${id}`).value.trim();
  task.readme = document.getElementById(`readme-${id}`).value.trim();
  task.screenshots = document.getElementById(`screenshots-${id}`).value.trim();
  task.notes = document.getElementById(`notes-${id}`).value.trim();

  task.status = "review";
  task.progress = 70;
  task.timeline.push({ text: "📤 Intern submitted work for manager review", time: new Date().toLocaleString() });

  addNotification("📤 Submission Received", `${task.internName} submitted ${task.title} for review.`, "manager");

  saveAll();
  closeDetailsModal();
  renderAll();
}

function approveTask(id) {
  if (currentUser.role !== "manager") return;

  const task = tasks.find(item => item.id === id);
  if (!task) return;

  task.status = "done";
  task.progress = 100;
  task.feedback = "✅ Approved. Good work. You are ready for the next task.";
  task.timeline.push({ text: "✅ Manager approved the task", time: new Date().toLocaleString() });

  addNotification("✅ Task Approved", `${task.title} was approved by the manager.`, task.internEmail);

  saveAll();
  renderAll();
}

function requestChanges(id) {
  if (currentUser.role !== "manager") return;

  const feedback = prompt("Enter feedback for rework:");
  if (!feedback) return;

  const task = tasks.find(item => item.id === id);
  if (!task) return;

  task.status = "blocked";
  task.progress = 35;
  task.feedback = feedback;
  task.timeline.push({ text: "⚠️ Manager requested changes / rework", time: new Date().toLocaleString() });

  addNotification("⚠️ Rework Requested", `Manager requested changes in ${task.title}: ${feedback}`, task.internEmail);

  saveAll();
  renderAll();
}

function assignNextTask(email) {
  if (currentUser.role !== "manager") return;
  openTaskModal();
  document.getElementById("assignIntern").value = email;
}

function calculateQuality(task) {
  let score = 0;
  let missing = [];

  if (task.frontendLink || task.backendLink) score += 25;
  else missing.push("GitHub link");

  if (task.liveLink) score += 20;
  else missing.push("Live link");

  if (task.readme) score += 20;
  else missing.push("README");

  if (task.screenshots) score += 20;
  else missing.push("Screenshots");

  if (task.notes) score += 15;
  else missing.push("Explanation note");

  let suggestion = "Request Changes";
  if (score >= 90) suggestion = "Approve";
  else if (score >= 60) suggestion = "Review Manually";

  return { score, missing: missing.length ? missing.join(", ") : "Nothing missing", suggestion };
}

function getProgressLevel(progress) {
  if (progress <= 30) return "Beginner";
  if (progress <= 60) return "Active";
  if (progress <= 85) return "Good Progress";
  return "Completed";
}

function averageProgress(email) {
  const internTasks = tasks.filter(task => task.internEmail === email);
  if (internTasks.length === 0) return 0;
  return Math.round(internTasks.reduce((sum, task) => sum + task.progress, 0) / internTasks.length);
}

function renderStats() {
  const visible = visibleTasks();
  const active = visible.filter(task => task.status !== "done").length;
  const completed = visible.filter(task => task.status === "done").length;

  document.getElementById("taskSummary").innerText = `${active} active tasks — ${completed} completed`;

  if (currentUser.role === "manager") {
    const interns = accounts.filter(user => user.role === "intern");

    document.getElementById("totalInterns").innerText = interns.length;
    document.getElementById("managerTotalTasks").innerText = tasks.length;
    document.getElementById("managerProgressTasks").innerText = tasks.filter(task => task.status === "progress").length;
    document.getElementById("managerReviewTasks").innerText = tasks.filter(task => task.status === "review").length;
    document.getElementById("managerDoneTasks").innerText = tasks.filter(task => task.status === "done").length;
    document.getElementById("managerBlockedTasks").innerText = tasks.filter(task => task.status === "blocked").length;
  } else {
    const myTasks = getMyTasks();
    const progress = averageProgress(currentUser.email);

    document.getElementById("internTotalTasks").innerText = myTasks.length;
    document.getElementById("internActiveTasks").innerText = myTasks.filter(task => task.status === "progress" || task.status === "todo").length;
    document.getElementById("internSubmittedTasks").innerText = myTasks.filter(task => task.status === "review").length;
    document.getElementById("internCompletedTasks").innerText = myTasks.filter(task => task.status === "done").length;
    document.getElementById("internBlockedTasks").innerText = myTasks.filter(task => task.status === "blocked").length;
    document.getElementById("myProgressText").innerText = `${currentUser.name} — Progress: ${progress}% — ${getProgressLevel(progress)}`;
    document.getElementById("myProgressFill").style.width = `${progress}%`;
  }
}

function createEmpty() {
  return `<div class="empty">NO TASKS</div>`;
}

function createTaskCard(task) {
  return `
    <div class="task-card" onclick="openTaskDetails(${task.id})">
      <div class="task-top">
        <h3>${task.title}</h3>
        <span class="priority ${task.priority}">${task.priority}</span>
      </div>
      <p class="meta">${task.description}</p>
      <div class="chips">
        <span class="chip">👤 ${task.internName}</span>
        <span class="status ${task.status}">${getStatusText(task.status)}</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${task.progress}%"></div>
      </div>
      <p class="meta">${task.progress}% completed</p>
    </div>
  `;
}

function renderBoard() {
  const visible = visibleTasks();

  const grouped = {
    todo: visible.filter(task => task.status === "todo"),
    progress: visible.filter(task => task.status === "progress"),
    review: visible.filter(task => task.status === "review"),
    done: visible.filter(task => task.status === "done"),
    blocked: visible.filter(task => task.status === "blocked")
  };

  document.getElementById("todoColumn").innerHTML = grouped.todo.length ? grouped.todo.map(createTaskCard).join("") : createEmpty();
  document.getElementById("progressColumn").innerHTML = grouped.progress.length ? grouped.progress.map(createTaskCard).join("") : createEmpty();
  document.getElementById("reviewColumn").innerHTML = grouped.review.length ? grouped.review.map(createTaskCard).join("") : createEmpty();
  document.getElementById("doneColumn").innerHTML = grouped.done.length ? grouped.done.map(createTaskCard).join("") : createEmpty();
  document.getElementById("blockedColumn").innerHTML = grouped.blocked.length ? grouped.blocked.map(createTaskCard).join("") : createEmpty();

  document.getElementById("todoCount").innerText = grouped.todo.length;
  document.getElementById("progressCount").innerText = grouped.progress.length;
  document.getElementById("reviewCount").innerText = grouped.review.length;
  document.getElementById("doneCount").innerText = grouped.done.length;
  document.getElementById("blockedCount").innerText = grouped.blocked.length;
}

function taskRow(task, isMyTable = false) {
  const quality = calculateQuality(task);

  if (isMyTable) {
    return `
      <tr>
        <td><strong>${task.title}</strong><br><small>${task.description}</small></td>
        <td><span class="priority ${task.priority}">${task.priority}</span></td>
        <td><span class="status ${task.status}">${getStatusText(task.status)}</span></td>
        <td>${task.progress}%</td>
        <td>${task.requirements.join(", ") || "Not specified"}</td>
        <td>${task.feedback || "No feedback"}</td>
        <td><button class="secondary-btn" onclick="openTaskDetails(${task.id})">Open</button></td>
      </tr>
    `;
  }

  return `
    <tr>
      <td><strong>${task.title}</strong><br><small>${task.description}</small></td>
      <td>${task.internName}</td>
      <td><span class="priority ${task.priority}">${task.priority}</span></td>
      <td><span class="status ${task.status}">${getStatusText(task.status)}</span></td>
      <td>${task.progress}%</td>
      <td>Quality: ${quality.score}%<br><small>Missing: ${quality.missing}</small></td>
      <td>${task.feedback || "No feedback"}</td>
      <td><button class="secondary-btn" onclick="openTaskDetails(${task.id})">View</button></td>
    </tr>
  `;
}

function renderTables() {
  const visible = visibleTasks();
  const myTasks = currentUser.role === "intern" ? getMyTasks() : tasks;

  document.getElementById("taskTableBody").innerHTML = visible.length
    ? visible.map(task => taskRow(task)).join("")
    : `<tr><td colspan="8" class="empty">NO TASKS FOUND</td></tr>`;

  document.getElementById("myTaskTableBody").innerHTML = myTasks.length
    ? myTasks.map(task => taskRow(task, true)).join("")
    : `<tr><td colspan="7" class="empty">NO TASKS FOUND</td></tr>`;
}

function renderManagerExtra() {
  if (currentUser.role !== "manager") return;

  const interns = accounts.filter(user => user.role === "intern");

  document.getElementById("internProgressTable").innerHTML = interns.length
    ? interns.map(intern => {
        const internTasks = tasks.filter(task => task.internEmail === intern.email);
        const progress = averageProgress(intern.email);

        return `
          <tr>
            <td>${intern.name}</td>
            <td>${intern.email}</td>
            <td>${internTasks.length}</td>
            <td>${internTasks.filter(task => task.status === "review").length}</td>
            <td>${internTasks.filter(task => task.status === "done").length}</td>
            <td>${internTasks.filter(task => task.status === "blocked").length}</td>
            <td>${progress}% — ${getProgressLevel(progress)}</td>
          </tr>
        `;
      }).join("")
    : `<tr><td colspan="7" class="empty">NO INTERNS CREATED YET</td></tr>`;

  const reviewTasks = tasks.filter(task => task.status === "review");

  document.getElementById("reviewQueue").innerHTML = reviewTasks.length
    ? reviewTasks.map(task => {
        const quality = calculateQuality(task);
        return `
          <div class="queue-card">
            <h3>${task.title}</h3>
            <p class="meta"><strong>Intern:</strong> ${task.internName}</p>
            <p class="meta"><strong>Quality:</strong> ${quality.score}% | Missing: ${quality.missing}</p>
            <div class="actions">
              <button class="success-btn" onclick="approveTask(${task.id})">Approve</button>
              <button class="warning-btn" onclick="requestChanges(${task.id})">Request Changes</button>
            </div>
          </div>
        `;
      }).join("")
    : `<div class="empty">NO SUBMISSIONS FOR REVIEW</div>`;

  const blockedTasks = tasks.filter(task => task.status === "blocked");

  document.getElementById("blockerList").innerHTML = blockedTasks.length
    ? blockedTasks.map(task => `
        <div class="queue-card">
          <h3>⚠️ ${task.internName}</h3>
          <p class="meta"><strong>Task:</strong> ${task.title}</p>
          <p class="meta"><strong>Blocker:</strong> ${task.blocker || task.feedback || "Not specified"}</p>
          <button class="secondary-btn" onclick="openTaskDetails(${task.id})">View</button>
        </div>
      `).join("")
    : `<div class="empty">NO BLOCKERS</div>`;

  const doneTasks = tasks.filter(task => task.status === "done");

  document.getElementById("readyList").innerHTML = doneTasks.length
    ? doneTasks.map(task => `
        <div class="queue-card">
          <h3>✅ ${task.internName}</h3>
          <p class="meta">Completed: ${task.title}</p>
          <button class="primary-btn" onclick="assignNextTask('${task.internEmail}')">Assign Next Task</button>
        </div>
      `).join("")
    : `<div class="empty">NO INTERNS READY YET</div>`;
}

function renderTimeline() {
  const visible = visibleTasks();
  const items = [];

  visible.forEach(task => {
    task.timeline.forEach(item => {
      items.push({ ...item, title: task.title, intern: task.internName });
    });
  });

  document.getElementById("timelineTitle").innerText = currentUser.role === "manager"
    ? "🧾 Manager Activity Timeline"
    : "🧾 My Timeline";

  document.getElementById("timelineList").innerHTML = items.length
    ? items.reverse().map(item => `
        <div class="timeline-card">
          <strong>${item.text}</strong>
          <p class="meta">${item.intern} — ${item.title}</p>
          <span>${item.time}</span>
        </div>
      `).join("")
    : `<div class="empty">NO TIMELINE YET</div>`;
}

function openTaskDetails(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  if (currentUser.role === "intern" && task.internEmail !== currentUser.email) return;

  const quality = calculateQuality(task);
  document.getElementById("modalTitle").innerText = task.title;

  document.getElementById("modalContent").innerHTML = `
    <div class="modal-section">
      <h3>📌 Task Details</h3>
      <p><strong>Intern:</strong> ${task.internName}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Status:</strong> ${getStatusText(task.status)}</p>
      <p><strong>Description:</strong> ${task.description}</p>
      <p><strong>Required:</strong> ${task.requirements.join(", ") || "Not specified"}</p>
    </div>

    <div class="modal-section">
      <h3>📊 Progress</h3>
      <div class="progress-track">
        <div class="progress-fill" style="width:${task.progress}%"></div>
      </div>
      <p>${task.progress}% completed</p>
    </div>

    ${
      currentUser.role === "intern"
      ? `
        <div class="modal-section">
          <h3>📌 Daily Update</h3>
          <div class="submission-form">
            <input id="completed-${task.id}" placeholder="Today I completed" />
            <input id="working-${task.id}" placeholder="Currently working on" />
            <input id="blocker-${task.id}" placeholder="Blockers" />
            <input id="help-${task.id}" placeholder="Need help with" />
            <button class="primary-btn" onclick="submitDailyUpdate(${task.id})">Submit Daily Update</button>
          </div>
        </div>

        <div class="modal-section">
          <h3>📤 Submit / Resubmit Work</h3>
          <div class="submission-form">
            <input id="frontend-${task.id}" placeholder="Frontend GitHub link" value="${task.frontendLink}" />
            <input id="backend-${task.id}" placeholder="Backend GitHub link" value="${task.backendLink}" />
            <input id="live-${task.id}" placeholder="Live deployed link" value="${task.liveLink}" />
            <input id="readme-${task.id}" placeholder="README link or note" value="${task.readme}" />
            <input id="screenshots-${task.id}" placeholder="Screenshot link" value="${task.screenshots}" />
            <textarea id="notes-${task.id}" placeholder="Notes or doubts">${task.notes}</textarea>
            <button class="primary-btn" onclick="submitWork(${task.id})">Submit Work</button>
          </div>
        </div>
      `
      : `
        <div class="modal-section">
          <h3>🤖 AI Submission Quality Check</h3>
          <p><strong>Score:</strong> ${quality.score}%</p>
          <p><strong>Missing:</strong> ${quality.missing}</p>
          <p><strong>Suggested Action:</strong> ${quality.suggestion}</p>
        </div>

        <div class="modal-section">
          <h3>📤 Submitted Proof</h3>
          <p><strong>Frontend:</strong> ${task.frontendLink || "Not submitted"}</p>
          <p><strong>Backend:</strong> ${task.backendLink || "Not submitted"}</p>
          <p><strong>Live:</strong> ${task.liveLink || "Not submitted"}</p>
          <p><strong>README:</strong> ${task.readme || "Not submitted"}</p>
          <p><strong>Screenshots:</strong> ${task.screenshots || "Not submitted"}</p>
          <p><strong>Notes:</strong> ${task.notes || "No notes"}</p>
          <div class="actions">
            <button class="success-btn" onclick="approveTask(${task.id})">Approve</button>
            <button class="warning-btn" onclick="requestChanges(${task.id})">Request Changes</button>
          </div>
        </div>
      `
    }

    <div class="modal-section">
      <h3>💬 Manager Feedback</h3>
      <p>${task.feedback || "No feedback yet."}</p>
    </div>
  `;

  document.getElementById("detailsModal").style.display = "flex";
}

function renderNotifications() {
  const visible = getVisibleNotifications();

  document.getElementById("allNotifications").innerHTML = visible.length
    ? visible.map(note => `
        <div class="notification-card">
          <h3>${note.title}</h3>
          <p>${note.message}</p>
          <p><small>${note.time}</small></p>
        </div>
      `).join("")
    : `<div class="empty">NO NOTIFICATIONS</div>`;
}

function renderAll() {
  if (!currentUser) return;

  setupNav();
  renderStats();
  renderBoard();
  renderTables();
  renderManagerExtra();
  renderTimeline();
  renderNotifications();
}

if (currentUser) {
  openApp();
} else {
  document.getElementById("authPage").classList.remove("hidden");
  document.getElementById("appPage").classList.add("hidden");
}
