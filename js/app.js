const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyText = document.getElementById("emptyText");
const progressFill = document.getElementById("progressFill");
const progressTrack = document.getElementById("progressTrack");
const completedCount = document.getElementById("completedCount");
const totalCount = document.getElementById("totalCount");
const progressTitle = document.getElementById("progressTitle");
const progressMessage = document.getElementById("progressMessage");
const taskPill = document.getElementById("taskPill");
const allFilterCount = document.getElementById("allFilterCount");
const activeFilterCount = document.getElementById("activeFilterCount");
const doneFilterCount = document.getElementById("doneFilterCount");
const clearCompletedButton = document.getElementById("clearCompleted");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const toast = document.getElementById("toast");

let tasks = loadTasks();
let currentFilter = "all";
let toastTimeout;

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem("taskbloom-tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem("taskbloom-tasks", JSON.stringify(tasks));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }
  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }
  return tasks;
}

function renderTasks() {
  taskList.innerHTML = "";
  const visibleTasks = getVisibleTasks();

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task-item" + (task.completed ? " completed" : "");
    item.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark " + task.text + " as completed");
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const textWrap = document.createElement("div");
    textWrap.className = "task-text";
    textWrap.textContent = task.text;

    const meta = document.createElement("span");
    meta.className = "task-meta";
    meta.textContent = task.completed
      ? "Nicely done! ✨"
      : "One step at a time";
    textWrap.appendChild(meta);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.innerHTML = "&#10005;";
    deleteButton.setAttribute("aria-label", "Delete " + task.text);
    deleteButton.title = "Delete task";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(checkbox, textWrap, deleteButton);
    taskList.appendChild(item);
  });

  const completed = tasks.filter((task) => task.completed).length;
  const total = tasks.length;
  const active = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  completedCount.textContent = completed;
  totalCount.textContent = total;
  allFilterCount.textContent = total;
  activeFilterCount.textContent = active;
  doneFilterCount.textContent = completed;
  taskPill.textContent = total + (total === 1 ? " task" : " tasks");
  progressFill.style.width = percentage + "%";
  progressTrack.setAttribute("aria-valuenow", percentage);

  if (total === 0) {
    progressTitle.textContent = "A fresh start 🌱";
    progressMessage.textContent =
      "Every little step counts. Add your first task!";
  } else if (completed === total) {
    progressTitle.textContent = "You did it! 🌷";
    progressMessage.textContent =
      "All tasks are complete. Take a little moment to celebrate!";
  } else if (completed === 0) {
    progressTitle.textContent = "Let's get growing 🌱";
    progressMessage.textContent =
      "You're just getting started. Pick one task and begin.";
  } else {
    progressTitle.textContent = "Look at you grow 🌼";
    progressMessage.textContent =
      percentage + "% complete — keep that lovely momentum going!";
  }

  emptyState.hidden = visibleTasks.length > 0;
  if (currentFilter === "active") {
    emptyTitle.textContent = "Nothing left in progress!";
    emptyText.textContent =
      "You've finished all your active tasks. Lovely work!";
  } else if (currentFilter === "completed") {
    emptyTitle.textContent = "No completed tasks yet.";
    emptyText.textContent = "When you finish a task, you'll find it here.";
  } else {
    emptyTitle.textContent = "Your list is a blank canvas.";
    emptyText.textContent =
      "Add a task above and give your day a little direction.";
  }

  clearCompletedButton.disabled = completed === 0;
  clearCompletedButton.style.opacity = completed === 0 ? "0.45" : "1";
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
    button.setAttribute(
      "aria-pressed",
      button.dataset.filter === currentFilter ? "true" : "false",
    );
  });
}

function addTask(text) {
  const cleanText = text.trim();
  if (!cleanText) {
    showToast("Write a task first 🌱");
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    text: cleanText,
    completed: false,
  });
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
  showToast("A new little goal added ✨");
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  renderTasks();
  showToast(
    task.completed
      ? "Task complete — well done! 🌷"
      : "Task moved back to your list",
  );
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
  showToast("Task removed");
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value);
});

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  const before = tasks.length;
  tasks = tasks.filter((task) => !task.completed);
  if (tasks.length !== before) {
    saveTasks();
    renderTasks();
    showToast("Completed tasks cleared");
  }
});

function setTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeIcon.textContent = isDark ? "☀" : "☾";
  themeToggle.querySelector(".theme-label").textContent = isDark
    ? "Light mode"
    : "Dark mode";
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode",
  );
  localStorage.setItem("taskbloom-theme", isDark ? "dark" : "light");
}

themeToggle.addEventListener("click", () => {
  setTheme(!document.body.classList.contains("dark"));
});

setTheme(localStorage.getItem("taskbloom-theme") === "dark");
document.getElementById("todayDate").textContent = new Intl.DateTimeFormat(
  "en",
  {
    weekday: "short",
    month: "short",
    day: "numeric",
  },
).format(new Date());

renderTasks();
