// Replace this with your actual Render backend URL when live
const API_ADMIN = 'https://anup-portfolio-backend.onrender.com/api/admin';

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();

    // Form Event Listeners
    const photoForm = document.getElementById('upload-photo-form');
    if (photoForm) {
        photoForm.addEventListener('submit', handlePhotoUpload);
    }

    const vlogForm = document.getElementById('publish-vlog-form');
    if (vlogForm) {
        vlogForm.addEventListener('submit', handleVlogPublish);
    }

    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', handleAddTask);
    }
});

async function fetchDashboardData() {
    try {
        const res = await fetch(`${API_ADMIN}/data`);
        if (!res.ok) throw new Error("Server communication error");

        const data = await res.json();
        renderAdminPhotos(data.photos || []);
        renderAdminVlogs(data.vlogs || []);
        renderAdminMessages(data.messages || []);
        renderAdminTasks(data.tasks || []);
    } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        alert("Failed to connect to backend server. Make sure your server is running.");
    }
}

// Render Functions
function renderAdminPhotos(photos) {
    const list = document.getElementById('admin-photos-list');
    if (!list) return;

    if (!photos.length) {
        list.innerHTML = '<p class="empty-text">No photos uploaded yet.</p>';
        return;
    }

    list.innerHTML = photos.map(p => `
        <div class="admin-media-card">
            <img src="${p.imageUrl}" alt="${p.title}">
            <h4>${p.title}</h4>
            <button onclick="deletePhoto('${p._id}')" class="btn-delete">Delete</button>
        </div>
    `).join('');
}

function renderAdminVlogs(vlogs) {
    const list = document.getElementById('admin-vlogs-list');
    if (!list) return;

    if (!vlogs.length) {
        list.innerHTML = '<p class="empty-text">No vlogs posted yet.</p>';
        return;
    }

    list.innerHTML = vlogs.map(v => `
        <div class="admin-media-card">
            <iframe src="${v.videoUrl}"></iframe>
            <h4>${v.title}</h4>
            <button onclick="deleteVlog('${v._id}')" class="btn-delete">Delete</button>
        </div>
    `).join('');
}

function renderAdminMessages(messages) {
    const list = document.getElementById('admin-messages-list');
    if (!list) return;

    if (!messages.length) {
        list.innerHTML = '<p class="empty-text">No messages received yet.</p>';
        return;
    }

    list.innerHTML = messages.map(m => `
        <div class="message-card">
            <div class="message-header">
                <strong>${m.name}</strong> &lt;${m.email}&gt;
                <small>${m.date}</small>
            </div>
            <p>${m.message}</p>
            <button onclick="deleteMessage('${m._id}')" class="btn-delete">Delete</button>
        </div>
    `).join('');
}

function renderAdminTasks(tasks) {
    const list = document.getElementById('admin-tasks-list');
    if (!list) return;

    if (!tasks.length) {
        list.innerHTML = '<p class="empty-text">No active tasks.</p>';
        return;
    }

    list.innerHTML = tasks.map(t => `
        <li class="task-item">
            <span>${t.completed ? '✅' : '⏳'} ${t.text}</span>
            <button onclick="deleteTask('${t._id}')" class="btn-delete">Remove</button>
        </li>
    `).join('');
}

// Form Submission Handlers
async function handlePhotoUpload(e) {
    e.preventDefault();
    const title = document.getElementById('photo-title').value;
    const file = document.getElementById('photo-file').files[0];

    if (!file) return alert("Please select an image file.");

    const formData = new FormData();
    formData.append('title', title);
    formData.append('photo', file);

    try {
        const res = await fetch(`${API_ADMIN}/photos`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error("Failed to upload photo");

        document.getElementById('upload-photo-form').reset();
        fetchDashboardData();
    } catch (err) {
        alert(err.message);
    }
}

async function handleVlogPublish(e) {
    e.preventDefault();
    const title = document.getElementById('vlog-title').value;
    const videoUrl = document.getElementById('vlog-url').value;
    const description = document.getElementById('vlog-desc').value;

    try {
        const res = await fetch(`${API_ADMIN}/vlogs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, videoUrl, description })
        });

        if (!res.ok) throw new Error("Failed to publish vlog");

        document.getElementById('publish-vlog-form').reset();
        fetchDashboardData();
    } catch (err) {
        alert(err.message);
    }
}

async function handleAddTask() {
    const textInput = document.getElementById('new-task-text');
    const text = textInput.value.trim();
    if (!text) return;

    try {
        const res = await fetch(`${API_ADMIN}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (!res.ok) throw new Error("Failed to add task");

        textInput.value = '';
        fetchDashboardData();
    } catch (err) {
        alert(err.message);
    }
}

// Global Delete Handlers (Exposed to Window for HTML Inline Onclick Attributes)
window.deletePhoto = async function(id) {
    if (!confirm("Delete this photo?")) return;
    await fetch(`${API_ADMIN}/photos/${id}`, { method: 'DELETE' });
    fetchDashboardData();
};

window.deleteVlog = async function(id) {
    if (!confirm("Delete this vlog?")) return;
    await fetch(`${API_ADMIN}/vlogs/${id}`, { method: 'DELETE' });
    fetchDashboardData();
};

window.deleteMessage = async function(id) {
    if (!confirm("Delete this message?")) return;
    await fetch(`${API_ADMIN}/messages/${id}`, { method: 'DELETE' });
    fetchDashboardData();
};

window.deleteTask = async function(id) {
    await fetch(`${API_ADMIN}/tasks/${id}`, { method: 'DELETE' });
    fetchDashboardData();
};