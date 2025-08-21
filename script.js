// =========================
// Lakshya - script.js
// Complete app wiring (persisted to localStorage)
// =========================

// ---------- Storage helpers ----------
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function load(key, fallback) { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }

// ---------- App state ----------
let tasks = load("lak_tasks", []);                // [{text, done, id}]
let ideas = load("lak_ideas", []);               // [{id, text, date}]
let subjects = load("lak_subjects", []);         // [{id, name, chapters:[{id,name,checks:[bool..4]}]}]
let studyLog = load("lak_studyLog", []);         // [{mins, dateISO, subject}]
let journalEntries = load("lak_journal", []);    // [{id, dateISO, text}]
let weeklyGoals = load("lak_weeklyGoals", { hours: 10, tasks: 20 });
let usedQuotes = load("lak_usedQuotes", []);     // store used quotes to minimize repetition
let theme = load("lak_theme", "");               // "", "dark", "pastel"

// ---------- DOM refs ----------
const tabBtns = Array.from(document.querySelectorAll(".tab-btn"));
const quoteEl = document.getElementById("quote");

const themeSelect = document.getElementById("theme-select");

const // Dashboard weekly
  weeklyHoursGoalInput = document.getElementById("weekly-hours-goal"),
  weeklyTasksGoalInput = document.getElementById("weekly-tasks-goal"),
  weeklyHoursProgress = document.getElementById("weekly-hours-progress"),
  weeklyTasksProgress = document.getElementById("weekly-tasks-progress"),
  weeklyHoursDoneEl = document.getElementById("weekly-hours-done"),
  weeklyHoursTargetEl = document.getElementById("weekly-hours-target"),
  weeklyTasksDoneEl = document.getElementById("weekly-tasks-done"),
  weeklyTasksTargetEl = document.getElementById("weekly-tasks-target"),
  shlokaText = document.getElementById("shloka-text");

const // Timer
  workMinutesInput = document.getElementById("work-minutes"),
  breakMinutesInput = document.getElementById("break-minutes"),
  startTimerBtn = document.getElementById("start-timer"),
  resetTimerBtn = document.getElementById("reset-timer"),
  pomodoroDisplay = document.getElementById("pomodoro-display"),
  pomodoroSubjectInput = document.getElementById("pomodoro-subject");

const // Tasks
  newTaskInput = document.getElementById("new-task"),
  addTaskBtn = document.getElementById("add-task"),
  refreshTasksBtn = document.getElementById("refreshTasks"),
  taskListEl = document.getElementById("task-list");

const // Ideas
  ideaInput = document.getElementById("idea-input"),
  addIdeaBtn = document.getElementById("add-idea"),
  ideasListEl = document.getElementById("ideas-list");

const // Syllabus
  newSubjectInput = document.getElementById("newSubjectInput"),
  addSubjectBtn = document.getElementById("add-subject"),
  subjectsContainer = document.getElementById("subjects");

const // Journal
  journalPasswordInput = document.getElementById("journal-password"),
  unlockJournalBtn = document.getElementById("unlock-journal"),
  journalSection = document.getElementById("journal"),
  journalEntryTextarea = document.getElementById("journal-entry"),
  saveJournalBtn = document.getElementById("save-journal"),
  journalEntriesContainer = document.getElementById("journal-entries");

const // Progress
  hoursThisMonthEl = document.getElementById("hours-this-month"),
  tasksCompletedEl = document.getElementById("tasks-completed"),
  currentStreakEl = document.getElementById("current-streak"),
  longestStreakEl = document.getElementById("longest-streak"),
  recListEl = document.getElementById("recommendation-list");

// Chart contexts
const dailyHoursCtx = document.getElementById("daily-hours-chart").getContext("2d");
const subjectCtx = document.getElementById("subject-chart").getContext("2d");

