// البيانات الأساسية
let data = {
    startDate: null,
    tasks: {
        today: [],
        important: [],
        unfinished: [],
        completed: []
    }
};

// تحميل البيانات عند بدء التطبيق
function loadData() {
    const saved = localStorage.getItem('productivity100Days');
    if (saved) {
        data = JSON.parse(saved);
        if (!data.startDate) {
            data.startDate = new Date().toISOString();
        }
    } else {
        data.startDate = new Date().toISOString();
    }
    saveData();
}

// حفظ البيانات
function saveData() {
    localStorage.setItem('productivity100Days', JSON.stringify(data));
}

// حساب رقم اليوم الحالي
function getCurrentDay() {
    const today = new Date();
    const diff = Math.floor((today - CHALLENGE_START) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(diff, CHALLENGE_DAYS));
}

// عرض التاريخ
function updateHeader() {
    document.getElementById('currentDay').textContent = getCurrentDay();
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('ar-EG');
    document.getElementById('totalCompleted').textContent = data.tasks.completed.length;
}

// إضافة مهمة
function addTask() {
    const input = document.getElementById('taskInput');
    const type = document.getElementById('taskType').value;
    const text = input.value.trim();

    if (!text) {
        alert('الرجاء كتابة المهمة!');
        return;
    }

    const task = {
        id: Date.now(),
        text: text,
        created: new Date().toISOString(),
        completed: false
    };

    if (type === 'important') {
        data.tasks.important.push(task);
    } else {
        data.tasks.today.push(task);
    }

    input.value = '';
    saveData();
    renderAllTasks();
}

// إنجاز مهمة
// ملاحظة مهمة: المهام الأساسية تبقى في قسمها حتى لو اكتملت - لا تُنقل للمهام المكتملة
function completeTask(id, type) {
    let task;
    const lists = type === 'important' ? data.tasks.important : 
                 type === 'unfinished' ? data.tasks.unfinished : data.tasks.today;
    
    const index = lists.findIndex(t => t.id === id);
    if (index !== -1) {
        if (type === 'important') {
            // المهام الأساسية: علّمها كمكتملة لكن ابقها في القسم
            lists[index].completed = true;
            lists[index].completedDate = new Date().toISOString();
        } else {
            // المهام الأخرى: انقلها إلى المهام المكتملة
            task = lists.splice(index, 1)[0];
            task.completed = true;
            task.completedDate = new Date().toISOString();
            data.tasks.completed.push(task);
        }
        saveData();
        renderAllTasks();
    }
}

// حذف مهمة
function deleteTask(id, type) {
    if (!confirm('هل تريد حذف هذه المهمة؟')) return;
    
    const lists = type === 'important' ? data.tasks.important : 
                 type === 'unfinished' ? data.tasks.unfinished : data.tasks.today;
    
    const index = lists.findIndex(t => t.id === id);
    if (index !== -1) {
        lists.splice(index, 1);
        saveData();
        renderAllTasks();
    }
}

function deleteCompletedTask(id) {
    if (!confirm('هل تريد حذف هذه المهمة المكتملة؟')) return;
    const index = data.tasks.completed.findIndex(t => t.id === id);
    if (index !== -1) {
        data.tasks.completed.splice(index, 1);
        saveData();
        renderAllTasks();
    }
}

// عرض المهام
function renderTasks(tasks, containerId, type) {
    const container = document.getElementById(containerId);
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>لا توجد مهام حالياً</h3>
                <p>ابدأ بإضافة مهام جديدة!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tasks.map(task => {
        // تحديد الفئة (class) بناءً على حالة المهمة ونوعها
        const taskClasses = type === 'important' && task.completed ? 'task-item completed-important' : 'task-item';
        return `
        <div class="${taskClasses}">
            <input type="checkbox" class="checkbox" ${task.completed ? 'checked disabled' : ''}>
            <div class="task-text">${task.text}</div>
            <span class="task-type">${type === 'important' ? 'أساسية' : type === 'unfinished' ? 'مؤجلة' : 'يومية'}</span>
            <div class="task-actions">
                <button class="btn-done" onclick="completeTask(${task.id}, '${type}')">✓ تم</button>
                <button class="btn-delete" onclick="deleteTask(${task.id}, '${type}')">✕</button>
            </div>
        </div>
    `;
    }).join('');
}

