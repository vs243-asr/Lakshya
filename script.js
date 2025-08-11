/* =======================
   LAKSHYA APP - SCRIPT.JS
   ======================= */

// ===== Tab Navigation =====
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

// ===== Motivational Quotes =====
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
    do {
        q = quotes[Math.floor(Math.random() * quotes.length)];
    } while (lastQuotes.includes(q) && lastQuotes.length < quotes.length);
    lastQuotes.push(q);
    if (lastQuotes.length > 10) lastQuotes.shift(); // no repeat in 10 days
    localStorage.setItem("lastQuotes", JSON.stringify(lastQuotes));
    return q;
}

// ===== Dashboard Update =====
function updateDashboard() {
    document.getElementById('motivational-quote').textContent = getRandomQuote();
    updateTodayTaskProgress();
    updateWeeklyStats();
    document.getElementById('pomodoro-preview').textContent =
        `${formatTime(pomodoroTimeLeft)} (${currentPomodoroSubject})`;
}

// ===== Pomodoro Timer =====
let pomodoroSubjects = JSON.parse(localStorage.getItem("pomodoroSubjects") || `["General"]`);
let currentPomodoroSubject = pomodoroSubjects[0];
let pomodoroMinutes = parseInt(localStorage.getItem("pomodoroMinutes")) || 25;
let pomodoroTimeLeft = pomodoroMinutes * 60;
let pomodoroInterval = null;

function updatePomodoroSubjects() {
    const sel = document.getElementById('pomodoro-subjects');
    sel.innerHTML = "";
    pomodoroSubjects.forEach(subj => {
        let opt = document.createElement('option');
        opt.value = subj;
        opt.textContent = subj;
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
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
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
            updateStats();
            pomodoroTimeLeft = pomodoroMinutes * 60;
            document.getElementById('pomodoro-time').textContent = formatTime(pomodoroTimeLeft);
        }
    }, 1000);
}
function pausePomodoro() {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
}
function resetPomodoro() {
    pausePomodoro();
    pomodoroTimeLeft = pomodoroMinutes * 60;
    document.getElementById('pomodoro-time').textContent = formatTime(pomodoroTimeLeft);
}

document.getElementById('pomodoro-start').onclick = startPomodoro;
document.getElementById('pomodoro-pause').onclick = pausePomodoro;
document.getElementById('pomodoro-reset').onclick = resetPomodoro;