// ---------- Utility ----------
function uid(prefix="id"){ return prefix + "_" + Math.random().toString(36).slice(2,9); }
function todayISO(d=new Date()){ const y=d.getFullYear(); const m=(d.getMonth()+1).toString().padStart(2,"0"); const dd=d.getDate().toString().padStart(2,"0"); return `${y}-${m}-${dd}`; }
function toDateOnlyISO(iso){ return (new Date(iso)).toISOString().slice(0,10); }
function parseIntSafe(v, fallback=0){ const n=parseInt(v); return isNaN(n)?fallback:n; }

// ---------- Quotes (no repeats until exhausted) ----------
const QUOTES = [
  "You either want it, or you don’t…",
  "Touch the sky with glory",
  "Survival of the fittest- Darwin",
  "Veer Bhogya Vasundhara",
  "Sheelam Param Bhooshanam",
  "Every move must have a purpose",
  "Without error there is no brilliancy",
  "The world obeys only one law: POWER",
  "Hazaron ki bheed se ubhar ke aaunga, Mujh me kabiliyat hai mai kar ke dikhaunga",
  "If you want to rise like the Sun, first burn like the Sun."
];
function pickQuote(){
  if(usedQuotes.length >= QUOTES.length) usedQuotes = [];
  const avail = QUOTES.filter(q => !usedQuotes.includes(q));
  const choice = avail[Math.floor(Math.random()*avail.length)];
  usedQuotes.push(choice); save("lak_usedQuotes", usedQuotes);
  quoteEl.textContent = choice;
}
pickQuote();

// ---------- Theme handling ----------
function applyTheme(t){
  document.body.classList.remove("dark","pastel");
  if(t) document.body.classList.add(t);
  themeSelect.value = t || "";
  save("lak_theme", t);
}
themeSelect.addEventListener("change", ()=>{ theme = themeSelect.value; applyTheme(theme); });
applyTheme(theme);

// ---------- Tab navigation ----------
tabBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    tabBtns.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.querySelectorAll(".tab-content").forEach(s => s.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
    // small animation trigger
    const el = document.getElementById(tab);
    el.classList.remove("fade-in");
    void el.offsetWidth;
    el.classList.add("fade-in");
  });
});

// ---------- Render / Persistence functions ----------

// ---- Tasks ----
function renderTasks(){
  taskListEl.innerHTML = "";
  tasks.forEach((t, idx) => {
    const li = document.createElement("li");
    li.className = t.done ? "completed" : "";
    // text span (editable)
    const span = document.createElement("span");
    span.textContent = t.text;
    span.contentEditable = "true";
    span.addEventListener("blur", ()=> {
      tasks[idx].text = span.textContent.trim();
      save("lak_tasks", tasks);
      renderTasks();
    });
    span.addEventListener("keydown", (e)=> {
      if(e.key === "Enter"){ e.preventDefault(); span.blur(); }
    });
    // controls
    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.gap = "8px";
    // toggle done button
    const doneBtn = document.createElement("button");
    doneBtn.textContent = t.done ? "✔" : "○";
    doneBtn.title = "Toggle done";
    doneBtn.onclick = (ev)=>{ ev.stopPropagation(); tasks[idx].done = !tasks[idx].done; save("lak_tasks", tasks); renderTasks(); updateWeeklyProgress(); };
    // delete
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.title = "Delete";
    delBtn.onclick = (ev)=>{ ev.stopPropagation(); tasks.splice(idx,1); save("lak_tasks", tasks); renderTasks(); updateWeeklyProgress(); };
    controls.appendChild(doneBtn); controls.appendChild(delBtn);

    li.appendChild(span); li.appendChild(controls);
    // clicking li toggles done (for convenience)
    li.addEventListener("click", ()=>{ tasks[idx].done = !tasks[idx].done; save("lak_tasks", tasks); renderTasks(); updateWeeklyProgress(); });
    taskListEl.appendChild(li);
  });
}
addTaskBtn.addEventListener("click", ()=>{
  const v = newTaskInput.value.trim();
  if(!v) return;
  tasks.push({ id: uid("task"), text: v, done: false });
  newTaskInput.value = "";
  save("lak_tasks", tasks);
  renderTasks(); updateWeeklyProgress();
});
refreshTasksBtn.addEventListener("click", ()=>{ if(confirm("Clear all tasks?")){ tasks=[]; save("lak_tasks", tasks); renderTasks(); updateWeeklyProgress(); } });
renderTasks();

