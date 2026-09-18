const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "YOUR_MONGODB_CONNECTION_STRING_HERE";
mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to Free MongoDB Database!"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Database Schemas
const Photo = mongoose.model('Photo', new mongoose.Schema({
    title: String,
    imageUrl: String,
    date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}));

const Vlog = mongoose.model('Vlog', new mongoose.Schema({
    title: String,
    videoUrl: String,
    description: String,
    date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}));

const Message = mongoose.model('Message', new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    date: { type: String, default: () => new Date().toLocaleString() }
}));

const Task = mongoose.model('Task', new mongoose.Schema({
    text: String,
    completed: { type: Boolean, default: false }
}));

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + path.extname(file.originalname))
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- PUBLIC APIS ---
app.get('/api/public/data', async (req, res) => {
    const photos = await Photo.find().sort({ _id: -1 });
    const vlogs = await Vlog.find().sort({ _id: -1 });
    res.json({ photos, vlogs });
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });

    const newMsg = await Message.create({ name, email, message });
    res.json({ success: true, message: 'Message saved to database!' });
});

// --- ADMIN APIS ---
app.get('/api/admin/data', async (req, res) => {
    const photos = await Photo.find().sort({ _id: -1 });
    const vlogs = await Vlog.find().sort({ _id: -1 });
    const messages = await Message.find().sort({ _id: -1 });
    const tasks = await Task.find().sort({ _id: -1 });
    res.json({ photos, vlogs, messages, tasks });
});

app.post('/api/admin/photos', upload.single('photo'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Image required' });
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const photo = await Photo.create({ title: req.body.title || 'Untitled', imageUrl });
    res.status(201).json(photo);
});

app.delete('/api/admin/photos/:id', async (req, res) => {
    await Photo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.post('/api/admin/vlogs', async (req, res) => {
    let { title, videoUrl, description } = req.body;
    if (videoUrl.includes('watch?v=')) videoUrl = videoUrl.replace('watch?v=', 'embed/');
    else if (videoUrl.includes('youtu.be/')) videoUrl = videoUrl.replace('youtu.be/', 'www.youtube.com/embed/');

    const vlog = await Vlog.create({ title, videoUrl, description });
    res.status(201).json(vlog);
});

app.delete('/api/admin/vlogs/:id', async (req, res) => {
    await Vlog.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.post('/api/admin/tasks', async (req, res) => {
    const task = await Task.create({ text: req.body.text });
    res.status(201).json(task);
});

app.delete('/api/admin/tasks/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.delete('/api/admin/messages/:id', async (req, res) => {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server live on port ${PORT}`));