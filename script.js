// Tab Switching
function openTab(tabId) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

// Timer Logic
let timer;
let timerSeconds = 1500;

function startTimer() {
  clearInterval(timer);
  let timeLeft = timerSeconds;
  const timerDisplay = document.getElementById('timerDisplay');

  function update() {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
    if (timeLeft > 0) timeLeft--;
    else clearInterval(timer);
  }

  update();
  timer = setInterval(update, 1000);
}

// Quote Generator (no repeat for 10 days)
const quotes = [
  "Touch the sky with glory.",
  "Survival of the fittest – Darwin.",
  "Veer bhogya vasundhara.",
  "Sheelam param bhooshanam.",
  "Every move must have a purpose.",
  "Without error, there is no brilliancy.",
  "The world obeys only one law: POWER.",
  "Padhna hai, phodna hai, kehar macha dena hai!",
  "Aag laga deni hai.",
  "Hazaron ki bheed se ubhar ke aaunga.",
  "Mujhme kabiliyat hai, mai kar ke dikhaunga."
];

function getRandomQuote() {
  let recent = JSON.parse(localStorage.getItem('recentQuotes') || '[]');
  let available = quotes.filter(q => !recent.includes(q));

  if (available.length === 0) {
    recent = [];
    available = [...quotes];
  }

  const quote = available[Math.floor(Math.random() * available.length)];
  document.getElementById('quote').textContent = quote;
  recent.push(quote);

  if (recent.length > 10) recent.shift();
  localStorage.setItem('recentQuotes', JSON.stringify(recent));
}

// Lock & Unlock Journal
function unlockJournal() {
  const password = document.getElementById('passwordInput').value;
  if (password === 'jai bhavani') {
    document.getElementById('lockedJournal').style.display = 'none';
    document.getElementById('unlockedJournal').style.display = 'block';
  } else {
    alert("Wrong password. Try again.");
  }
}

// Add Quick Note
function addQuickNote() {
  const note = prompt("Write your note:");
  if (note) {
    const notes = document.getElementById('notesList');
    const li = document.createElement('li');
    li.textContent = note;
    notes.appendChild(li);
  }
}

// Add Task
function addTask() {
  const task = prompt("Enter a new task:");
  if (task) {
    const ul = document.getElementById('taskList');
    const li = document.createElement('li');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.onchange = updateTaskStats;
    li.appendChild(cb);
    li.appendChild(document.createTextNode(" " + task));
    ul.appendChild(li);
    updateTaskStats();
  }
}

function updateTaskStats() {
  const all = document.querySelectorAll('#taskList input');
  const done = document.querySelectorAll('#taskList input:checked');
  document.getElementById('taskCount').textContent = `${done.length} / ${all.length}`;
}

// Save Stotra
function saveStotra() {
  const content = document.getElementById('stotraInput').value;
  localStorage.setItem('dailyStotra', content);
  alert("Stotra saved!");
}

function loadStotra() {
  document.getElementById('stotraInput').value = localStorage.getItem('dailyStotra') || "";
}

// On Load
window.onload = function () {
  getRandomQuote();
  loadStotra();
  updateTaskStats();
  startTimer();
};