function logPomodoro() {
    const logs = JSON.parse(localStorage.getItem("pomodoroLog") || "[]");
    logs.push({ subject: currentPomodoroSubject, duration: pomodoroMinutes, date: new Date().toISOString() });
    localStorage.setItem("pomodoroLog", JSON.stringify(logs));
    renderPomodoroLog();
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

// ===== Tasks Tab =====
function renderTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const list = document.getElementById('todo-list');
    list.innerHTML = "";
    tasks.forEach((t, i) => {
        const li = document.createElement('li');
        if (t.done) li.classList.add('done');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = t.done;
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

// ===== Syllabus Tab =====
function renderSyllabus() {
    const data = JSON.parse(localStorage.getItem("syllabus") || "{}");
    const container = document.getElementById('subjects-list');
    container.innerHTML = "";
    Object.keys(data).forEach(subj => {
        const subjDiv = document.createElement('div');
        subjDiv.className = "subject";
        subjDiv.innerHTML = `<div class="subject-title">${subj}</div>`;
        // Chapters
        data[subj].forEach((ch, ci) => {
            const chDiv = document.createElement('div');
            chDiv.className = "chapter";
            chDiv.innerHTML = `<div class="chapter-title">${ch.name}</div>`;
            const checks = document.createElement('div');
            checks.className = "chapter-checkboxes";
            ['Lecture', 'Notes', 'Questions', 'Revision'].forEach((label, li) => {
                const chk = document.createElement('input');
                chk.type = "checkbox";
                chk.checked = ch.status[li];
                chk.onchange = () => {
                    ch.status[li] = chk.checked;
                    localStorage.setItem("syllabus", JSON.stringify(data));
                };
                const lab = document.createElement('label');
                lab.appendChild(chk);
                lab.appendChild(document.createTextNode(label));
                checks.appendChild(lab);
            });
            chDiv.appendChild(checks);
            subjDiv.appendChild(chDiv);
        });
        // Add chapter form
        const addCh = document.createElement('input');
        addCh.placeholder = "Add chapter";
        const btn = document.createElement('button');
        btn.textContent = "Add";
        btn.onclick = () => {
            if (addCh.value.trim()) {
                data[subj].push({ name: addCh.value.trim(), status: [false, false, false, false] });
                localStorage.setItem("syllabus", JSON.stringify(data));
                renderSyllabus();
            }
        };
        subjDiv.appendChild(addCh);
        subjDiv.appendChild(btn);

        container.appendChild(subjDiv);
    });
}
document.getElementById('add-subject').onclick = () => {
    const val = document.getElementById('new-subject').value.trim();
    if (val) {
        const data = JSON.parse(localStorage.getItem("syllabus") || "{}");
        if (!data[val]) data[val] = [];
        localStorage.setItem("syllabus", JSON.stringify(data));
        document.getElementById('new-subject').value = "";
        renderSyllabus();
    }
};
renderSyllabus();

// ===== Notes Tab =====
document.getElementById('save-note').onclick = () => {
    const date = document.getElementById('note-date').value;
    const text = document.getElementById('note-input').value.trim();
    if (date && text) {
        const notes = JSON.parse(localStorage.getItem("notes") || "{}");
        if (!notes[date]) notes[date] = [];
        notes[date].push(text);
        localStorage.setItem("notes", JSON.stringify(notes));
        document.getElementById('note-input').value = "";
        renderNotes();
    }
};
function renderNotes() {
    const notes = JSON.parse(localStorage.getItem("notes") || "{}");
    const cont = document.getElementById('notes-list');
    cont.innerHTML = "";
    Object.keys(notes).sort().forEach(date => {
        const box = document.createElement('div');
        box.innerHTML = `<strong>${date}</strong><ul>${notes[date].map(n => `<li>${n}</li>`).join("")}</ul>`;
        cont.appendChild(box);
    });
}
renderNotes();

// ===== Journal Tab =====
document.getElementById('journal-unlock').onclick = () => {
    const pass = document.getElementById('journal-password').value;
    if (pass === "jai bhavani") {
        document.getElementById('journal-auth').style.display = "none";
        document.getElementById('journal-entries').style.display = "block";
        renderJournal();
    } else {
        document.getElementById('journal-msg').textContent = "Wrong password!";
    }
};
document.getElementById('save-journal-entry').onclick = () => {
    const date = document.getElementById('journal-date').value;
    const text = document.getElementById('journal-entry').value.trim();
    if (date && text) {
        const journal = JSON.parse(localStorage.getItem("journal") || "{}");
        if (!journal[date]) journal[date] = [];
        journal[date].push(text);
        localStorage.setItem("journal", JSON.stringify(journal));
        document.getElementById('journal-entry').value = "";
        renderJournal();
    }
};
function renderJournal() {
    const journal = JSON.parse(localStorage.getItem("journal") || "{}");
    const cont = document.getElementById('journal-entries-list');
    cont.innerHTML = "";
    Object.keys(journal).sort().forEach(date => {
        const box = document.createElement('div');
        box.innerHTML = `<strong>${date}</strong><ul>${journal[date].map(n => `<li>${n}</li>`).join("")}</ul>`;
        cont.appendChild(box);
    });
}

// ===== Progress Tab =====
function updateStats() {
    // Called after pomodoro finishes
    updateWeeklyStats();
    updateProgressTab();
}

function updateWeeklyStats() {
    const logs = JSON.parse(localStorage.getItem("pomodoroLog") || "[]")
        .filter(l => Date.now() - new Date(l.date).getTime() < 7 * 24 * 60 * 60 * 1000);
    const hrs = logs.reduce((sum, l) => sum + l.duration / 60, 0);
    document.getElementById('weekly-hours').textContent = hrs.toFixed(1);
    document.getElementById('weekly-tasks').textContent =
        JSON.parse(localStorage.getItem("tasks") || "[]").filter(t => t.done).length;
}

function updateProgressTab() {
    const logs = JSON.parse(localStorage.getItem("pomodoroLog") || "[]");
    const hoursPerDay = {};
    logs.forEach(l => {
        const date = new Date(l.date).toLocaleDateString();
        hoursPerDay[date] = (hoursPerDay[date] || 0) + l.duration / 60;
    });

    // Peak productivity
    const times = {};
    logs.forEach(l => {
        const hour = new Date(l.date).getHours();
        times[hour] = (times[hour] || 0) + l.duration;
    });
    let peakHour = Object.keys(times).sort((a, b) => times[b] - times[a])[0];

    document.getElementById('weekly-patterns').innerHTML =
        `Peak time: ${peakHour}:00 hrs<br>` +
        `Best day: ${Object.keys(hoursPerDay).sort((a, b) => hoursPerDay[b] - hoursPerDay[a])[0]}`;

    // Recommendations simple
    document.getElementById('recommendations').textContent =
        peakHour < 12 ? "You focus best in the morning — plan heavy topics then." :
        "Evening hours suit you — schedule accordingly.";

    drawDailyHoursGraph(hoursPerDay);
}

// ===== Graph Drawing =====
function drawDailyHoursGraph(dataObj) {
    const ctx = document.getElementById('daily-hours-graph').getContext('2d');
    const labels = Object.keys(dataObj);
    const dataVals = Object.values(dataObj);
    ctx.clearRect(0, 0, 350, 100);
    const max = Math.max(...dataVals, 1);
    dataVals.forEach((val, i) => {
        ctx.fillStyle = '#49a3f1';
        ctx.fillRect(i * 40 + 10, 100 - (val / max) * 80, 25, (val / max) * 80);
        ctx.fillStyle = '#184267';
        ctx.fillText(labels[i].split('/').slice(0, 2).join('/'), i * 40 + 5, 95);
    });
}

// ===== Init =====
updateDashboard();

