document.addEventListener('DOMContentLoaded', () => {

    // 1. Theme Toggle Logic
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn.querySelector('i');

    themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            themeIcon.className = 'fa-solid fa-moon';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fa-solid fa-sun';
        }
    });

    // 2. Interactive Web App (Task & Goal Tracker)
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const searchInput = document.getElementById('search-input');
    const taskList = document.getElementById('task-list');
    const totalCount = document.getElementById('total-count');
    const completedCount = document.getElementById('completed-count');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');

    let tasks = [];

    const updateStats = () => {
        totalCount.textContent = tasks.length;
        completedCount.textContent = tasks.filter(t => t.completed).length;
    };

    const renderTasks = (filterText = '') => {
        taskList.innerHTML = '';
        const filteredTasks = tasks.filter(task => 
            task.text.toLowerCase().includes(filterText.toLowerCase())
        );

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <span>${task.text}</span>
                <div class="task-actions">
                    <button class="action-check" title="Toggle Complete"><i class="fa-solid fa-circle-check"></i></button>
                    <button class="action-delete" title="Delete Task"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;

            // Toggle completion
            li.querySelector('.action-check').addEventListener('click', () => {
                tasks[index].completed = !tasks[index].completed;
                renderTasks(searchInput.value);
            });

            // Delete single task
            li.querySelector('.action-delete').addEventListener('click', () => {
                tasks.splice(index, 1);
                renderTasks(searchInput.value);
            });

            taskList.appendChild(li);
        });

        updateStats();
    };

    // Add new task
    const addTask = () => {
        const text = taskInput.value.trim();
        if (!text) return;

        tasks.push({ text, completed: false });
        taskInput.value = '';
        renderTasks(searchInput.value);
    };

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

    // Live search filter
    searchInput.addEventListener('input', (e) => renderTasks(e.target.value));

    // Clear completed tasks
    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => !t.completed);
        renderTasks(searchInput.value);
    });
});