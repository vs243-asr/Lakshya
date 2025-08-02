document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("main");
  const buttons = document.querySelectorAll("nav button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      sections.forEach(sec => sec.classList.remove("active"));
      document.getElementById(target).classList.add("active");
    });
  });

  // ---------------- Pomodoro Timer ----------------
  let timer;
  let timeLeft = 1500; // 25 minutes
  const display = document.getElementById("timerDisplay");

  function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    display.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  document.getElementById("startTimer").addEventListener("click", () => {
    clearInterval(timer);
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimer();
      } else {
        clearInterval(timer);
        alert("Time's up!");
      }
    }, 1000);
  });

  document.getElementById("resetTimer").addEventListener("click", () => {
    clearInterval(timer);
    timeLeft = 1500;
    updateTimer();
  });

  updateTimer();

  // ---------------- Task Manager ----------------
  document.getElementById("addTask").addEventListener("click", () => {
    const input = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");

    if (input.value.trim() === "") return;

    const li = document.createElement("li");
    li.className = "task-item";
    li.innerHTML = `<span>${input.value}</span> <button class="delete">Delete</button>`;
    taskList.appendChild(li);

    li.querySelector(".delete").addEventListener("click", () => li.remove());

    input.value = "";
  });

  // ---------------- Journal ----------------
  const journalEntry = document.getElementById("journalEntry");

  document.getElementById("saveJournal").addEventListener("click", () => {
    localStorage.setItem("lakshya_journal", journalEntry.value);
    alert("Journal saved!");
  });

  document.getElementById("loadJournal").addEventListener("click", () => {
    journalEntry.value = localStorage.getItem("lakshya_journal") || "";
  });

  // ---------------- Password Journal ----------------
  document.getElementById("savePassword").addEventListener("click", () => {
    const site = document.getElementById("siteName").value;
    const user = document.getElementById("userName").value;
    const pass = document.getElementById("passwordText").value;

    if (site && user && pass) {
      const entry = `${site} | ${user} | ${pass}\n`;
      const current = localStorage.getItem("lakshya_passwords") || "";
      localStorage.setItem("lakshya_passwords", current + entry);
      alert("Saved!");
    }
  });

  document.getElementById("loadPasswords").addEventListener("click", () => {
    alert(localStorage.getItem("lakshya_passwords") || "No passwords saved.");
  });

  // ---------------- Syllabus Tracker ----------------
  document.getElementById("addSyllabus").addEventListener("click", () => {
    const input = document.getElementById("syllabusInput");
    const list = document.getElementById("syllabusList");

    if (input.value.trim() === "") return;

    const item = document.createElement("div");
    item.className = "syllabus-item";
    item.innerHTML = `<span>${input.value}</span> <input type="checkbox">`;
    list.appendChild(item);

    input.value = "";
  });

  // ---------------- Chart ----------------
  const ctx = document.getElementById("progressChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Tasks", "Syllabus", "Pomodoros"],
      datasets: [{
        label: "Progress",
        backgroundColor: ["#4da6ff", "#80d4ff", "#b3ecff"],
        data: [5, 3, 7],
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
