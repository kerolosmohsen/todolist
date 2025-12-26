let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentTab = 'chapters';
let tasks = {};

function loadData() {
    try {
        const saved = localStorage.getItem('spiritualTasks');
        if (saved) {
            tasks = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading data:', e);
        tasks = {};
    }
}

function saveData() {
    try {
        localStorage.setItem('spiritualTasks', JSON.stringify(tasks));
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
}

function toggleTask(day) {
    const key = currentYear + '-' + currentMonth + '-' + day + '-' + currentTab;
    tasks[key] = !tasks[key];
    saveData();
    renderDays();
    updateStats();
}

function isTaskCompleted(day) {
    const key = currentYear + '-' + currentMonth + '-' + day + '-' + currentTab;
    return tasks[key] || false;
}

function renderDays() {
    const grid = document.getElementById('daysGrid');
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    grid.innerHTML = '';

    for (let i = 1; i <= daysInMonth; i++) {
        const completed = isTaskCompleted(i);
        const today = new Date().getDate();
        const isToday = i === today && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
        const isPast = i < today && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        if (completed) dayCard.className += ' completed';
        if (!completed && isPast) dayCard.className += ' missed';

        let statusIcon = '';
        if (completed) statusIcon = '<span class="status-icon">✅</span>';
        else if (!completed && isPast) statusIcon = '<span class="status-icon">❌</span>';

        let label = 'قادم';
        if (isToday) label = 'اليوم';
        else if (completed) label = 'تم';
        else if (isPast) label = 'لم يتم';

        const deleteBtn = `<button class="btn-delete-day" onclick="deleteDay(${i});" title="حذف">✕</button>`;
        dayCard.innerHTML = statusIcon + '<div class="day-number" onclick="toggleTask(' + i + ');">' + i + '</div><div class="day-label">' + label + '</div>' + deleteBtn;

        grid.appendChild(dayCard);
    }
}

function deleteDay(day) {
    if (!confirm('هل أنت متأكد من حذف اليوم ' + day + ' من التتبع؟')) return;
    const key = currentYear + '-' + currentMonth + '-' + day + '-' + currentTab;
    delete tasks[key];
    saveData();
    renderDays();
    updateStats();
}

function updateStats() {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    let completed = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        if (isTaskCompleted(i)) completed++;
    }

    const remaining = daysInMonth - completed;
    const percentage = Math.round((completed / daysInMonth) * 100);

    document.getElementById('completedCount').textContent = completed;
    document.getElementById('remainingCount').textContent = remaining;
    document.getElementById('completionRate').textContent = percentage + '%';
    document.getElementById('summaryCompleted').textContent = completed + ' يوم';
    document.getElementById('summaryMissed').textContent = remaining + ' يوم';
    document.getElementById('progressFill').style.width = percentage + '%';
}

function switchTab(tab) {
    currentTab = tab;
    
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(function(t) {
        t.classList.remove('active');
        if (t.getAttribute('data-tab') === tab) {
            t.classList.add('active');
        }
    });

    renderDays();
    updateStats();
}

function changeMonth() {
    currentMonth = parseInt(document.getElementById('monthSelect').value);
    renderDays();
    updateStats();
}

document.querySelectorAll('.tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
        switchTab(this.getAttribute('data-tab'));
    });
});

document.getElementById('monthSelect').addEventListener('change', changeMonth);

document.getElementById('monthSelect').value = currentMonth;
loadData();
renderDays();
updateStats();













