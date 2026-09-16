const API_URL = 'http://localhost:5000/api/admin';

document.addEventListener('DOMContentLoaded', fetchDashboardData);

async function fetchDashboardData() {
    try {
        const response = await fetch(`${API_URL}/data`);
        const { messages, tasks } = await response.json();

        renderMessages(messages);
        renderTasks(tasks);
    } catch (err) {
        alert('Failed to connect to backend server. Make sure "node server.js" is running.');
    }
}

// Render Received Messages
function renderMessages(messages) {
    const container = document.getElementById('messages-list');
    if (messages.length === 0) {
        container.innerHTML = '<p>No messages received yet.</p>';
        return;
    }

    container.innerHTML = messages.map(msg => `
        <div style="border: 1px solid var(--border-color); padding: 1rem; margin-bottom: 1rem; border-radius: 6px; background: var(--card-bg);">
            <div style="display: flex; justify-content: space-between;">
                <strong>${msg.name} (${msg.email})</strong>
                <small>${msg.date}</small>
            </div>
            <p style="margin-top: 0.5rem;">${msg.message}</p>
            <button onclick="deleteMessage(${msg.id})" style="margin-top: 0.5rem; color: red; background: none; border: none; cursor: pointer;">Delete</button>
        </div>
    `).join('');
}

// Render Tasks
function renderTasks(tasks) {
    const container = document.getElementById('tasks-list');
    container.innerHTML = tasks.map(t => `
        <li style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
            <span>${t.completed ? '✅' : '⏳'} ${t.text}</span>
            <button onclick="deleteTask(${t.id})" style="color: red; background: none; border: none; cursor: pointer;">Remove</button>
        </li>
    `).join('');
}

// Delete Message
async function deleteMessage(id) {
    await fetch(`${API_URL}/messages/${id}`, { method: 'DELETE' });
    fetchDashboardData();
}

// Delete Task
async function deleteTask(id) {
    await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
    fetchDashboardData();
}

// Add New Task
document.getElementById('add-task-btn').addEventListener('click', async () => {
    const input = document.getElementById('new-task-input');
    if (!input.value.trim()) return;

    await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.value })
    });

    input.value = '';
    fetchDashboardData();
});