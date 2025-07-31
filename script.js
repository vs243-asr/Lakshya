// DOM references
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');
const dateDisplay = document.getElementById('date-display');
const journalUnlockInput = document.getElementById('journal-password');
const journalEntry = document.getElementById('journal-entry');
const quoteDisplay = document.getElementById('quote');
const shlokaText = document.getElementById('shloka');
const saveShlokaBtn = document.getElementById('save-shloka');
const addTaskBtn = document.getElementById('add-task');
const taskText = document.getElementById('task-text');
const taskList = document.getElementById('task-list');
const timer = document.getElementById('timer-preview');
const startPomodoro = document.getElementById('start-timer');
const pomodoroClock = document.getElementById('pomodoro-clock');
const subjectInput = document.getElementById('subject-input');
const addSubjectBtn = document.getElementById('add-subject');
const subjectsContainer = document.getElementById('subjects-container');
const noteDateInput = document.getElementById('note-date');
const noteContent = document.getElementById('note-content');
const saveNoteBtn = document.getElementById('save-note');
const chartCanvas = document.getElementById('study-graph');

// LocalStorage keys
const STORAGE_KEYS = {
  tasks: 'lakshya_tasks',
  journal: 'lakshya_journal',
  shloka: 'lakshya_shloka',
  syllabus: 'lakshya_syllabus',
  notes: 'lakshya_notes',
  stats: 'lakshya_stats',
  quotes: 'lakshya_quotes'
};

// Tabs
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Date Display
const today = new Date();
dateDisplay.textContent = today.toDateString();

// Journal Lock
journalUnlockInput.addEventListener('input', () => {
  if (journalUnlockInput.value === 'jai bhavani') {
    journalEntry.classList.remove('hidden');
    journalUnlockInput.value = '';
  }
});

// Motivational Quotes
const motivationalQuotes = [
  "Touch the sky with glory",
  "Survival of the fittest - Darwin",
  "Veer Bhogya Vasundhara",
  "Sheelam Param Bhooshanam",
  "Every move must have a purpose",
  "Without error there is no brilliancy",
  "The world obeys only one law: POWER",
  "Hazaron ki bheed se ubhar ke aaunga, Mujh me kabiliyat hai mai kar ke dikhaunga",
  "If you want to rise like the Sun, first burn like the Sun."
];

function getTodayQuote() {
  const day = new Date().getDate();
  return motivationalQuotes[day % motivationalQuotes.length];
}

quoteDisplay.textContent = getTodayQuote();

// Shloka Save
saveShlokaBtn.addEventListener('click', () => {
  localStorage.setItem(STORAGE_KEYS.shloka, shlokaText.value);
});

// Load Shloka
shlokaText.value = localStorage.getItem(STORAGE_KEYS.shloka) || '';

// Tasks
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks)) || [];
  taskList.innerHTML = '';
  tasks.forEach((task, idx) => {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => {
      tasks[idx].done = checkbox.checked;
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    });
    li.appendChild(checkbox);
    li.append(task.text);
    taskList.appendChild(li);
  });
}

addTaskBtn.addEventListener('click', () => {
  const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks)) || [];
  tasks.push({ text: taskText.value, done: false });
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  taskText.value = '';
  loadTasks();
});

loadTasks();

// Pomodoro Timer
let interval;
let timeLeft = 1500; // 25 mins

function startTimer(seconds) {
  clearInterval(interval);
  timeLeft = seconds;
  updateTimerDisplay();
  interval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(interval);
      alert("Time's up!");
      updateStudyStats(25);
    } else {
      timeLeft--;
      updateTimerDisplay();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const min = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const sec = String(timeLeft % 60).padStart(2, '0');
  timer.textContent = `${min}:${sec}`;
  pomodoroClock.textContent = `${min}:${sec}`;
}

startPomodoro.addEventListener('click', () => {
  startTimer(25 * 60);
});

updateTimerDisplay();

// Syllabus and Subjects
function loadSubjects() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.syllabus)) || {};
  subjectsContainer.innerHTML = '';
  Object.keys(data).forEach(subject => {
    const card = document.createElement('div');
    card.classList.add('subject-card');
    const title = document.createElement('h3');
    title.textContent = subject;
    card.appendChild(title);
    data[subject].forEach((chapter, index) => {
      const div = document.createElement('div');
      div.classList.add('chapter-row');
      div.innerHTML = `
        <strong>${chapter.name}</strong><br/>
        <label><input type="checkbox" ${chapter.lecture ? "checked" : ""}/> Lecture</label>
        <label><input type="checkbox" ${chapter.notes ? "checked" : ""}/> Notes</label>
        <label><input type="checkbox" ${chapter.questions ? "checked" : ""}/> Questions</label>
        <label><input type="checkbox" ${chapter.revision ? "checked" : ""}/> Revision</label>
      `;
      const inputs = div.querySelectorAll('input');
      inputs.forEach((input, i) => {
        input.addEventListener('change', () => {
          const field = ['lecture', 'notes', 'questions', 'revision'][i];
          data[subject][index][field] = input.checked;
          localStorage.setItem(STORAGE_KEYS.syllabus, JSON.stringify(data));
        });
      });
      card.appendChild(div);
    });
    subjectsContainer.appendChild(card);
  });
}

addSubjectBtn.addEventListener('click', () => {
  const name = subjectInput.value.trim();
  if (!name) return;
  const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.syllabus)) || {};
  if (!data[name]) data[name] = [];
  const chapterName = prompt("Enter chapter name:");
  if (chapterName) {
    data[name].push({
      name: chapterName,
      lecture: false,
      notes: false,
      questions: false,
      revision: false
    });
  }
  localStorage.setItem(STORAGE_KEYS.syllabus, JSON.stringify(data));
  subjectInput.value = '';
  loadSubjects();
});

loadSubjects();

// Notes
saveNoteBtn.addEventListener('click', () => {
  const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.notes)) || {};
  notes[noteDateInput.value] = noteContent.value;
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
});

// Progress Analysis
function updateStudyStats(hours) {
  const stats = JSON.parse(localStorage.getItem(STORAGE_KEYS.stats)) || {
    totalHours: 0,
    streak: 0,
    lastActiveDay: null
  };
  stats.totalHours += hours;
  const today = new Date().toDateString();
  if (stats.lastActiveDay !== today) {
    stats.streak += 1;
    stats.lastActiveDay = today;
  }
  localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
  renderChart(stats);
}

function renderChart(stats) {
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Study Hours'],
      datasets: [{
        label: 'Hours this month',
        data: [stats.totalHours],
        backgroundColor: '#4fc3f7'
      }]
    }
  });
}

window.addEventListener('load', () => {
  const stats = JSON.parse(localStorage.getItem(STORAGE_KEYS.stats)) || {
    totalHours: 0,
    streak: 0,
    lastActiveDay: null
  };
  renderChart(stats);
});
