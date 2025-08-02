document.addEventListener('DOMContentLoaded', () => {
  // Tab logic
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');
  function activate(sec) {
    tabs.forEach(b => b.classList.toggle('active', b.dataset.tab === sec));
    contents.forEach(c => c.classList.toggle('active', c.id === sec));
  }
  tabs.forEach(b => b.addEventListener('click', () => activate(b.dataset.tab)));
  document.querySelectorAll('.action-buttons button').forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.tab)));
  activate('dashboard');

  // Date + Quote
  const quotes = ["Touch the sky with glory","Survival of the fittest - Darwin","Veer Bhogya Vasundhara","Sheelam Param Bhooshanam","Every move must have a purpose","Without error there is no brilliancy","The world obeys only one law: POWER","Hazaron ki bheed se ubhar ke aaunga, Mujh me kabiliyat hai mai kar ke dikhaunga","If you want to rise like the Sun, first burn like the Sun."];
  let qi = parseInt(localStorage.getItem('quoteIndex')||'0');
  document.getElementById('motivationalQuote').innerText = quotes[qi];
  localStorage.setItem('quoteIndex', (qi+1)%quotes.length);
  document.getElementById('dateDisplay').innerText = new Date().toLocaleDateString();

  // Shloka
  document.getElementById('saveShlokaBtn').onclick = () => {
    localStorage.setItem('shloka', document.getElementById('shlokaInput').value);
    alert('Shloka saved');
  };
  document.getElementById('shlokaInput').value = localStorage.getItem('shloka') || '';

  // Tasks
  function todayKey(offset=0){ let d=new Date(); d.setDate(d.getDate()+offset); return d.toISOString().split('T')[0]; }
  function loadTasks(){
    let tasks = JSON.parse(localStorage.getItem('tasks')||'{}');
    let td = todayKey(), yd = todayKey(-1);
    if(tasks[yd]){ let carry=tasks[yd].filter(t=>!t.done); tasks[td] = (tasks[td]||[]).concat(carry); delete tasks[yd]; }
    localStorage.setItem('tasks', JSON.stringify(tasks));
    let list=document.getElementById('taskList'); list.innerHTML='';
    (tasks[td]||[]).forEach((t,i)=>{
      let li=document.createElement('li');
      li.innerHTML = `<input type="checkbox" ${t.done?'checked':''} onclick="toggleTask(${i})"> ${t.text}`;
      list.appendChild(li);
    });
    updateTaskProgress(tasks[td]||[]);
  }
  window.toggleTask = (i)=>{
    let tasks=JSON.parse(localStorage.getItem('tasks')||'{}'), td=todayKey();
    tasks[td][i].done = !tasks[td][i].done;
    localStorage.setItem('tasks', JSON.stringify(tasks)); loadTasks();
  }
  document.getElementById('addTaskBtn').onclick = () => {
    let ti=document.getElementById('taskInput'), txt=ti.value.trim();
    if(!txt)return; let tasks=JSON.parse(localStorage.getItem('tasks')||'{}');
    let td=todayKey(); tasks[td]=tasks[td]||[]; tasks[td].push({text:txt,done:false});
    localStorage.setItem('tasks', JSON.stringify(tasks)); ti.value=''; loadTasks();
  }
  document.getElementById('refreshTasksBtn').onclick = ()=>localStorage.removeItem('tasks') & loadTasks();
  function updateTaskProgress(todayTasks){
    let done = todayTasks.filter(t=>t.done).length;
    let percent = todayTasks.length? Math.round(done/todayTasks.length*100):0;
    document.getElementById('taskProgress').value = percent;
  }
  loadTasks();

  // Syllabus with subjects
  function loadSubjects(){
    let subs=JSON.parse(localStorage.getItem('subjects')||'{}'), cont=document.getElementById('subjectsContainer');
    cont.innerHTML='';
    for(let sub in subs){
      let d=document.createElement('div');d.className='card';
      d.innerHTML = `<h3>${sub} <button onclick="deleteSubject('${sub}')">X</button></h3>
        <div>${subs[sub].map((ch,i)=>`
          <div><b>${ch.name}</b>
            ${['Lecture','Notes','Questions','Revision'].map((lab,idx)=>
              `<label><input type="checkbox" onchange="toggleCheck('${sub}',${i},${idx})" ${ch.checks[idx]?'checked':''}>${lab}</label>`
            ).join('')}<button onclick="deleteChapter('${sub}',${i})">Del</button></div>`
        ).join('')}
        <input placeholder="Chapter name" id="ch-${sub}"/><button onclick="addChapter('${sub}')">Add Chapter</button>`;
      cont.appendChild(d);
    }
    let sel=document.getElementById('timerSubject'); sel.innerHTML='<option value="">General</option>';
    Object.keys(subs).forEach(s=>sel.add(new Option(s,s)));
  }
  window.addSubjectBtn = () => {
    let s=document.getElementById('subjectInput').value.trim(); if(!s)return;
    let ss=JSON.parse(localStorage.getItem('subjects')||'{}'); ss[s]=ss[s]||[]; localStorage.setItem('subjects',JSON.stringify(ss));
    document.getElementById('subjectInput').value=''; loadSubjects();
  };
  window.addChapter = (sub)=>{
    let v=document.getElementById(`ch-${sub}`).value.trim(); if(!v)return;
    let ss=JSON.parse(localStorage.getItem('subjects')||'{}');
    ss[sub].push({name:v,checks:[false,false,false,false]});
    localStorage.setItem('subjects',JSON.stringify(ss)); loadSubjects();
  };
  window.toggleCheck = (sub,i,idx)=>{
    let ss=JSON.parse(localStorage.getItem('subjects')||'{}');
    ss[sub][i].checks[idx]=!ss[sub][i].checks[idx]; localStorage.setItem('subjects',JSON.stringify(ss)); loadSubjects();
  };
  window.deleteSubject = (sub)=>{let ss=JSON.parse(localStorage.getItem('subjects')||'{}'); delete ss[sub]; localStorage.setItem('subjects',JSON.stringify(ss)); loadSubjects();}
  window.deleteChapter = (sub,i)=>{let ss=JSON.parse(localStorage.getItem('subjects')||'{}'); ss[sub].splice(i,1); localStorage.setItem('subjects',JSON.stringify(ss)); loadSubjects();}
  document.getElementById('addSubjectBtn').onclick = () => window.addSubjectBtn();
  loadSubjects();

  // Journal & Notes
  document.getElementById('unlockJournalBtn').onclick = () => {
    if(document.getElementById('journalPassword').value==='jai bhavani'){
      document.getElementById('lockSection').style.display='none';
      document.getElementById('journalSection').style.display='block';
      document.getElementById('dailyNote').value = localStorage.getItem(`journal-${todayKey()}`) || '';
    } else alert('Wrong password');
  };
  document.getElementById('saveNoteBtn').onclick = () => {
    localStorage.setItem(`journal-${todayKey()}`, document.getElementById('dailyNote').value);
    alert('Saved journal');
  };

  // Pomodoro timer logic
  let timer, isRunning=false;
  function format(t){ let m=Math.floor(t/60), s=t%60; return `${m}:${s.toString().padStart(2,'0')}`; }
  document.getElementById('startTimerBtn').onclick = ()=>{
    if(isRunning)return; isRunning=true;
    let work=document.getElementById('workMinutes').value||25;
    let t=work*60, sub=document.getElementById('timerSubject').value||'General';
    document.getElementById('timerPreview').innerText = format(t);
    document.getElementById('timerDisplay').innerText = format(t);
    timer = setInterval(() => {
      t--; document.getElementById('timerDisplay').innerText = format(t);
      document.getElementById('timerPreview').innerText = format(t);
      if(t<=0){ clearInterval(timer); isRunning=false; logSession(sub, work); updateTaskProgress(); updateProgress(); }
    },1000);
  };
  document.getElementById('resetTimerBtn').onclick = ()=>{ clearInterval(timer); isRunning=false; document.getElementById('timerDisplay').innerText = '00:00'; };

  // Progress / Charts
  function updateProgress(){
    let log=JSON.parse(localStorage.getItem('studyLog')||'{}');
    let list=log[todayKey()]||[];
    let tot = list.reduce((a,e)=>a+e.duration,0);
    document.getElementById('weekStats').innerText = `Study Hours: ${(tot/60).toFixed(2)}`;
  }
  function logSession(sub,dur){
    let log=JSON.parse(localStorage.getItem('studyLog')||'{}');
    let td=todayKey(); log[td]=log[td]||[];
    log[td].push({subject:sub,duration:dur,time:Date.now()}); localStorage.setItem('studyLog', JSON.stringify(log));
  }
  function renderCharts(){
    const log = JSON.parse(localStorage.getItem('studyLog')||'{}');
    const labels = [], data = [];
    for(let i=6;i>=0;i--){ let d = todayKey(-i); labels.push(d.slice(5)); data.push((log[d]||[]).reduce((sm,e)=>sm+e.duration,0)); }
    new Chart(document.getElementById('studyChart').getContext('2d'), { type:'bar', data:{labels,datasets:[{label:'Min studied',data,backgroundColor:'#4fa4f7'}] }, options:{scales:{y:{beginAtZero:true}}} });
  }
  render…

})();