// ---- Ideas ----
function renderIdeas(){
  ideasListEl.innerHTML = "";
  ideas.slice().reverse().forEach((it,idxRev)=>{
    const idx = ideas.length - 1 - idxRev;
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.contentEditable = "true";
    span.textContent = it.text;
    span.addEventListener("blur", ()=>{ ideas[idx].text = span.textContent.trim(); save("lak_ideas", ideas); renderIdeas(); });
    const meta = document.createElement("small");
    meta.textContent = new Date(it.date).toLocaleDateString();
    const del = document.createElement("button");
    del.textContent = "🗑"; del.onclick = ()=>{ ideas.splice(idx,1); save("lak_ideas", ideas); renderIdeas(); };
    li.appendChild(span); li.appendChild(meta); li.appendChild(del);
    ideasListEl.appendChild(li);
  });
}
addIdeaBtn.addEventListener("click", ()=>{
  const v = ideaInput.value.trim();
  if(!v) return;
  ideas.push({ id: uid("idea"), text: v, date: new Date().toISOString() });
  ideaInput.value = ""; save("lak_ideas", ideas); renderIdeas();
});
renderIdeas();

// ---- Syllabus ----
function renderSubjects(){
  subjectsContainer.innerHTML = "";
  subjects.forEach((s, si)=>{
    const card = document.createElement("div"); card.className = "card";
    const header = document.createElement("div"); header.style.display="flex"; header.style.justifyContent="space-between";
    const name = document.createElement("h4"); name.contentEditable="true"; name.textContent = s.name;
    name.addEventListener("blur", ()=>{ subjects[si].name = name.textContent.trim(); save("lak_subjects", subjects); updateCharts(); });
    const controls = document.createElement("div");
    const addChapBtn = document.createElement("button"); addChapBtn.textContent = "＋ Chapter";
    addChapBtn.onclick = ()=>{ const chapName = prompt("Chapter name:"); if(chapName){ subjects[si].chapters.push({ id: uid("chap"), name: chapName, checks: [false,false,false,false] }); save("lak_subjects", subjects); renderSubjects(); updateCharts(); } };
    const delSub = document.createElement("button"); delSub.textContent = "🗑"; delSub.onclick = ()=>{ if(confirm("Delete subject and all chapters?")){ subjects.splice(si,1); save("lak_subjects", subjects); renderSubjects(); updateCharts(); } };
    controls.appendChild(addChapBtn); controls.appendChild(delSub);
    header.appendChild(name); header.appendChild(controls);
    card.appendChild(header);

    const chList = document.createElement("div");
    s.chapters.forEach((c, ci)=>{
      const row = document.createElement("div"); row.style.display="flex"; row.style.justifyContent="space-between"; row.style.alignItems="center"; row.style.marginTop="8px";
      const left = document.createElement("div");
      const chapName = document.createElement("span"); chapName.contentEditable="true"; chapName.textContent = c.name;
      chapName.addEventListener("blur", ()=>{ subjects[si].chapters[ci].name = chapName.textContent.trim(); save("lak_subjects", subjects); updateCharts(); });
      left.appendChild(chapName);

      const checksDiv = document.createElement("div");
      ["Lecture","Notes","Questions","Revision"].forEach((label, k)=>{
        const lbl = document.createElement("label");
        lbl.style.marginLeft = "8px";
        const cb = document.createElement("input"); cb.type="checkbox"; cb.checked = !!c.checks[k];
        cb.addEventListener("change", ()=>{ subjects[si].chapters[ci].checks[k] = cb.checked; save("lak_subjects", subjects); updateCharts(); updateWeeklyProgress(); });
        lbl.appendChild(cb); lbl.appendChild(document.createTextNode(" " + label));
        checksDiv.appendChild(lbl);
      });

      const delChap = document.createElement("button"); delChap.textContent = "🗑"; delChap.onclick = ()=>{ if(confirm("Delete chapter?")){ subjects[si].chapters.splice(ci,1); save("lak_subjects", subjects); renderSubjects(); updateCharts(); } };

      row.appendChild(left); row.appendChild(checksDiv); row.appendChild(delChap);
      chList.appendChild(row);
    });

    card.appendChild(chList);
    subjectsContainer.appendChild(card);
  });
}
addSubjectBtn.addEventListener("click", ()=>{
  const v = newSubjectInput.value.trim(); if(!v) return;
  subjects.push({ id: uid("subj"), name: v, chapters: [] });
  newSubjectInput.value = ""; save("lak_subjects", subjects); renderSubjects(); updateCharts();
});
renderSubjects();

