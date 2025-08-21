// === Helper functions for localStorage ===
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function loadData(key, defaultValue) {
  return JSON.parse(localStorage.getItem(key)) || defaultValue;
}

// === Tab Navigation ===
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(tab=>tab.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// === Motivational Quotes ===
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
document.getElementById("quote").innerText = quotes[Math.floor(Math.random()*quotes.length)];

// === Shloka Persistence ===
const shlokaInput = document.getElementById("shlokaInput");
shlokaInput.value = loadData("shloka",""); 
shlokaInput.addEventListener("input", ()=> saveData("shloka", shlokaInput.value));

// === To-do List ===
const taskList = document.getElementById("taskList");
let tasks = loadData("tasks", []);
function renderTasks() {
  taskList.innerHTML="";
  tasks.forEach((t,i)=>{
    const li=document.createElement("li");
    li.innerHTML=`<input type='checkbox' ${t.done?"checked":""}> ${t.text}`;
    li.querySelector("input").addEventListener("change",()=>{
      tasks[i].done=!tasks[i].done;
      saveData("tasks",tasks);
    });
    taskList.appendChild(li);
  });
}
renderTasks();
document.getElementById("addTaskBtn").onclick=()=>{
  const text=document.getElementById("newTaskInput").value;
  if(text){
    tasks.push({text,done:false});
    saveData("tasks",tasks);
    document.getElementById("newTaskInput").value="";
    renderTasks();
  }
};
document.getElementById("refreshTasks").onclick=()=>{
  tasks=[]; saveData("tasks",tasks); renderTasks();
};

// === Pomodoro Timer ===
let timer, minutes=25, seconds=0, running=false;
let studyLog = loadData("studyLog", {}); // date -> minutes
function logStudy(mins){
  const today=new Date().toLocaleDateString();
  studyLog[today]=(studyLog[today]||0)+mins;
  saveData("studyLog",studyLog);
  updateCharts();
}
document.getElementById("startTimer").onclick=()=>{
  if(running) return;
  running=true;
  minutes=parseInt(document.getElementById("pomodoroMinutes").value)||25;
  seconds=0;
  timer=setInterval(()=>{
    if(seconds===0){
      if(minutes===0){
        clearInterval(timer);
        running=false;
        alert("Pomodoro Finished!");
        logStudy(parseInt(document.getElementById("pomodoroMinutes").value)||25);
      } else { minutes--; seconds=59; }
    } else seconds--;
    document.getElementById("timerDisplay").innerText=`${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
    document.getElementById("pomodoroStatus").innerText=`${minutes}:${seconds} (${running?"Running":"Idle"})`;
  },1000);
};
document.getElementById("stopTimer").onclick=()=>{
  clearInterval(timer); running=false;
};

// === Journal (Password) ===
let journalEntries=loadData("journal",[]);
function renderJournal(){
  const container=document.getElementById("journalEntries");
  container.innerHTML="";
  journalEntries.forEach(e=>{
    const div=document.createElement("div");
    div.textContent=e;
    container.appendChild(div);
  });
}
document.getElementById("unlockJournal").onclick=()=>{
  if(document.getElementById("journalPassword").value==="jai bhavani"){
    document.getElementById("journalSection").style.display="block";
    renderJournal();
  } else { alert("Wrong password!"); }
};
document.getElementById("saveJournal").onclick=()=>{
  const entry=document.getElementById("journalEntry").value;
  if(entry){
    const text=new Date().toLocaleDateString()+": "+entry;
    journalEntries.push(text);
    saveData("journal",journalEntries);
    document.getElementById("journalEntry").value="";
    renderJournal();
  }
};

// === Ideas ===
let ideas=loadData("ideas",[]);
function renderIdeas(){
  const container=document.getElementById("ideasList");
  container.innerHTML="";
  ideas.forEach(i=>{
    const div=document.createElement("div");
    div.textContent=i;
    container.appendChild(div);
  });
}
renderIdeas();
document.getElementById("saveIdea").onclick=()=>{
  const entry=document.getElementById("ideaInput").value;
  if(entry){
    const text=new Date().toLocaleDateString()+": "+entry;
    ideas.push(text);
    saveData("ideas",ideas);
    document.getElementById("ideaInput").value="";
    renderIdeas();
  }
};

// === Syllabus ===
let subjects=loadData("subjects",[]);
function renderSyllabus(){
  const container=document.getElementById("subjectsContainer");
  container.innerHTML="";
  subjects.forEach((s,si)=>{
    const div=document.createElement("div");
    div.innerHTML=`<h3>${s.name}</h3><button onclick="addChapter(${si})">Add Chapter</button><div class="chapters"></div>`;
    const chDiv=div.querySelector(".chapters");
    s.chapters.forEach((c,ci)=>{
      const chap=document.createElement("div");
      chap.innerHTML=`<b>${c.name}</b><br>
        ${["Lecture","Notes","Questions","Revision"].map((label,idx)=>
          `<label><input type="checkbox" ${c.checks[idx]?"checked":""} onchange="toggleCheck(${si},${ci},${idx})"> ${label}</label>`
        ).join(" ")}`;
      chDiv.appendChild(chap);
    });
    container.appendChild(div);
  });
}
document.getElementById("addSubjectBtn").onclick=()=>{
  const subject=document.getElementById("newSubjectInput").value;
  if(subject){
    subjects.push({name:subject,chapters:[]});
    saveData("subjects",subjects);
    document.getElementById("newSubjectInput").value="";
    renderSyllabus();
  }
};
function addChapter(si){
  const chapter=prompt("Enter Chapter Name:");
  if(chapter){
    subjects[si].chapters.push({name:chapter,checks:[false,false,false,false]});
    saveData("subjects",subjects);
    renderSyllabus();
  }
}
function toggleCheck(si,ci,idx){
  subjects[si].chapters[ci].checks[idx]=!subjects[si].chapters[ci].checks[idx];
  saveData("subjects",subjects);
}
renderSyllabus();

// === Progress Charts ===
const studyCtx=document.getElementById("studyChart").getContext("2d");
const studyChart=new Chart(studyCtx,{
  type:"bar",
  data:{labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],datasets:[{label:"Hours",data:[0,0,0,0,0,0,0]}]},
  options:{responsive:true}
});

const subjectCtx=document.getElementById("subjectChart").getContext("2d");
const subjectChart=new Chart(subjectCtx,{
  type:"pie",
  data:{labels:[],datasets:[{data:[]}]},
  options:{responsive:true}
});

function updateCharts(){
  // update study chart
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  let weekly=[0,0,0,0,0,0,0];
  for(const date in studyLog){
    const d=new Date(date);
    if(!isNaN(d)){
      const day=d.getDay();
      weekly[day]+=studyLog[date];
    }
  }
  studyChart.data.datasets[0].data=weekly;
  studyChart.update();

  // update subject chart
  let subjLabels=[], subjData=[];
  subjects.forEach(s=>{
    subjLabels.push(s.name);
    let done=0,total=0;
    s.chapters.forEach(c=>{
      total+=4; done+=c.checks.filter(x=>x).length;
    });
    subjData.push(total?Math.round((done/total)*100):0);
  });
  subjectChart.data.labels=subjLabels;
  subjectChart.data.datasets[0].data=subjData;
  subjectChart.update();
}
updateCharts();

// === Study Streak ===
function calcStreak(){
  const dates=Object.keys(studyLog).map(d=>new Date(d));
  dates.sort((a,b)=>a-b);
  let current=0,longest=0,prev=null;
  dates.forEach(d=>{
    if(prev && (d-prev===86400000)) current++;
    else current=1;
    if(current>longest) longest=current;
    prev=d;
  });
  document.getElementById("streakInfo").innerText=`Current: ${current} | Longest: ${longest}`;
}
calcStreak();
