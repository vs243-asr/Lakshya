// ---------------- TAB SWITCHING ----------------
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
}

// ---------------- DAILY QUOTE ----------------
const quotes = [
  "Push yourself, because no one else is going to do it for you.",
  "Dream big. Work hard. Stay focused.",
  "Lakshya paane ke liye manzil dikhni chahiye.",
  "Discipline is the bridge between goals and success.",
  "Don't watch the clock; do what it does. Keep going.",
  "One day or day one. You decide.",
  "Clarity. Consistency. Confidence. Lakshya.",
  "Touch the sky with glory.",
  "Veer Bhogya Vasundhara.",
  "Sheelam Param Bhooshanam.",
  "Without error there is no brilliancy.",
  "The world obeys only one law: POWER.",
  "Hazaron ki bheed se ubhar ke aaunga...",
  "If you want to rise like the Sun, first burn like the Sun."
];
function showQuote() {
  const usedQuotes = JSON.parse(localStorage.getItem('usedQuotes') || '[]');
  const available = quotes.filter(q => !usedQuotes.includes(q));
  const quote = available.length ? available[Math.floor(Math.random() * available.length)] : quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quoteBox").innerText = quote;
  if (!usedQuotes.includes(quote)) {
    usedQuotes.push(quote);
    if (usedQuotes.length >= quotes.length) usedQuotes.splice(0, usedQuotes.length - 9);
    localStorage.setItem("usedQuotes", JSON.stringify(usedQuotes));
  }
}

// ---------------- TASK CHECKLIST ----------------
function addTask() {
  const input = document.getElementById("taskInput");
  if (input.value.trim() !== "") {
    const list = document.getElementById("taskList");
    const li = document.createElement("li");
    li.innerHTML = `<label><input type="checkbox" onchange="updateTaskStats()"> ${input.value}</label>`;
    list.appendChild(li);
    input.value = "";
    updateTaskStats();
  }
}
function clearTasks() {
  document.getElementById("taskList").innerHTML = "";
  updateTaskStats();
}
function updateTaskStats() {
  const all = document.querySelectorAll('#taskList input');
  const done = document.querySelectorAll('#taskList input:checked');
  document.getElementById("todayTaskStats").innerText = `Today's Tasks: ${done.length}/${all.length}`;
  document.getElementById("taskPerformance").innerText = `Total: ${all.length} | Done: ${done.length} | Overdue: ${Math.max(0, all.length - done.length)}`;
}

// ---------------- JOURNAL LOCK ----------------
function unlockJournal() {
  const pw = prompt("Enter password to unlock journal");
  if (pw === "jai bhavani") {
    document.getElementById("journalEntry").style.display = "block";
    document.getElementById("lockedNote").style.display = "none";
  } else {
    alert("Incorrect password");
  }
}

// ---------------- STOTRA CARD ----------------
function updateStotraCard() {
  const stotra = localStorage.getItem("dailyStotra") || '';
  document.getElementById("stotraCard").innerText = stotra;
}
function saveStotra() {
  const val = document.getElementById("stotraInput").value;
  localStorage.setItem("dailyStotra", val);
  updateStotraCard();
}

// ---------------- POMODORO TIMER ----------------
let timer;
let timeLeft = 0;
let activeSubject = "";
function startPomodoro(subject) {
  clearInterval(timer);
  activeSubject = subject;
  timeLeft = parseInt(prompt("Enter Pomodoro duration in minutes:")) * 60;
  timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("Pomodoro complete for " + subject);
      logTime(subject);
    } else {
      timeLeft--;
      updateTimerDisplay();
    }
  }, 1000);
}
function updateTimerDisplay() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  document.getElementById("timerDisplay").innerText = `${min}:${sec < 10 ? "0" : ""}${sec}`;
}
function resetTimer() {
  clearInterval(timer);
  document.getElementById("timerDisplay").innerText = "0:00";
}

// ---------------- SUBJECT LOG & GRAPH ----------------
let subjectLogs = JSON.parse(localStorage.getItem("subjectLogs") || '{}');
function logTime(subject) {
  subjectLogs[subject] = (subjectLogs[subject] || 0) + Math.floor(timeLeft / 60);
  localStorage.setItem("subjectLogs", JSON.stringify(subjectLogs));
  renderSubjectChart();
}
function renderSubjectChart() {
  const ctx = document.getElementById("subjectChart").getContext("2d");
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(subjectLogs),
      datasets: [{
        label: 'Minutes Studied',
        data: Object.values(subjectLogs),
        backgroundColor: '#5390d9'
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
}

// ---------------- SYLLABUS TRACKER ----------------
let syllabus = JSON.parse(localStorage.getItem("syllabus") || '{}');
function addSubject() {
  const subject = prompt("Enter new subject name");
  if (subject && !syllabus[subject]) {
    syllabus[subject] = [];
    localStorage.setItem("syllabus", JSON.stringify(syllabus));
    renderSyllabus();
  }
}
function addChapter(subject) {
  const chapter = prompt("Enter chapter name");
  if (chapter) {
    syllabus[subject].push({ name: chapter, done: [false, false, false, false] });
    localStorage.setItem("syllabus", JSON.stringify(syllabus));
    renderSyllabus();
  }
}
function toggleCheckbox(subject, chapterIdx, boxIdx) {
  syllabus[subject][chapterIdx].done[boxIdx] = !syllabus[subject][chapterIdx].done[boxIdx];
  localStorage.setItem("syllabus", JSON.stringify(syllabus));
  renderSyllabus();
  updateProgressChart();
}
function renderSyllabus() {
  const container = document.getElementById("syllabusContainer");
  container.innerHTML = "";
  for (let subject in syllabus) {
    const subDiv = document.createElement("div");
    subDiv.innerHTML = `<h3>${subject} <button onclick="addChapter('${subject}')">+ Add Chapter</button></h3>`;
    syllabus[subject].forEach((ch, i) => {
      const row = document.createElement("div");
      row.innerHTML = `${ch.name}: ` + ["Lecture", "Notes", "Questions", "Revision"].map((t, j) => `
        <label><input type='checkbox' ${ch.done[j] ? "checked" : ""} onchange="toggleCheckbox('${subject}', ${i}, ${j})"> ${t}</label>
      `).join(" ");
      subDiv.appendChild(row);
    });
    container.appendChild(subDiv);
  }
}

// ---------------- SYLLABUS PROGRESS CHART ----------------
function updateProgressChart() {
  const ctx = document.getElementById("progressChart").getContext("2d");
  const labels = [], data = [];
  for (let subject in syllabus) {
    const total = syllabus[subject].length * 4;
    const done = syllabus[subject].reduce((sum, ch) => sum + ch.done.filter(Boolean).length, 0);
    labels.push(subject);
    data.push(Math.floor((done / total) * 100));
  }
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '% Syllabus Completed',
        data: data,
        backgroundColor: '#0077b6'
      }]
    },
    options: { scales: { y: { beginAtZero: true, max: 100 } } }
  });
}

// ---------------- STATS & GOALS ----------------
function updateStatsPanel() {
  const consistency = 21, hours = 86, tasks = 64;
  document.getElementById("monthlyConsistency").innerText = `${consistency}/30 Days`;
  document.getElementById("monthlyHours").innerText = `${hours}/120 Hours`;
  document.getElementById("monthlyTasks").innerText = `${tasks}/100 Tasks`;
}

// ---------------- INIT APP ----------------
function initializeApp() {
  showQuote();
  renderSubjectChart();
  updateStatsPanel();
  renderSyllabus();
  updateStotraCard();
  updateTaskStats();
  updateProgressChart();
}