// ---- Journal ----
function renderJournalEntries(){
  journalEntriesContainer.innerHTML = "";
  journalEntries.slice().reverse().forEach((e, idxRev)=>{
    const idx = journalEntries.length - 1 - idxRev;
    const card = document.createElement("div"); card.className = "card";
    const date = document.createElement("div"); date.textContent = new Date(e.dateISO).toLocaleString();
    const ta = document.createElement("div"); ta.contentEditable = "true"; ta.textContent = e.text;
    ta.style.whiteSpace = "pre-wrap";
    ta.addEventListener("blur", ()=>{ journalEntries[idx].text = ta.textContent; save("lak_journal", journalEntries); });
    const del = document.createElement("button"); del.textContent = "🗑"; del.onclick = ()=>{ if(confirm("Delete entry?")){ journalEntries.splice(idx,1); save("lak_journal", journalEntries); renderJournalEntries(); } };
    card.appendChild(date); card.appendChild(ta); card.appendChild(del);
    journalEntriesContainer.appendChild(card);
  });
}
unlockJournalBtn.addEventListener("click", ()=>{
  const v = journalPasswordInput.value.trim();
  if(v === "jai bhavani"){
    journalSection.classList.remove("locked");
    renderJournalEntries();
  } else alert("Wrong password!");
});
saveJournalBtn.addEventListener("click", ()=>{
  const text = journalEntryTextarea.value.trim();
  if(!text) return alert("Write something first");
  journalEntries.push({ id: uid("jour"), dateISO: new Date().toISOString(), text });
  journalEntryTextarea.value = ""; save("lak_journal", journalEntries); renderJournalEntries();
});

// ---- Pomodoro (YPT-like cycles) ----
let pomState = { running: false, mode: "work", timerId: null, secondsLeft: 25*60 };
function updatePomDisplay(){
  const m = Math.floor(pomState.secondsLeft / 60).toString().padStart(2,"0");
  const s = (pomState.secondsLeft % 60).toString().padStart(2,"0");
  pomodoroDisplay.textContent = `${m}:${s} ${pomState.mode === "work" ? "• Work" : "• Break"}`;
  document.getElementById("timer-preview") && (document.getElementById("timer-preview").textContent = pomodoroDisplay.textContent);
}
function startPomodoro(){
  if(pomState.running) return;
  pomState.running = true;
  pomState.mode = "work";
  const workMin = parseIntSafe(workMinutesInput.value, 25);
  const breakMin = parseIntSafe(breakMinutesInput.value, 5);
  pomState.secondsLeft = workMin * 60;
  updatePomDisplay();
  pomState.timerId = setInterval(()=> {
    pomState.secondsLeft--;
    if(pomState.secondsLeft <= 0){
      // end of mode
      clearInterval(pomState.timerId);
      if(pomState.mode === "work"){
        // log work minutes
        const mins = workMin;
        studyLog.push({ mins, dateISO: new Date().toISOString(), subject: (pomodoroSubjectInput.value || "General") });
        save("lak_studyLog", studyLog);
        updateAllStats();
        // switch to break
        pomState.mode = "break";
        pomState.secondsLeft = breakMin * 60;
        startPomodoro(); // start break
      } else {
        // break finished -> auto start new work cycle
        pomState.mode = "work";
        pomState.secondsLeft = workMin * 60;
        startPomodoro();
      }
    } else updatePomDisplay();
  }, 1000);
}
function resetPomodoro(){
  clearInterval(pomState.timerId);
  pomState.running = false;
  pomState.mode = "work";
  pomState.secondsLeft = parseIntSafe(workMinutesInput.value,25) * 60;
  updatePomDisplay();
}
startTimerBtn.addEventListener("click", ()=> startPomodoro());
resetTimerBtn.addEventListener("click", ()=> resetPomodoro());
resetPomodoro();

