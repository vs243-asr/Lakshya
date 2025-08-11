window.addEventListener("DOMContentLoaded", () => {

  // ===== Tabs =====
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
      if (btn.dataset.tab === "dashboard") updateDashboard();
      if (btn.dataset.tab === "progress") updateProgressTab();
    });
  });

  // ===== Quotes =====
  const quotes = [
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
  let lastQuotes = JSON.parse(localStorage.getItem("lastQuotes") || "[]");
  function getRandomQuote() {
    let q;
    do { q = quotes[Math.floor(Math.random() * quotes.length)]; }
    while (lastQuotes.includes(q) && lastQuotes.length < quotes.length);
    lastQuotes.push(q);
    if (lastQuotes.length > 10) lastQuotes.shift();
    localStorage.setItem("lastQuotes", JSON.stringify(lastQuotes));
    return q;
  }

  // ===== Dashboard =====
  function updateDashboard() {
    document.getElementById('motivational-quote').textContent = getRandomQuote();
    document.getElementById('pomodoro-preview').textContent =
      `${formatTime(pomodoroTimeLeft)} (${currentPomodoroSubject})`;
    updateTodayTaskProgress();
    updateWeeklyStats();
  }

  // ===== Pomodoro =====
  let pomodoroSubjects = JSON.parse(localStorage.getItem("pomodoroSubjects") || `["General"]`);
  let currentPomodoroSubject = pomodoroSubjects[0] || "General";
  let pomodoroMinutes = parseInt(localStorage.getItem("pomodoroMinutes")) || 25;
  let pomodoroTimeLeft = pomodoroMinutes * 60;
  let pomodoroInterval = null;

  function updatePomodoroSubjects() {
    const sel = document.getElementById('pomodoro-subjects');
    sel.innerHTML = "";
    pomodoroSubjects.forEach(subj => {
      const opt = document.createElement('option');
      opt.value = subj; opt.textContent = subj;
      sel.appendChild(opt);
    });
    sel.value = currentPomodoroSubject;
  }
  updatePomodoroSubjects();

  document.getElementById('add-pomodoro-subject-btn').onclick = () => {
    const val = document.getElementById('add-pomodoro-subject').value.trim();
    if (val && !pomodoroSubjects.includes(val)) {
      pomodoroSubjects.push(val);
      localStorage.setItem("pomodoroSubjects", JSON.stringify(pomodoroSubjects));
      updatePomodoroSubjects();
    }
    document.getElementById('add-pomodoro-subject').value = "";
  };

  document.getElementById('pomodoro-duration').value = pomodoroMinutes;
  document.getElementById('pomodoro-duration').onchange = e => {
    pomodoroMinutes = parseInt(e.target.value) || 25;
    pomodoroTimeLeft = pomodoroMinutes * 60;
    localStorage.setItem("pomodoroMinutes", pomodoroMinutes);
    document.getElementById('pomodoro-time').textContent = formatTime(pomodoroTimeLeft);
  };

  document.getElementById('pomodoro-subjects').onchange = e => {
    currentPomodoroSubject = e.target.value;
  };

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function startPomodoro() {
    if (pomodoroInterval) return;
    pomodoroInterval = setInterval(() => {
      pomodoroTimeLeft--;
      document.getElementById('pomodoro-time').textContent = formatTime(pomodoroTimeLeft);
      document.getElementById('pomodoro-preview').textContent =
        `${formatTime(pomodoroTimeLeft)} (${currentPomodoroSubject})`;
      if (pomodoroTimeLeft <= 0) {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
        logPomodoro();
        pomodoroTimeLeft = pomodoroMinutes * 60;
        document.getElementById('pomodoro-time').textContent = formatTime(pomodoroTimeLeft);
      }
    }, 1000);
  }
  function pausePomodoro() { clearInterval(pomodoroInterval); pomodoroInterval = null; }
  function resetPomodoro() { pausePomodoro(); pomodoroTimeLeft = pomodoroMinutes * 60;
    document.getElementById('pomodoro-time').textContent = formatTime(pomodoroTimeLeft); }

  document.getElementById('pomodoro-start').onclick = startPomodoro;
  document.getElementById('pomodoro-pause').onclick = pausePomodoro;
  document.getElementById('pomodoro-reset').onclick = resetPomodoro;

  function logPomodoro() {
    const logs = JSON.parse(localStorage.getItem("pomodoroLog") || "[]");
    logs.push({ subject: currentPomodoroSubject, duration: pomodoroMinutes, date: new Date().toISOString() });
    localStorage.setItem("pomodoroLog", JSON.stringify(logs));
    renderPomodoroLog();
    updateWeeklyStats();
    updateProgressTab();
  }

  function renderPomodoroLog() {
    const logs = JSON.parse(localStorage.getItem("pomodoroLog") || "[]").reverse().slice(0, 20);
    const list = document.getElementById('pomodoro-log');
    list.innerHTML = "";
    logs.forEach(l => {
      const li = document.createElement('li');
      li.textContent = `${l.subject}: ${l.duration} min — ${new Date(l.date).toLocaleString()}`;
      list.appendChild(li);
    });
  }
  renderPomodoroLog();

  // ===== Tasks =====
  function renderTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const list = document.getElementById('todo-list');
    list.innerHTML = "";
    tasks.forEach((t, i) => {
      const li = document.createElement('li');
      if (t.done) li.classList.add('done');
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.checked = t.done;
      cb.onchange = () => {
        t.done = cb.checked;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
        updateTodayTaskProgress();
      };
      li.appendChild(cb);
      li.appendChild(document.createTextNode(t.text));
      list.appendChild(li);
    });
  }
  document.getElementById('add-task').onclick = () => {
    const val = document.getElementById('new-task').value.trim();
    if (val) {
      const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
      tasks.push({ text: val, done: false });
      localStorage.setItem("tasks", JSON.stringify(tasks));
      document.getElementById('new-task').value = "";
      renderTasks();
      updateTodayTaskProgress();
    }
  };
  document.getElementById('refresh-tasks').onclick = () => {
    localStorage.setItem("tasks", "[]");
    renderTasks();
    updateTodayTaskProgress();
  };
  renderTasks();

  function updateTodayTaskProgress() {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const done = tasks.filter(t => t.done).length;
    const total = tasks.length;
    document.getElementById('tasks-completed-count').textContent = done;
    document.getElementById('tasks-total-count').textContent = total;
    document.getElementById('tasks-bar').style.width = total ? `${(done / total) * 100}%` : "0%";
  }

  // ===== Weekly stats simple =====
  function updateWeeklyStats() {
    const logs = JSON.parse(localStorage.getItem("pomodoroLog") || "[]")
      .filter(l => Date.now() - new Date(l.date).getTime() < 7 * 86400000);
    const hrs = logs.reduce((sum, l) => sum + l.duration / 60, 0);
    document.getElementById('weekly-hours').textContent = hrs.toFixed(1);
    document.getElementById('weekly-tasks').textContent =
      JSON.parse(localStorage.getItem("tasks") || "[]").filter(t => t.done).length;
  }

  // ===== Progress Tab Simple =====
  function updateProgressTab() {
    const logs = JSON.parse(localStorage.getItem("pomodoroLog") || "[]");
    const hoursPerDay = {};
    logs.forEach(l => {
      const date = new Date(l.date).toLocaleDateString();
      hoursPerDay[date] = (hoursPerDay[date] || 0) + l.duration / 60;
    });
    document.getElementById('weekly-patterns').innerHTML =
      `Best day: ${Object.keys(hoursPerDay).sort((a,b)=>hoursPerDay[b]-hoursPerDay[a])[0] || "N/A"}`;
    renderPomodoroLog();
  }

  // Initial call
  updateDashboard();

});
