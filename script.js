document.addEventListener("DOMContentLoaded", function () {
  const dateDisplay = document.getElementById("dateDisplay");
  const tabs = document.querySelectorAll("nav button");
  const tabContents = document.querySelectorAll(".tab-content");

  // Display today's date
  dateDisplay.textContent = new Date().toDateString();

  // Tab navigation
  tabs.forEach(button => {
    button.addEventListener("click", () => {
      tabs.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const target = button.getAttribute("data-target");
      tabContents.forEach(tab => {
        tab.classList.remove("active");
        if (tab.id === target) tab.classList.add("active");
      });
    });
  });

  // TO-DO List
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTask");
  const todoList = document.getElementById("todoList");

  addTaskBtn.addEventListener("click", () => {
    if (taskInput.value.trim() === "") return;
    const li = document.createElement("li");
    li.innerHTML = `<span>${taskInput.value}</span>
      <button onclick="this.parentElement.remove()">❌</button>`;
    todoList.appendChild(li);
    taskInput.value = "";
    saveData("todoList", todoList.innerHTML);
  });

  // Journal (password-protected)
  const journalPassword = document.getElementById("journalPassword");
  const unlockJournal = document.getElementById("unlockJournal");
  const journalEntry = document.getElementById("journalEntry");

  unlockJournal.addEventListener("click", () => {
    if (journalPassword.value === "1234") {
      journalEntry.removeAttribute("disabled");
    } else {
      alert("Wrong password");
    }
  });

  journalEntry.addEventListener("input", () => {
    saveData("journalEntry", journalEntry.value);
  });

  // Study Timer
  let timer;
  const startTimer = document.getElementById("startTimer");
  const stopTimer = document.getElementById("stopTimer");
  const timerDisplay = document.getElementById("timerDisplay");

  startTimer.addEventListener("click", () => {
    let minutes = parseInt(document.getElementById("studyMinutes").value);
    if (isNaN(minutes) || minutes <= 0) return;
    let seconds = minutes * 60;

    clearInterval(timer);
    timer = setInterval(() => {
      if (seconds <= 0) {
        clearInterval(timer);
        alert("Study session complete!");
      }
      let m = Math.floor(seconds / 60);
      let s = seconds % 60;
      timerDisplay.textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      seconds--;
    }, 1000);
  });

  stopTimer.addEventListener("click", () => {
    clearInterval(timer);
    timerDisplay.textContent = "00:00";
  });

  // Subject Tracker
  const addSubject = document.getElementById("addSubject");
  const subjectInput = document.getElementById("subjectInput");
  const subjectsContainer = document.getElementById("subjectsContainer");

  addSubject.addEventListener("click", () => {
    if (subjectInput.value.trim() === "") return;

    const div = document.createElement("div");
    div.classList.add("subject");
    div.innerHTML = `
      <h4>${subjectInput.value}</h4>
      <label>Topics: <input type="text" placeholder="Enter topics covered" /></label><br/>
      <label>Progress: <input type="number" max="100" min="0" placeholder="0-100%" /></label><br/>
      <button onclick="this.parentElement.remove()">❌ Remove</button>
    `;
    subjectsContainer.appendChild(div);
    subjectInput.value = "";
    saveData("subjectsContainer", subjectsContainer.innerHTML);
  });

  // Chart (Dummy data)
  const ctx = document.getElementById("studyChart").getContext("2d");
  const studyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Hours Studied",
        data: [1, 2, 1.5, 3, 2.5, 4, 3],
        backgroundColor: "#ffb4a2"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 6
        }
      }
    }
  });

  // Journal auto-load
  journalEntry.value = localStorage.getItem("journalEntry") || "";
  todoList.innerHTML = localStorage.getItem("todoList") || "";
  subjectsContainer.innerHTML = localStorage.getItem("subjectsContainer") || "";

  // Data save function
  function saveData(key, data) {
    localStorage.setItem(key, data);
  }
});