// ---- Weekly goals UI & logic ----
function updateWeeklyGoalsFromInputs(){
  weeklyGoals.hours = parseIntSafe(weeklyHoursGoalInput.value, weeklyGoals.hours);
  weeklyGoals.tasks = parseIntSafe(weeklyTasksGoalInput.value, weeklyGoals.tasks);
  save("lak_weeklyGoals", weeklyGoals);
  updateWeeklyProgressUI();
}
weeklyHoursGoalInput.addEventListener("change", updateWeeklyGoalsFromInputs);
weeklyTasksGoalInput.addEventListener("change", updateWeeklyGoalsFromInputs);

// compute weekly progress: hours in current week (Mon-Sun) and tasks done this week (simple: count tasks done total)
function getWeekStart(date=new Date()){
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun
  const diff = d.getDate() - day + (day===0 ? -6 : 1); // Monday start
  return new Date(d.setDate(diff));
}
function updateWeeklyProgressUI(){
  // hours this week
  const start = getWeekStart();
  let hours = 0;
  studyLog.forEach(s => {
    const d = new Date(s.dateISO);
    if(d >= start) hours += s.mins / 60;
  });
  const hoursRounded = Math.floor(hours);
  // tasks done (we'll consider all tasks done as within week - or could add date metadata to tasks later)
  const tasksDone = tasks.filter(t=>t.done).length;

  weeklyHoursProgress.max = weeklyGoals.hours || 1;
  weeklyHoursProgress.value = Math.min(hoursRounded, weeklyGoals.hours || 0);
  weeklyTasksProgress.max = weeklyGoals.tasks || 1;
  weeklyTasksProgress.value = Math.min(tasksDone, weeklyGoals.tasks || 0);

  weeklyHoursDoneEl.textContent = hoursRounded;
  weeklyHoursTargetEl.textContent = weeklyGoals.hours;
  weeklyTasksDoneEl.textContent = tasksDone;
  weeklyTasksTargetEl.textContent = weeklyGoals.tasks;

  // persist a lightweight weeklyProgress if needed
  save("lak_weeklyGoals", weeklyGoals);
}
updateWeeklyGoalsFromInputs();

// ---- Charts (Chart.js) ----
let dailyChart = new Chart(dailyHoursCtx, {
  type: 'bar',
  data: { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets: [{ label: 'Hours', data: [0,0,0,0,0,0,0], backgroundColor: '#3f83f8' }] },
  options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
});

let subjectChart = new Chart(subjectCtx, {
  type: 'pie',
  data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
  options: { responsive: true, maintainAspectRatio: false }
});

function updateCharts(){
  // daily hours for current week (Mon-Sun)
  const start = getWeekStart();
  const hoursArr = [0,0,0,0,0,0,0]; // Mon->Sun
  studyLog.forEach(s => {
    const d = new Date(s.dateISO);
    if(d >= start){
      const idx = (d.getDay() + 6) % 7; // convert Sun0..Sat6 to Mon0..Sun6
      hoursArr[idx] += s.mins / 60;
    }
  });
  dailyChart.data.datasets[0].data = hoursArr.map(h => Math.round(h*100)/100);
  dailyChart.update();

  // subject-wise progress percent from subjects structure
  const labels = [], data = [], colors = [];
  subjects.forEach((sub, i) => {
    labels.push(sub.name);
    let done = 0, total = 0;
    sub.chapters.forEach(ch => { total += 4; done += ch.checks.filter(Boolean).length; });
    data.push(total ? Math.round((done/total)*100) : 0);
    // color palette
    const palette = ['#3f83f8','#7ecbff','#6ab7ff','#9ad0ff','#4da6ff','#7fb3ff'];
    colors.push(palette[i % palette.length]);
  });
  subjectChart.data.labels = labels;
  subjectChart.data.datasets[0].data = data;
  subjectChart.data.datasets[0].backgroundColor = colors;
  subjectChart.update();
}

