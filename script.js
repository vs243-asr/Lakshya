// ========= Initialization ==========
document.addEventListener('DOMContentLoaded', () => {
  showDate();
  switchTab('dashboard');
  loadShloka();
  loadMotivation();
  loadJournal();
  loadTasks();
  loadSubjects();
  loadNotes();
  loadPomodoro();
  loadProgressCharts();
});

// ========= Tab Navigation ==========
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.getElementById(tab).style.display = 'block';
  localStorage.setItem('activeTab', tab);
}

// ========= Date & Day Display ==========
function showDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  document.getElementById('dateDisplay').innerText = now.toLocaleDateString('en-US', options);
}

// ========= Motivational Quotes ==========
const quotes = [
  "Touch the sky with glory",
  "Survival of the fittest – Darwin",
  "Veer Bhogya Vasundhara",
  "Sheelam Param Bhooshanam",
  "Every move must have a purpose",
  "Without error there is no brilliancy",
  "The world obeys only one law: POWER",
  "Hazaron ki bheed se ubhar ke aaunga, Mujh me kabiliyat hai mai kar ke dikhaunga",
  "If you want to rise like the Sun, first burn like the Sun."
];

function loadMotivation() {
  let recent = JSON.parse(localStorage.getItem('recentQuotes') || '[]');
  const unused = quotes.filter(q => !recent.includes(q));
  const quote = unused[Math.floor(Math.random() * unused.length)];
  document.getElementById('motivationalQuote').innerText = quote;
  recent.push(quote);
  if (recent.length > 10) recent.shift();
  localStorage.setItem('recentQuotes', JSON.stringify(recent));
}

// ========= Shloka Card ==========
function loadShloka() {
  document.getElementById('shlokaInput').value = localStorage.getItem('shloka') || '';
}
function saveShloka() {
  const shloka = document.getElementById('shlokInput').value;
  localStorage.setItem('shloka', shloka);
  alert('Shloka saved successfully!');
}

// ========= Journal Lock ==========
function unlockJournal() {
  const pw = prompt('Enter password to unlock journal:');
  if (pw === 'jai bhavani') {
    document.getElementById('lockSection').style.display = 'none';
    document.getElementById('journalSection').style.display = 'block';
  } else {
    alert('Wrong password');
  }
}
function saveJournal() {
  const content = document.getElementById('dailyNote').value;
  const dateKey = new Date().toISOString().split('T')[0];
  localStorage.setItem(`journal-${dateKey}`, content);
  alert('Saved!');
}
function loadJournal() {
  const dateKey = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem(`journal-${dateKey}`) || '';
  document.getElementById('dailyNote').value = saved;
}
// ========= To-Do List ==========
function loadTasks() {
  const today = getDateKey();
  const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');

  // Carry forward uncompleted tasks
  const yesterday = getDateKey(-1);
  if (tasks[yesterday]) {
    const carry = tasks[yesterday].filter(t => !t.done);
    if (!tasks[today]) tasks[today] = [];
    carry.forEach(t => tasks[today].push({ ...t }));
    delete tasks[yesterday];
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  renderTasks();
}

function getDateKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const taskText = taskInput.value.trim();
  if (!taskText) return;
  const dateKey = getDateKey();
  const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
  if (!tasks[dateKey]) tasks[dateKey] = [];
  tasks[dateKey].push({ text: taskText, done: false });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  taskInput.value = '';
  renderTasks();
}

