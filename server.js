const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data.json');

// تهيئة ملف البيانات إذا لم يكن موجوداً
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [], messages: [], posts: [], memories: [] }));
}

function getData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// تسجيل حساب جديد
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const data = getData();
    
    if (data.users.length >= 2) {
        return res.status(400).json({ success: false, message: 'عذراً، التطبيق مخصص لشخصين فقط!' });
    }
    
    if (data.users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'اسم المستخدم مستخدم مسبقاً.' });
    }

    data.users.push({ username, password });
    saveData(data);
    res.json({ success: true, message: 'تم إنشاء الحساب بنجاح!' });
});

// تسجيل الدخول
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const data = getData();
    const user = data.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ success: true, user: { username } });
    } else {
        res.status(400).json({ success: false, message: 'خطأ في اسم المستخدم أو كلمة المرور.' });
    }
});

// جلب البيانات (الرسائل، المنشورات، الذكريات)
app.get('/api/data', (req, res) => {
    const data = getData();
    res.json({
        messages: data.messages,
        posts: data.posts,
        memories: data.memories
    });
});

// إرسال رسالة
app.post('/api/messages', (req, res) => {
    const { sender, text } = req.body;
    const data = getData();
    const newMessage = { sender, text, time: new Date().toLocaleTimeString() };
    data.messages.push(newMessage);
    saveData(data);
    res.json({ success: true, message: newMessage });
});

// إضافة منشور أو ذكرى
app.post('/api/posts', (req, res) => {
    const { author, title, content, type } = req.body; // type: 'post' or 'memory'
    const data = getData();
    const item = { id: Date.now(), author, title, content, date: new Date().toLocaleDateString() };
    
    if (type === 'memory') {
        data.memories.push(item);
    } else {
        data.posts.push(item);
    }
    saveData(data);
    res.json({ success: true, item });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
