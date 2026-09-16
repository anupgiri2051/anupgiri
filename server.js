const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory Database Storage
let messages = [];
let tasks = [
    { id: 1, text: "Set up Node.js Backend", completed: true },
    { id: 2, text: "Await Mercantile Domain Approval", completed: false }
];

// --- CONTACT FORM API ---
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please fill in all fields.' });
    }

    // Save message to internal memory
    const newMessage = { id: Date.now(), name, email, message, date: new Date().toLocaleString() };
    messages.push(newMessage);

    // Send email via Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `New Contact Submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Nodemailer Error:', error);
        res.status(500).json({ error: 'Saved to dashboard, but email delivery failed.' });
    }
});

// --- ADMIN PANEL APIs ---
// Fetch all messages & tasks
app.get('/api/admin/data', (req, res) => {
    res.json({ messages, tasks });
});

// Delete a message
app.delete('/api/admin/messages/:id', (req, res) => {
    const id = parseInt(req.params.id);
    messages = messages.filter(msg => msg.id !== id);
    res.json({ success: true, message: 'Message deleted' });
});

// Add a new task
app.post('/api/admin/tasks', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Task text required' });
    
    const newTask = { id: Date.now(), text, completed: false };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// Delete a task
app.delete('/api/admin/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    tasks = tasks.filter(t => t.id !== id);
    res.json({ success: true, message: 'Task deleted' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});