// ---- Stats & streaks ----
function updateStats(){
  // hours this month
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}`;
  let monthMins = 0;
  studyLog.forEach(s => { if(s.dateISO.slice(0,7) === monthStr) monthMins += s.mins; });
  hoursThisMonthEl.textContent = Math.floor(monthMins / 60);

  // tasks completed
  tasksCompletedEl.textContent = tasks.filter(t=>t.done).length;

  // streaks (days with study >0)
  const daysWithStudy = {};
  studyLog.forEach(s => { daysWithStudy[toDateOnlyISO(s.dateISO)] = true; });
  const dayKeys = Object.keys(daysWithStudy).sort();
  // compute current and longest streak based on continuous dates
  let longest = 0, current = 0;
  let prev = null;
  dayKeys.forEach(dStr => {
    const d = new Date(dStr);
    if(prev){
      const diffDays = Math.round((d - prev)/(1000*60*60*24));
      if(diffDays === 1) current += 1; else current = 1;
    } else current = 1;
    if(current > longest) longest = current;
    prev = d;
  });
  // If last day is today or yesterday?
  const lastDay = dayKeys.length ? new Date(dayKeys[dayKeys.length-1]) : null;
  const today = new Date();
  let curStreak = 0;
  if(lastDay){
    // compute backward current streak
    let back = 0; let d = new Date(lastDay);
    while(true){
      const key = toDateOnlyISO(d.toISOString());
      if(daysWithStudy[key]) back++; else break;
      d.setDate(d.getDate() - 1);
    }
    curStreak = back;
  }
  currentStreakEl.textContent = curStreak || 0;
  longestStreakEl.textContent = longest || 0;
}

function updateAllStats(){
  updateWeeklyProgressUI();
  updateCharts();
  updateStats();
  // recommendations quick regen
  generateRecommendations();
}
updateAllStats();

// ---- Recommendations (basic) ----
function generateRecommendations(){
  recListEl.innerHTML = "";
  // Rule-based suggestions
  // 1. If average session <20 minutes suggest longer sessions
  const avgSession = studyLog.length ? (studyLog.reduce((a,b)=>a+b.mins,0)/studyLog.length) : 0;
  if(avgSession && avgSession < 20) {
    const li = document.createElement("li"); li.textContent = "Your average study session is short (" + Math.round(avgSession) + " min). Try 25–45 min focused sessions.";
    recListEl.appendChild(li);
  }
  // 2. Suggest best day (max hours)
  const week = {}; studyLog.forEach(s => { const d=new Date(s.dateISO); const day = d.getDay(); week[day] = (week[day]||0) + s.mins/60; });
  if(Object.keys(week).length){
    const best = Object.entries(week).sort((a,b)=>b[1]-a[1])[0];
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const li = document.createElement("li"); li.textContent = `You study most on ${days[best[0]]}. Consider scheduling toughest subjects then.`;
    recListEl.appendChild(li);
  }
  if(!recListEl.hasChildNodes()){
    const li = document.createElement("li"); li.textContent = "Keep going — log a Pomodoro session to get personalized tips!";
    recListEl.appendChild(li);
  }
}

// ---------- Initial persistence load (shloka + weekly inputs) ----------
shlokaText.value = load("lak_shloka", "");
shlokaText.addEventListener("input", ()=> save("lak_shloka", shlokaText.value));

// weekly inputs initialization
weeklyHoursGoalInput.value = weeklyGoals.hours;
weeklyTasksGoalInput.value = weeklyGoals.tasks;

// ---------- Initialize charts & UI ----------
updateAllStats();
updateCharts();
renderSubjects();
renderIdeas();
renderTasks();
renderJournalEntries();

// ---------- Small UX touches ----------
document.addEventListener("keydown", (e)=>{
  if(e.ctrlKey && e.key === "k"){ // quick focus new-task
    e.preventDefault(); newTaskInput.focus();
  }
});
