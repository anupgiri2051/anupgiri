// Replace this with your actual Render backend URL when live
const API_BASE = 'https://anup-portfolio-backend.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    loadPortfolioContent();

    const contactForm = document.getElementById('public-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

async function loadPortfolioContent() {
    try {
        const res = await fetch(`${API_BASE}/public/data`);
        if (!res.ok) throw new Error("Failed to load portfolio content.");
        
        const data = await res.json();
        renderPhotos(data.photos || []);
        renderVlogs(data.vlogs || []);
    } catch (err) {
        console.error("Error loading content:", err);
    }
}

function renderPhotos(photos) {
    const grid = document.getElementById('public-photos-grid');
    if (!grid) return;

    if (!photos.length) {
        grid.innerHTML = '<p>No photos uploaded yet.</p>';
        return;
    }

    grid.innerHTML = photos.map(p => `
        <div class="card photo-card" data-id="${p._id}">
            <img src="${p.imageUrl}" alt="${p.title}" loading="lazy">
            <div class="card-info">
                <h3>${p.title}</h3>
                <small>${p.date}</small>
            </div>
        </div>
    `).join('');
}

function renderVlogs(vlogs) {
    const grid = document.getElementById('public-vlogs-grid');
    if (!grid) return;

    if (!vlogs.length) {
        grid.innerHTML = '<p>No vlogs available yet.</p>';
        return;
    }

    grid.innerHTML = vlogs.map(v => `
        <div class="card vlog-card" data-id="${v._id}">
            <div class="iframe-wrapper">
                <iframe src="${v.videoUrl}" allowfullscreen></iframe>
            </div>
            <div class="card-info">
                <h3>${v.title}</h3>
                <p>${v.description || ''}</p>
                <small>${v.date}</small>
            </div>
        </div>
    `).join('');
}

async function handleContactSubmit(e) {
    e.preventDefault();
    const statusMsg = document.getElementById('form-status');
    const sendBtn = document.getElementById('send-btn');

    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    statusMsg.innerText = "Sending message...";
    statusMsg.style.color = "#333";
    sendBtn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });

        const result = await res.json();
        if (res.ok) {
            statusMsg.innerText = result.message || "Message sent successfully!";
            statusMsg.style.color = "green";
            document.getElementById('public-contact-form').reset();
        } else {
            throw new Error(result.error || 'Failed to send message.');
        }
    } catch (err) {
        statusMsg.innerText = err.message || "Something went wrong. Try again.";
        statusMsg.style.color = "red";
    } finally {
        sendBtn.disabled = false;
    }
}