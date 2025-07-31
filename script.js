// Switch tabs
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(tab).classList.add('active');
}
document.querySelectorAll('.tab-btn').forEach(b =>
  b.addEventListener('click', () => switchTab(b.dataset.tab))
);

// Date Display
document.getElementById('date-display').textContent = new Date().toDateString();

// Quotes
const quotes = [
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
document.getElementById('quote-display').textContent = quotes[(new Date()).getDate() % quotes.length];

// Stotra saving
document.getElementById('stotra').value = localStorage.getItem('stotra') || '';
document.getElementById('save-stotra').onclick = () => {
  localStorage.setItem('stotra', document.getElementById('stotra').value);
};

// Tasks
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks') || "[]");
  const ul = document.getElementById('task-list');
  const doneCount = tasks.filter(t => t.done).length;
  ul.innerHTML = '';
  tasks.forEach((task,i) => {
    const li = document.createElement('li');
    const cb = document.createElement('input'); cb.type='checkbox'; cb.checked = task.done;
    cb.onchange = () => { tasks[i].done = cb.checked; localStorage.setItem('tasks', JSON.stringify(tasks)); updateTodayBar(); };
    li.appendChild(cb); li.append(' ' + task.text);
    ul.appendChild(li);
  });
  updateTodayBar();
  document.getElementById('week-tasks').textContent = doneCount;
}
document.getElementById('add-task').onclick = () => {
  let arr = JSON.parse(localStorage.getItem('tasks') || "[]");
  const txt = document.getElementById('task-input').value.trim();
  if (txt) {
    arr.push({ text: txt, done:false });
    localStorage.setItem('tasks', JSON.stringify(arr));
    document.getElementById('task-input').value='';
    loadTasks();
  }
};
document.getElementById('refresh-tasks').onclick = loadTasks;
loadTasks();
function updateTodayBar(){
  const tasks = JSON.parse(localStorage.getItem('tasks') || "[]");
  const total = tasks.length, done = tasks.filter(t=>t.done).length;
  const percent = total === 0 ? 0 : Math.floor(done/total*100);
  document.querySelector('#today-bar .fill').style.width = percent + '%';
}

// Pomodoro
let timerInterval, countdown=1500;
function updateClock() {
  const m = String(Math.floor(countdown/60)).padStart(2,'0'),
        s = String(countdown%60).padStart(2,'0');
  document.getElementById('timer-preview').textContent = m+':'+s;
  document.getElementById('pomodoro-clock').textContent = m+':'+s;
}
function startSession(){
  clearInterval(timerInterval);
  const dur = parseInt(document.getElementById('session-duration').value) * 60;
  countdown = dur;
  const subj = document.getElementById('timer-subject').value || 'General';
  updateClock();
  timerInterval = setInterval(()=>{
    countdown--;
    updateClock();
    if (countdown<=0){
      clearInterval(timerInterval);
      recordStudy(subj, dur/60);
      alert('Session complete');
    }
  },1000);
}
document.getElementById('start-timer').onclick = startSession;
document.getElementById('pause-timer').onclick = () => clearInterval(timerInterval);
document.getElementById('reset-timer').onclick = ()=>{
  clearInterval(timerInterval);
  countdown = (parseInt(document.getElementById('session-duration').value) || 25)*60;
  updateClock();
};
document.getElementById('timer-subject').append(new Option('General','General'));
updateClock();

// Syllabus
function loadSyllabus(){
  const data = JSON.parse(localStorage.getItem('syllabus') || "{}");
  const cont = document.getElementById('subjects-container');
  cont.innerHTML='';
  Object.keys(data).forEach(sub=>{
    const div = document.createElement('div'); div.className='subject-card';
    div.innerHTML = `<h3>${sub}</h3>`;
    data[sub].forEach(ch=>{
      const row = document.createElement('div'); row.className='chapter-row';
      row.innerHTML = `<strong>${ch.name}</strong>: 
        <label><input type="checkbox"${ch.lecture? ' checked': ''}/> Lecture</label>
        <label><input type="checkbox"${ch.notes? ' checked': ''}/> Notes</label>
        <label><input type="checkbox"${ch.questions? ' checked': ''}/> Questions</label>
        <label><input type="checkbox"${ch.revision? ' checked': ''}/> Revision</label>`;
      cont.appendChild(row);
    });
    document.getElementById('timer-subject').append(new Option(sub, sub));
  });
}
document.getElementById('add-subject').onclick = ()=>{
  const sub = document.getElementById('subject-input').value.trim();
  if(!sub) return;
  const data = JSON.parse(localStorage.getItem('syllabus') || "{}");
  if(!data[sub]) data[sub] = [];
  const ch = prompt('Enter chapter name');
  if(ch) data[sub].push({ name: ch, lecture:false, notes:false, questions:false, revision:false });
  localStorage.setItem('syllabus', JSON.stringify(data));
  document.getElementById('subject-input').value='';
  loadSyllabus();
};
loadSyllabus();

// Journal and Quick Notes
document.getElementById('unlock-journal').onclick = ()=>{
  if (document.getElementById('journal-password').value === 'jai bhavani'){
    document.getElementById('journal-text').classList.remove('hidden');
    document.getElementById('save-journal').classList.remove('hidden');
  } else alert('Wrong password');
};
document.getElementById('save-journal').onclick = ()=>{
  localStorage.setItem('journal-'+ new Date().toDateString(), document.getElementById('journal-text').value);
  alert('Saved journal');
};
document.getElementById('save-note').onclick = () => {
  let arr = JSON.parse(localStorage.getItem('quick-notes') || "[]");
  arr.push({ date: new Date().toDateString(), text: document.getElementById('quick-note').value});
  localStorage.setItem('quick-notes', JSON.stringify(arr));
  alert('Idea saved');
};

// Study Recording & Progress
function recordStudy(subject, hours) {
  let stats = JSON.parse(localStorage.getItem('stats') || "{}");
  stats.totalHours = (stats.totalHours || 0) + hours;
  const today = new Date().toDateString();
  if (stats.lastDay !== today) {
    stats.currentStreak = (stats.currentStreak || 0) + 1;
    stats.lastDay = today;
    stats.longestStreak = Math.max(stats.currentStreak, stats.longestStreak || 0);
  }
  stats.byDate = stats.byDate || {};
  stats.byDate[today] = (stats.byDate[today] || 0) + hours;
  localStorage.setItem('stats', JSON.stringify(stats));
  renderProgress();
}
function renderProgress(){
  const stats = JSON.parse(localStorage.getItem('stats') || "{}");
  document.getElementById('goal-hours').textContent = stats.totalHours || 0;
  document.getElementById('current-streak').textContent = stats.currentStreak || 0;
  document.getElementById('longest-streak').textContent = stats.longestStreak || 0;
  document.getElementById('week-hours').textContent = stats.totalHours || 0;
  // Chart
  const ctx = document.getElementById('daily-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(stats.byDate || {}),
      datasets: [{ label: 'Hours', data: Object.values(stats.byDate || {}), backgroundColor: '#4fc3f7' }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
}
window.onload = renderProgress;