function toggleTask(index) {
  const dateKey = getDateKey();
  const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
  tasks[dateKey][index].done = !tasks[dateKey][index].done;
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
  const todayTasks = tasks[getDateKey()] || [];
  todayTasks.forEach((task, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<input type="checkbox" ${task.done ? 'checked' : ''} onclick="toggleTask(${i})"> ${task.text}`;
    list.appendChild(li);
  });
}

// ========= Syllabus Management ==========
function loadSubjects() {
  const subjects = JSON.parse(localStorage.getItem('syllabus') || '{}');
  const container = document.getElementById('subjectContainer');
  container.innerHTML = '';

  Object.keys(subjects).forEach(subject => {
    const div = document.createElement('div');
    div.className = 'subject-block';
    div.innerHTML = `
      <h3>${subject} <button onclick="deleteSubject('${subject}')">✖</button></h3>
      <div class="chapter-list" id="chapters-${subject}"></div>
      <input placeholder="Add chapter..." id="chapterInput-${subject}">
      <button onclick="addChapter('${subject}')">Add Chapter</button>
    `;
    container.appendChild(div);

    const chapterList = document.getElementById(`chapters-${subject}`);
    subjects[subject].forEach((ch, i) => {
      const chDiv = document.createElement('div');
      chDiv.className = 'chapter-item';
      chDiv.innerHTML = `
        <b>${ch.name}</b>
        <label><input type="checkbox" onchange="toggleChapter('${subject}', ${i}, 0)" ${ch.checks[0] ? 'checked' : ''}> Lecture</label>
        <label><input type="checkbox" onchange="toggleChapter('${subject}', ${i}, 1)" ${ch.checks[1] ? 'checked' : ''}> Notes</label>
        <label><input type="checkbox" onchange="toggleChapter('${subject}', ${i}, 2)" ${ch.checks[2] ? 'checked' : ''}> Questions</label>
        <label><input type="checkbox" onchange="toggleChapter('${subject}', ${i}, 3)" ${ch.checks[3] ? 'checked' : ''}> Revision</label>
        <button onclick="deleteChapter('${subject}', ${i})">Delete</button>
      `;
      chapterList.appendChild(chDiv);
    });
  });
}

function addSubject() {
  const input = document.getElementById('subjectInput');
  const subject = input.value.trim();
  if (!subject) return;
  const syllabus = JSON.parse(localStorage.getItem('syllabus') || '{}');
  if (!syllabus[subject]) syllabus[subject] = [];
  localStorage.setItem('syllabus', JSON.stringify(syllabus));
  input.value = '';
  loadSubjects();
}

function addChapter(subject) {
  const input = document.getElementById(`chapterInput-${subject}`);
  const chapter = input.value.trim();
  if (!chapter) return;
  const syllabus = JSON.parse(localStorage.getItem('syllabus') || '{}');
  syllabus[subject].push({ name: chapter, checks: [false, false, false, false] });
  localStorage.setItem('syllabus', JSON.stringify(syllabus));
  input.value = '';
  loadSubjects();
}

function toggleChapter(subject, index, checkIndex) {
  const syllabus = JSON.parse(localStorage.getItem('syllabus') || '{}');
  syllabus[subject][index].checks[checkIndex] = !syllabus[subject][index].checks[checkIndex];
  localStorage.setItem('syllabus', JSON.stringify(syllabus));
  loadSubjects();
}

function deleteSubject(subject) {
  const syllabus = JSON.parse(localStorage.getItem('syllabus') || '{}');
  delete syllabus[subject];
  localStorage.setItem('syllabus', JSON.stringify(syllabus));
  loadSubjects();
}

function deleteChapter(subject, index) {
  const syllabus = JSON.parse(localStorage.getItem('syllabus') || '{}');
  syllabus[subject].splice(index, 1);
  localStorage.setItem('syllabus', JSON.stringify(syllabus));
  loadSubjects();
}
// ========= Pomodoro Timer ==========
let timer;
let timerType = 'focus';
let timeLeft = 1500; // 25 min
let selectedSubject = '';
let isRunning = false;

function updateTimerDisplay() {
  const min = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const sec = String(timeLeft % 60).padStart(2, '0');
  document.getElementById('timerDisplay').innerText = `${min}:${sec}`;
}

function startTimer() {
  const duration = parseInt(document.getElementById('focusDuration').value) || 25;
  const breakDuration = parseInt(document.getElementById('breakDuration').value) || 5;
  if (!selectedSubject) {
    alert('Please select a subject before starting timer.');
    return;
  }
  if (isRunning) return;

  isRunning = true;
  timeLeft = (timerType === 'focus' ? duration : breakDuration) * 60;
  updateTimerDisplay();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      isRunning = false;
      logSession(selectedSubject, duration);
      timerType = timerType === 'focus' ? 'break' : 'focus';
      startTimer(); // Auto-start next session
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  isRunning = false;
  updateTimerDisplay();
}

function selectSubject(subject) {
  selectedSubject = subject;
  document.getElementById('selectedSubject').innerText = subject;
}

function logSession(subject, duration) {
  const log = JSON.parse(localStorage.getItem('studyLog') || '{}');
  const date = getDateKey();
  if (!log[date]) log[date] = [];
  log[date].push({ subject, duration, time: Date.now() });
  localStorage.setItem('studyLog', JSON.stringify(log));
  updateProgress();
}

// ========= Progress Tracking ==========
function updateProgress() {
  const log = JSON.parse(localStorage.getItem('studyLog') || '{}');
  const date = getDateKey();
  const todayLog = log[date] || [];

  const totalMinutes = todayLog.reduce((sum, s) => sum + s.duration, 0);
  const subjectStats = {};

  todayLog.forEach(entry => {
    subjectStats[entry.subject] = (subjectStats[entry.subject] || 0) + entry.duration;
  });

  document.getElementById('dailyHours').innerText = `${(totalMinutes / 60).toFixed(2)} hrs`;

  // Update Streak
  const streakData = JSON.parse(localStorage.getItem('streakData') || '[]');
  const yesterday = getDateKey(-1);

  if (!streakData.includes(date) && totalMinutes > 0) {
    if (streakData[streakData.length - 1] === yesterday) {
      streakData.push(date); // Continue streak
    } else {
      streakData.length = 0; // Reset streak
      streakData.push(date);
    }
  }

  localStorage.setItem('streakData', JSON.stringify(streakData));
  document.getElementById('currentStreak').innerText = streakData.length;
  document.getElementById('longestStreak').innerText = Math.max(...getStreakLengths(streakData));

  // Chart Data
  renderCharts(log);
  generateInsights(log);
}

function getStreakLengths(dates) {
  let max = 0, count = 0;
  const sorted = [...dates].sort();
  for (let i = 1; i < sorted.length; i++) {
    const d1 = new Date(sorted[i - 1]);
    const d2 = new Date(sorted[i]);
    if ((d2 - d1) / (1000 * 3600 * 24) === 1) count++;
    else count = 1;
    max = Math.max(max, count);
  }
  return [max];
}

// ========= Chart.js ==========
let barChart;
function renderCharts(log) {
  const ctx = document.getElementById('studyChart').getContext('2d');
  const labels = [];
  const data = [];

  for (let i = 6; i >= 0; i--) {
    const d = getDateKey(-i);
    labels.push(d.slice(5));
    const total = (log[d] || []).reduce((sum, s) => sum + s.duration, 0);
    data.push(total);
  }

  if (barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Daily Study (min)',
        data,
        backgroundColor: '#4fa4f7'
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// ========= Talent Analysis ==========
function generateInsights(log) {
  const insights = document.getElementById('weeklyInsight');
  insights.innerHTML = '';

  const allEntries = Object.entries(log).flatMap(([date, sessions]) =>
    sessions.map(s => ({ date, ...s }))
  );

  if (allEntries.length < 5) {
    insights.innerHTML = '<li>Not enough data for insights.</li>';
    return;
  }

  const timeMap = {};
  allEntries.forEach(entry => {
    const hour = new Date(entry.time).getHours();
    timeMap[hour] = (timeMap[hour] || 0) + entry.duration;
  });

  const bestHour = Object.entries(timeMap).sort((a, b) => b[1] - a[1])[0][0];
  const dayMap = {};
  allEntries.forEach(e => {
    const d = new Date(e.date).getDay();
    dayMap[d] = (dayMap[d] || 0) + e.duration;
  });
  const bestDay = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][Object.entries(dayMap).sort((a,b)=>b[1]-a[1])[0][0]];

  const msgList = [
    `🎯 Best study hour: ${bestHour}:00`,
    `📅 Most productive day: ${bestDay}`,
    `⚡️ Average session: ${(allEntries.reduce((s, e) => s + e.duration, 0) / allEntries.length).toFixed(1)} mins`,
    `💡 Tip: Try studying at ${bestHour}:00 for peak productivity.`,
    `📌 Stay consistent to beat your longest streak!`
  ];

  msgList.forEach(msg => {
    const li = document.createElement('li');
    li.textContent = msg;
    insights.appendChild(li);
  });
}

// ========= Init ==========
window.onload = () => {
  loadTasks();
  loadSubjects();
  updateProgress();
  updateTimerDisplay();
  loadNotes();
};