// عرض المهام المكتملة
function renderCompletedTasks() {
    const container = document.getElementById('completedTasksList');
    if (!container) return;
    const completed = [...(data.tasks.completed || [])].reverse();

    if (completed.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>لم تكمل أي مهام بعد</h3>
                <p>استمر في العمل!</p>
            </div>
        `;
        return;
    }

    const html = completed.map(function(task) {
        const dateStr = task.completedDate ? new Date(task.completedDate).toLocaleDateString('ar-EG') : 'تاريخ غير معروف';
        return `
        <div class="completed-task-item">
            <div class="task-text">✓ ${task.text}</div>
            <div class="task-date">اكتملت في: ${dateStr}</div>
            <button class="btn-delete" onclick="deleteCompletedTask(${task.id})" style="padding:4px 8px; font-size:0.85em;">حذف</button>
        </div>
    `;
    }).join('');
    container.innerHTML = html;

    updateProductivityStats();
}

// حساب إحصائيات الإنتاجية
function updateProductivityStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayCount = data.tasks.completed.filter(t => {
        const date = new Date(t.completedDate);
        return date >= today;
    }).length;

    const weekCount = data.tasks.completed.filter(t => {
        const date = new Date(t.completedDate);
        return date >= weekAgo;
    }).length;

    const monthCount = data.tasks.completed.filter(t => {
        const date = new Date(t.completedDate);
        return date >= monthStart;
    }).length;

    document.getElementById('todayCount').textContent = todayCount;
    document.getElementById('weekCount').textContent = weekCount;
    document.getElementById('monthCount').textContent = monthCount;
}

// عرض جميع المهام
function renderAllTasks() {
    renderTasks(data.tasks.today, 'todayTasksList', 'today');
    renderTasks(data.tasks.important, 'importantTasksList', 'important');
    renderTasks(data.tasks.unfinished, 'unfinishedTasksList', 'unfinished');
    renderCompletedTasks();
    updateHeader();
}

// نقل المهام غير المكتملة تلقائياً
function moveUnfinishedTasks() {
    const lastCheck = localStorage.getItem('lastMidnightCheck');
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!lastCheck || new Date(lastCheck) < midnight) {
        data.tasks.unfinished.push(...data.tasks.today);
        data.tasks.today = [];
        localStorage.setItem('lastMidnightCheck', midnight.toISOString());
        saveData();
    }
}

// التنقل بين الصفحات
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    event.target.classList.add('active');
}

// السماح بإضافة مهمة بالضغط على Enter
document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ DOM Loaded - بدء initialization');
    
    const taskInput = document.getElementById('taskInput');
    if (taskInput) {
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }
    
    // إعادة تحميل البيانات بعد loading كامل الصفحة
    loadData();
    moveUnfinishedTasks();
    renderAllTasks();
    renderProjects();
    renderRoutines();
    renderCourses();
    updateChallenge();
    populateTimerCourseSelect();
    copyRoutineToTodayIfNeeded();
    updateClockAndTotals();
    
    console.log('✓ تم تحميل جميع البيانات');
});

// في حالة أن الـ script يحمل قبل DOM
if (document.readyState === 'loading') {
    // سننتظر حتى DOMContentLoaded
} else {
    // إذا كان الـ script يحمل بعد DOM
    loadData();
    moveUnfinishedTasks();
    renderAllTasks();
    renderProjects();
    renderRoutines();
    renderCourses();
    updateChallenge();
    populateTimerCourseSelect();
    updateClockAndTotals();
}

// فحص منتصف الليل كل دقيقة
setInterval(moveUnfinishedTasks, 60000);

// ------------------- تحدي الـ101 يوم -------------------
const CHALLENGE_START = new Date(2025, 11, 26, 18, 0, 0); // 26 ديسمبر 2025 الساعة 18:00
const CHALLENGE_DAYS = 101;

function updateChallenge() {
    const now = new Date();
    const sd = document.getElementById('startDate'); if (sd) sd.textContent = CHALLENGE_START.toLocaleString('ar-EG');
    const elapsedMs = now - CHALLENGE_START;
    const elapsedDays = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
    const daysLeft = Math.max(0, CHALLENGE_DAYS - elapsedDays);
    const progress = Math.min(100, Math.round((elapsedDays / CHALLENGE_DAYS) * 100));
    const endDate = new Date(CHALLENGE_START.getTime() + (CHALLENGE_DAYS - 1) * 24 * 60 * 60 * 1000);

    const elDaysLeft = document.getElementById('daysLeft');
    const elPct = document.getElementById('progressPct');
    const elEnd = document.getElementById('endDate');
    const elBar = document.getElementById('progressBar');
    const elDaysLeftBox = document.getElementById('daysLeftBox');
    const elPctBox = document.getElementById('progressPctBox');

    if (elDaysLeft) elDaysLeft.textContent = daysLeft;
    if (elDaysLeftBox) elDaysLeftBox.textContent = daysLeft;
    if (elPct) elPct.textContent = progress + '%';
    if (elPctBox) elPctBox.textContent = progress + '%';
    if (elEnd) elEnd.textContent = endDate.toLocaleString('ar-EG');
    if (elBar) elBar.value = progress;
}

setInterval(updateChallenge, 60 * 1000);
updateChallenge();

// ------------------- مشاريع -------------------
function loadProjects() {
    try { return JSON.parse(localStorage.getItem('prod_projects') || '[]'); }
    catch { return []; }
}

function saveProjects(list) { localStorage.setItem('prod_projects', JSON.stringify(list)); }

function renderProjects() {
    const list = loadProjects();
    const containerA = document.getElementById('projectList');
    const containerB = document.getElementById('projectListPage');
    const empty = '<div class="empty-state"><h3>لا توجد مشاريع</h3></div>';
    if (!list || list.length === 0) {
        if (containerA) containerA.innerHTML = empty;
        if (containerB) containerB.innerHTML = empty;
        return;
    }
    const html = list.map(p => `
        <div class="task-item ${p.status==='done'? 'completed':''}">
            <div class="task-text"><strong>${p.name}</strong><div style="font-size:0.9em;color:#ccc;">${p.desc||''}</div></div>
            <div class="task-actions">
                <button class="btn" onclick="addProjectTaskToToday(${p.id})">أضف لليوم</button>
                <button class="btn-delete" onclick="deleteProject(${p.id})">حذف</button>
            </div>
        </div>
    `).join('');
    if (containerA) containerA.innerHTML = html;
    if (containerB) containerB.innerHTML = html;
}

function addProjectTaskToToday(projId) {
    const projects = loadProjects();
    const p = projects.find(x => x.id === projId);
    if (!p) return;
    const t = { id: Date.now(), text: `مهمة من مشروع: ${p.name}`, created: new Date().toISOString(), completed: false };
    data.tasks.today.push(t);
    saveData();
    renderAllTasks();
}

function deleteProject(id) {
    let list = loadProjects();
    list = list.filter(p => p.id !== id);
    saveProjects(list);
    renderProjects();
}

document.addEventListener('submit', function(e){
    if (e.target && (e.target.id === 'projectForm' || e.target.id === 'projectFormPage')) {
        e.preventDefault();
        console.log('✓ Project Form submitted');
        const nameEl = document.getElementById('projName') || document.getElementById('projNamePage');
        const descEl = document.getElementById('projDesc') || document.getElementById('projDescPage');
        const name = nameEl ? nameEl.value.trim() : '';
        const desc = descEl ? descEl.value.trim() : '';
        if (!name) return alert('اكتب اسم المشروع');
        const list = loadProjects();
        const project = { id: Date.now(), name, desc, status: 'in' };
        list.push(project);
        saveProjects(list);
        if (nameEl) nameEl.value = '';
        if (descEl) descEl.value = '';
        renderProjects();
        console.log('✓ Project added:', project);
    }
});

renderProjects();

// ------------------- روتين يومي (ينسخ تلقائياً) -------------------
function loadRoutines() { try { return JSON.parse(localStorage.getItem('prod_routines') || '[]'); } catch { return []; } }
function saveRoutines(r) { localStorage.setItem('prod_routines', JSON.stringify(r)); }
function renderRoutines() {
    const list = loadRoutines();
    const cA = document.getElementById('routineList');
    const cB = document.getElementById('routineListPage');
    const empty = '<div class="empty-state"><h3>لا يوجد روتين</h3></div>';
    if (!list || list.length === 0) {
        if (cA) cA.innerHTML = empty;
        if (cB) cB.innerHTML = empty;
        return;
    }
    const html = list.map(r => `
        <div class="task-item">
            <div class="task-text">${r.text}</div>
            <div class="task-actions">
                <button class="btn" onclick="addRoutineTaskToToday(${r.id})">أضف لليوم</button>
                <button class="btn-delete" onclick="deleteRoutine(${r.id})">حذف</button>
            </div>
        </div>
    `).join('');
    if (cA) cA.innerHTML = html;
    if (cB) cB.innerHTML = html;
}

function addRoutineTaskToToday(rid) {
    const list = loadRoutines();
    const r = list.find(x => x.id === rid);
    if (!r) return;
    const t = { id: Date.now(), text: r.text, created: new Date().toISOString(), completed: false };
    data.tasks.today.push(t);
    saveData(); renderAllTasks();
}

function deleteRoutine(id) { let list = loadRoutines(); list = list.filter(r=>r.id!==id); saveRoutines(list); renderRoutines(); }

document.addEventListener('submit', function(e){
    if (e.target && (e.target.id === 'routineForm' || e.target.id === 'routineFormPage')) {
        e.preventDefault();
        console.log('✓ Routine Form submitted');
        const textEl = document.getElementById('routineTask') || document.getElementById('routineTitlePage');
        const descEl = document.getElementById('routineDescPage');
        const text = textEl ? textEl.value.trim() : '';
        if (!text) return alert('اكتب مهمة روتين');
        const list = loadRoutines();
        list.push({ id: Date.now(), text, desc: descEl ? descEl.value.trim() : '' });
        saveRoutines(list);
        if (textEl) textEl.value = '';
        if (descEl) descEl.value = '';
        renderRoutines();
        console.log('✓ Routine added:', text);
    }
});

// عند بداية كل يوم، انسخ الروتين إلى قائمة اليوم إذا لم ينسخ بعد
function isoDate(d){ return d.toISOString().slice(0,10); }
function copyRoutineToTodayIfNeeded(){
    const today = isoDate(new Date());
    const last = localStorage.getItem('lastRoutineCopy') || '';
    if (last === today) return;
    const routines = loadRoutines();
    routines.forEach(r => {
        data.tasks.today.push({ id: Date.now()+Math.random(), text: r.text, created: new Date().toISOString(), completed:false });
    });
    saveData();
    localStorage.setItem('lastRoutineCopy', today);
    renderAllTasks();
}

// عند تحميل الصفحة تحرك مهمات اليوم السابقة غير المكتملة إلى المؤجلة
// لكن المهام الأساسية تبقى دائمة ولا تُنقل أبداً
function movePreviousUnfinishedToDeferred(){
    const lastCheck = localStorage.getItem('lastMidnightCheck');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (!lastCheck || new Date(lastCheck) < today) {
        // تم تغيير اليوم، أي مهمات لم تكتمل في data.tasks.today ستذهب للمؤجلة
        // لكن نبقي المهام الأساسية (important tasks) ثابتة
        if (data.tasks.today && data.tasks.today.length) {
            data.tasks.unfinished.push(...data.tasks.today.filter(t=>!t.completed));
            data.tasks.today = [];
        }
        // المهام الأساسية تبقى كما هي - لا نحذفها ولا ننقلها
        // important tasks remain permanent and untouched
        localStorage.setItem('lastMidnightCheck', today.toISOString());
        saveData();
        renderAllTasks();
    }
}

// نسخ الروتين فور التحميل إذا لزم
copyRoutineToTodayIfNeeded();
movePreviousUnfinishedToDeferred();

// ------------------- كورسات -------------------
function loadCourses(){ try { return JSON.parse(localStorage.getItem('prod_courses') || '[]'); } catch { return []; } }
function saveCourses(c){ localStorage.setItem('prod_courses', JSON.stringify(c)); }
function renderCourses(){
    const list = loadCourses();
    const cA = document.getElementById('courseList');
    const cB = document.getElementById('courseListPage');
    const empty = '<div class="empty-state"><h3>لا توجد كورسات</h3></div>';
    if (!list || list.length === 0) {
        if (cA) cA.innerHTML = empty;
        if (cB) cB.innerHTML = empty;
        populateTimerCourseSelect();
        return;
    }
    const html = list.map(cs => `
        <div class="task-item">
            <div class="task-text"><strong>${cs.name}</strong><div style="font-size:0.9em;color:#ccc;">${cs.start} → ${cs.end}</div></div>
            <div class="task-actions">
                <button class="btn" onclick="addCourseTaskToToday(${cs.id})">أضف لليوم</button>
                <button class="btn-delete" onclick="deleteCourse(${cs.id})">حذف</button>
            </div>
        </div>
    `).join('');
    if (cA) cA.innerHTML = html;
    if (cB) cB.innerHTML = html;
    populateTimerCourseSelect();
}

function addCourseTaskToToday(cid){
    const list = loadCourses(); const cs = list.find(x=>x.id===cid); if(!cs) return;
    data.tasks.today.push({ id: Date.now(), text: `مهمة من كورس: ${cs.name}`, created: new Date().toISOString(), completed:false });
    saveData(); renderAllTasks();
}

function deleteCourse(id){ let list = loadCourses(); list = list.filter(c=>c.id!==id); saveCourses(list); renderCourses(); }

document.addEventListener('submit', function(e){
    if (e.target && (e.target.id === 'courseForm' || e.target.id === 'courseFormPage')){
        e.preventDefault();
        console.log('✓ Course Form submitted');
        const nameEl = document.getElementById('courseName') || document.getElementById('courseNamePage');
        const startEl = document.getElementById('courseStart') || document.getElementById('courseStartPage');
        const endEl = document.getElementById('courseEnd') || document.getElementById('courseEndPage');
        const descEl = document.getElementById('courseDescPage');
        const name = nameEl.value.trim();
        const start = startEl.value;
        const end = endEl.value;
        if(!name||!start||!end) return alert('املأ جميع حقول الكورس');
        const list = loadCourses(); 
        const course = { id: Date.now(), name, start, end, desc: descEl?descEl.value.trim():'' };
        list.push(course); 
        saveCourses(list);
        if (nameEl) nameEl.value=''; 
        if (startEl) startEl.value=''; 
        if (endEl) endEl.value=''; 
        if (descEl) descEl.value='';
        renderCourses();
        console.log('✓ Course added:', course);
    }
});

renderCourses();

// الوظائف المساعدة للمؤقت والكورس
function populateTimerCourseSelect(){
    const sel = document.getElementById('timerCourseSelect');
    if (!sel) return;
    const list = loadCourses();
    sel.innerHTML = '<option value="none">لا يوجد كورس</option>' + list.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}

function resetStudy(){
    if (studyTimerInterval) clearInterval(studyTimerInterval);
    studyStart = null; studyTimerInterval = null;
    const disp = document.getElementById('timerDisplay'); if (disp) disp.textContent = '00:00:00';
}

// Export / Import backup
function exportData(){
    const obj = {};
    for (let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); obj[k]=localStorage.getItem(k); }
    const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `prod_backup_${(new Date()).toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function importDataFile(file){
    const reader = new FileReader();
    reader.onload = function(e){
        try{
            const obj = JSON.parse(e.target.result);
            if (!confirm('هل تريد استبدال بيانات التطبيق بالملف المستورد؟')) return;
            Object.keys(obj).forEach(k=> localStorage.setItem(k, obj[k]));
            loadData(); renderAllTasks(); renderProjects(); renderRoutines(); renderCourses(); updateChallenge(); populateTimerCourseSelect();
            alert('تم الاستيراد');
        }catch(err){ alert('ملف غير صالح'); }
    };
    reader.readAsText(file);
}

const expBtn = document.getElementById('exportBtn'); if (expBtn) expBtn.addEventListener('click', exportData);
const impBtn = document.getElementById('importBtn'); if (impBtn) impBtn.addEventListener('click', ()=>{ const f = document.getElementById('importFile'); if (f) f.click(); });
const impFile = document.getElementById('importFile'); if (impFile) impFile.addEventListener('change', function(e){ if (this.files && this.files[0]) importDataFile(this.files[0]); });

const resetBtn = document.getElementById('resetTimer'); if (resetBtn) resetBtn.addEventListener('click', resetStudy);
const startBtn = document.getElementById('startTimer'); if (startBtn) startBtn.addEventListener('click', startStudy);
const stopBtn = document.getElementById('stopTimer'); if (stopBtn) stopBtn.addEventListener('click', stopStudy);
populateTimerCourseSelect();

// تأكد من تحديث البيانات بعد تحميل الصفحة
setInterval(function() {
    updateChallenge();
    updateClockAndTotals();
}, 500);

// إذا كانت الصفحة محملة بالفعل، استدعِ التحديث فوراً
updateClockAndTotals();
updateChallenge();

// ------------------- مؤقت المذاكرة -------------------
let studyStart = null;
let studyTimerInterval = null;

function formatHMS(ms){
    const s = Math.floor(ms/1000);
    const hh = Math.floor(s/3600); const mm = Math.floor((s%3600)/60); const ss = s%60;
    return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

function updateClockAndTotals(){
    const now = new Date();
    const clk = document.getElementById('clock'); if (clk) clk.textContent = now.toLocaleTimeString('ar-EG');
    const key = 'study-' + isoDate(now);
    const total = parseInt(localStorage.getItem(key) || '0', 10);
    const el = document.getElementById('todayTotal'); if (el) el.textContent = formatHMS(total);
}

function startStudy(){
    if (studyStart) return;
    studyStart = Date.now();
    studyTimerInterval = setInterval(()=>{
        const elapsed = Date.now() - studyStart;
        const disp = document.getElementById('timerDisplay'); if (disp) disp.textContent = formatHMS(elapsed);
    }, 500);
}

function stopStudy(){
    if (!studyStart) return;
    clearInterval(studyTimerInterval);
    const elapsed = Date.now() - studyStart;
    const key = 'study-' + isoDate(new Date());
    const prev = parseInt(localStorage.getItem(key) || '0',10);
    localStorage.setItem(key, String(prev + elapsed));
    // save per-course if selected
    const sel = document.getElementById('timerCourseSelect');
    if (sel && sel.value && sel.value !== 'none') {
        const cid = sel.value;
        const ckey = `study-course-${cid}-${isoDate(new Date())}`;
        const prevc = parseInt(localStorage.getItem(ckey) || '0',10);
        localStorage.setItem(ckey, String(prevc + elapsed));
    }
    studyStart = null; studyTimerInterval = null;
    const disp = document.getElementById('timerDisplay'); if (disp) disp.textContent = '00:00:00';
    updateClockAndTotals();
}

setInterval(updateClockAndTotals, 1000);
updateClockAndTotals();
