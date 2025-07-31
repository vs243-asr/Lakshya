// ---------- Tab Switching ----------
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
}

// ---------- Daily Motivational Quote ----------
const quotes = [
  "Push yourself, because no one else is going to do it for you.",
  "Dream big. Work hard. Stay focused.",
  "Lakshya paane ke liye manzil dikhni chahiye.",
  "Discipline is the bridge between goals and success.",
  "Don't watch the clock; do what it does. Keep going.",
  "One day or day one. You decide.",
  "Clarity. Consistency. Confidence. Lakshya.",
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
function showQuote() {
  const usedQuotes = JSON.parse(localStorage.getItem('usedQuotes') || '[]');
  const availableQuotes = quotes.filter(q => !usedQuotes.includes(q));
  const quote = availableQuotes.length ? availableQuotes[Math.floor(Math.random() * availableQuotes.length)] : quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quoteBox").innerText = quote;
  if (!usedQuotes.includes(quote)) {
    usedQuotes.push(quote);
    if (usedQuotes.length >= quotes.length) usedQuotes.splice(0, usedQuotes.length - 9);
    localStorage.setItem("usedQuotes", JSON.stringify(usedQuotes));
  }
}

// ---------- Subject-wise Timer Log ----------
let subjectLogs = {};
function startSubjectTimer(subject) {
  if (!subjectLogs[subject]) subjectLogs[subject] = 0;
  let duration = parseInt(prompt("Enter study duration in minutes for " + subject));
  if (!isNaN(duration)) {
    subjectLogs[subject] += duration;
    updateSubjectGraph();
  }
}

// ---------- Update Subject Chart ----------
function updateSubjectGraph() {
  const ctx = document.getElementById('subjectChart').getContext('2d');
  const labels = Object.keys(subjectLogs);
  const data = Object.values(subjectLogs);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Minutes Studied',
        data: data,
        backgroundColor: '#5390d9'
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// ---------- Monthly Goals Progress ----------
function updateMonthlyGoals(consistency, hours, tasks) {
  document.getElementById("monthlyConsistency").innerText = `${consistency}/30 Days`;
  document.getElementById("monthlyHours").innerText = `${hours}/120 Hours`;
  document.getElementById("monthlyTasks").innerText = `${tasks}/100 Tasks`;
}

// ---------- Stotra Card Update ----------
function updateStotraCard() {
  const stotra = localStorage.getItem('dailyStotra') || 'Paste today\'s shloka here';
  document.getElementById("stotraCard").innerText = stotra;
}
function saveStotra() {
  const text = document.getElementById("stotraInput").value;
  localStorage.setItem('dailyStotra', text);
  updateStotraCard();
}

// ---------- Initialization ----------
function initializeApp() {
  showQuote();
  updateSubjectGraph();
  updateStotraCard();
  updateMonthlyGoals(0, 0, 0); // initialize default
}
