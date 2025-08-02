// Show date
document.getElementById("date").textContent = new Date().toDateString();

// Tab switching
function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}
showTab('dashboard'); // default tab

// Timer
let timerInterval;
function startTimer() {
  let minutes = parseInt(document.getElementById("timeInput").value);
  if (isNaN(minutes) || minutes <= 0) return;

  let seconds = minutes * 60;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    let min = Math.floor(seconds / 60);
    let sec = seconds % 60;
    document.getElementById("countdown").textContent =
      `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    if (--seconds < 0) {
      clearInterval(timerInterval);
      alert("Time's up!");
    }
  }, 1000);
}

// Tasks
function addTask() {
  const input = document.getElementById("taskInput");
  const taskText = input.value.trim();
  if (taskText) {
    const li = document.createElement("li");
    li.textContent = taskText;
    li.onclick = () => li.remove();
    document.getElementById("taskList").appendChild(li);
    input.value = "";
  }
}

// Syllabus
function addSyllabus() {
  const input = document.getElementById("syllabusInput");
  const text = input.value.trim();
  if (text) {
    const li = document.createElement("li");
    li.textContent = text;
    li.onclick = () => li.style.textDecoration = "line-through";
    document.getElementById("syllabusList").appendChild(li);
    input.value = "";
  }
}

// Notes
function saveNotes() {
  const text = document.getElementById("noteArea").value;
  localStorage.setItem("lakshyaNotes", text);
  alert("Notes saved!");
}
document.getElementById("noteArea").value = localStorage.getItem("lakshyaNotes") || "";

// Chart.js Progress Tracker
const ctx = document.getElementById("progressChart").getContext("2d");
const progressChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Maths', 'Science', 'English', 'SST', 'Hindi'],
    datasets: [{
      label: 'Completion %',
      data: [70, 50, 60, 40, 80],
      backgroundColor: ['#f88', '#8cf', '#c8f', '#fc8', '#8f8']
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true, max: 100 }
    }
  }
});
