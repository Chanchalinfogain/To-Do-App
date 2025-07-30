// --- Animation for adding/removing tasks ---
function animateAdd(element) {
    element.style.opacity = 0;
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
        element.style.transition = 'opacity 0.4s, transform 0.4s';
        element.style.opacity = 1;
        element.style.transform = 'scale(1)';
    }, 10);
}
function animateRemove(element, callback) {
    element.style.transition = 'opacity 0.3s, transform 0.3s';
    element.style.opacity = 0;
    element.style.transform = 'scale(0.9)';
    setTimeout(callback, 300);
}

// --- Motivational Quotes ---
const quotes = [
    "You can do it!",
    "Every step counts!",
    "Stay positive, work hard!",
    "Small progress is still progress.",
    "Keep going, you're doing great!",
    "One task at a time!",
    "Success is the sum of small efforts."
];
function showQuote() {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    let quoteDiv = document.getElementById('motivation-quote');
    if (!quoteDiv) {
        quoteDiv = document.createElement('div');
        quoteDiv.id = 'motivation-quote';
        quoteDiv.style.textAlign = 'center';
        quoteDiv.style.margin = '1rem 0 0.5rem 0';
        quoteDiv.style.fontSize = '1.1rem';
        quoteDiv.style.color = '#43a047';
        quoteDiv.style.fontWeight = '600';
        document.querySelector('.container').insertBefore(quoteDiv, document.getElementById('todo-form'));
    }
    quoteDiv.textContent = quote;
}

// --- Local Storage ---
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task-item').forEach(li => {
        const span = li.querySelector('span');
        const meta = li.querySelector('div:nth-child(2)');
        const note = li.querySelector('div:nth-child(3)');
        tasks.push({
            text: span.childNodes[0].textContent,
            priority: span.querySelector('.priority-badge')?.textContent || '',
            status: span.querySelector('.status-badge')?.textContent || '',
            meta: meta?.textContent || '',
            note: note?.textContent.replace('Note: ', '') || '',
            completed: li.classList.contains('completed')
        });
    });
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
}
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('todo-tasks') || '[]');
    tasks.forEach(t => {
        // Parse meta for date, time, day
        let date = '', time = '', day = '';
        if (t.meta) {
            const m = t.meta.match(/Date: ([^|]*) \| Time: ([^|]*) \| Day: ([^|]*)/);
            if (m) { date = m[1].trim(); time = m[2].trim(); day = m[3].trim(); }
        }
        addTask({
            text: t.text,
            date,
            time,
            day,
            priority: t.priority,
            status: t.status,
            note: t.note,
            completed: t.completed
        }, true);
    });
}

// --- Main To-Do Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('todo-form');
    const input = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    const dayInput = document.getElementById('day-input');
    const priorityInput = document.getElementById('priority-input');
    const statusInput = document.getElementById('status-input');
    const noteInput = document.getElementById('note-input');
    const list = document.getElementById('task-list');

    // --- Filtering UI ---
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterContainer.style.display = 'flex';
    filterContainer.style.justifyContent = 'center';
    filterContainer.style.gap = '1rem';
    filterContainer.style.margin = '1rem 0';
    const filters = ['All', 'Active', 'Completed'];
    let currentFilter = 'All';
    filters.forEach(f => {
        const btn = document.createElement('button');
        btn.textContent = f;
        btn.className = 'filter-btn';
        if (f === 'All') btn.classList.add('active');
        btn.onclick = () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = f;
            renderTasks();
        };
        filterContainer.appendChild(btn);
    });
    // Insert filter buttons after the form (below motivational quote and form)
    form.parentNode.insertBefore(filterContainer, form.nextSibling);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addTask({
            text: input.value,
            date: dateInput.value,
            time: timeInput.value,
            day: dayInput.value,
            priority: priorityInput.value,
            status: statusInput.value,
            note: noteInput.value
        });
        input.value = '';
        dateInput.value = '';
        timeInput.value = '';
        dayInput.value = '';
        priorityInput.value = '';
        statusInput.value = '';
        noteInput.value = '';
    });

    showQuote();
    renderTasks();

    function renderTasks() {
        list.innerHTML = '';
        const tasks = JSON.parse(localStorage.getItem('todo-tasks') || '[]');
        let filtered = tasks;
        if (currentFilter === 'Active') {
            filtered = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'Completed') {
            filtered = tasks.filter(t => t.completed);
        }
        filtered.forEach(t => {
            // Parse meta for date, time, day
            let date = '', time = '', day = '';
            if (t.meta) {
                const m = t.meta.match(/Date: ([^|]*) \| Time: ([^|]*) \| Day: ([^|]*)/);
                if (m) { date = m[1].trim(); time = m[2].trim(); day = m[3].trim(); }
            }
            addTask({
                text: t.text,
                date,
                time,
                day,
                priority: t.priority,
                status: t.status,
                note: t.note,
                completed: t.completed
            }, true);
        });
    }

    // Patch addTask to re-render on complete/delete
    window._renderTasks = renderTasks;
});

function addTask(task, skipSave) {
    const list = document.getElementById('task-list');
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) li.classList.add('completed');

    const main = document.createElement('div');
    main.style.display = 'flex';
    main.style.flexDirection = 'column';
    main.style.flex = '1';

    const span = document.createElement('span');
    span.textContent = task.text;
    if (task.priority) {
        const badge = document.createElement('span');
        badge.className = 'priority-badge ' + task.priority.toLowerCase();
        badge.textContent = task.priority;
        span.appendChild(badge);
    }
    if (task.status) {
        const statusBadge = document.createElement('span');
        statusBadge.className = 'priority-badge status-badge ' + task.status.toLowerCase().replace(' ', '-');
        statusBadge.textContent = task.status;
        statusBadge.style.marginLeft = '0.5rem';
        span.appendChild(statusBadge);
    }
    main.appendChild(span);

    const meta = document.createElement('div');
    meta.style.fontSize = '0.95em';
    meta.style.color = '#555';
    meta.style.marginTop = '0.2em';
    meta.textContent = `Date: ${task.date} | Time: ${task.time} | Day: ${task.day}`;
    main.appendChild(meta);

    if (task.note) {
        const note = document.createElement('div');
        note.style.fontSize = '0.95em';
        note.style.color = '#7b5e2e';
        note.style.marginTop = '0.2em';
        note.textContent = `Note: ${task.note}`;
        main.appendChild(note);
    }

    li.appendChild(main);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const completeBtn = document.createElement('button');
    completeBtn.innerHTML = '✔️';
    completeBtn.title = 'Mark as complete';
    completeBtn.onclick = () => {
        li.classList.toggle('completed');
        saveTasks();
        showQuote();
        if (window._renderTasks) window._renderTasks();
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete task';
    deleteBtn.onclick = () => {
        animateRemove(li, () => {
            li.remove();
            saveTasks();
            if (window._renderTasks) window._renderTasks();
        });
    };

    actions.appendChild(completeBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(actions);
    list.appendChild(li);
    animateAdd(li);
    if (!skipSave) saveTasks();
    if (!skipSave) showQuote();
    if (!skipSave && window._renderTasks) window._renderTasks();
}
