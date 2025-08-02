const state = JSON.parse(localStorage.getItem('lakshya')) || {
  subjects:{}, tasks:[], journal:[], shlokas:[], pomodoroLogs:[] };

function saveState(){ localStorage.setItem('lakshya', JSON.stringify(state)); }

const quotes = [...]; // (same quotes array as before)

function openTab(e){
  const tab=e.target.getAttribute('data-tab');
  document.querySelectorAll('.tab-content').forEach(tc=>tc.classList.remove('active-tab'));
  document.querySelectorAll('.tab-button').forEach(tb=>tb.classList.remove('active'));
  document.getElementById(tab).classList.add('active-tab');
  e.target.classList.add('active');
}
document.querySelectorAll('.tab-button').forEach(b=>b.onclick=openTab);

function showQuote(){
  const q=quotes[Math.floor(Math.random()*quotes.length)];
  document.getElementById('motivational-quote').textContent=q;
  state.lastQuote = q; saveState();
}
showQuote();

// Tasks
function renderTasks(){
  // ...
  // same checkbox logic, then saveState and updateProgress
}
... // same as before, but after each state mutation: saveState()

// Syllabus & subjects
... // similar, with saveState()

// Pomodoro timer with hover preview and log storing
... // after log push: saveState()

// Journal with lock
... // after journal push: saveState()

// Shloka saving with saveState()

// Progress & analytics
function updateProgress(){
  ... // same calculations
  renderChart(monthLogs);
  saveState();
}

function renderChart(logs){
  // same Chart.js logic
}

// On page load
renderTasks(); renderSyllabus(); updateSubjectsMenu();
renderJournal(); renderShlokas(); updateProgress();

// Dashboard preview
(function previewLast(){
  const logs = state.pomodoroLogs;
  if(logs.length){
    const last = logs[logs.length-1];
    document.getElementById('last-session').textContent = (last.seconds/60).toFixed(0) + ' mins (' + last.subject + ')';
  }
})();
