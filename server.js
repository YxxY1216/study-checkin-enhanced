const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('./study_checkin.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // Study records table
        db.run(`
            CREATE TABLE IF NOT EXISTS study_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                subject TEXT NOT NULL,
                task_id TEXT NOT NULL,
                time_minutes INTEGER DEFAULT 0,
                completed INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(date, subject, task_id)
            )
        `);

        // Statistics table for streaks and summaries
        db.run(`
            CREATE TABLE IF NOT EXISTS daily_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT UNIQUE NOT NULL,
                total_minutes INTEGER DEFAULT 0,
                english_minutes INTEGER DEFAULT 0,
                math_minutes INTEGER DEFAULT 0,
                politics_minutes INTEGER DEFAULT 0,
                c_minutes INTEGER DEFAULT 0,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create index for faster queries
        db.run(`CREATE INDEX IF NOT EXISTS idx_date ON study_records(date)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_subject ON study_records(subject)`);

        console.log('Database tables initialized');
    });
}

// Helper: Convert HH:MM to minutes
function timeToMinutes(timeStr) {
    if (!timeStr || timeStr === '0:00') return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

// Helper: Convert minutes to HH:MM
function minutesToTime(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}:${String(m).padStart(2, '0')}`;
}

// Helper: Get today's date key
function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

// ─── API Routes ───

// Get today's study data
app.get('/api/today', (req, res) => {
    const date = todayKey();
    const query = `
        SELECT subject, task_id, time_minutes, completed 
        FROM study_records 
        WHERE date = ?
        ORDER BY subject, task_id
    `;
    
    db.all(query, [date], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        const data = {};
        rows.forEach(row => {
            const key = `${row.subject}_${row.task_id}`;
            data[key] = {
                completed: row.completed === 1,
                time: minutesToTime(row.time_minutes)
            };
        });
        
        res.json({ date, data });
    });
});

// Save today's study data
app.post('/api/today', (req, res) => {
    const date = todayKey();
    const data = req.body.data;
    
    if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Invalid data format' });
    }
    
    db.serialize(() => {
        // Delete existing records for today
        db.run('DELETE FROM study_records WHERE date = ?', [date]);
        
        // Insert new records
        const stmt = db.prepare(`
            INSERT INTO study_records (date, subject, task_id, time_minutes, completed)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        Object.entries(data).forEach(([key, val]) => {
            const [subject, taskId] = key.split('_');
            const minutes = timeToMinutes(val.time);
            stmt.run(date, subject, taskId, minutes, val.completed ? 1 : 0);
        });
        
        stmt.finalize(() => {
            // Update daily stats
            updateDailyStats(date);
            res.json({ success: true, date });
        });
    });
});

// Get history records for a specific date
app.get('/api/history/:date', (req, res) => {
    const date = req.params.date;
    
    const query = `
        SELECT subject, task_id, time_minutes, completed 
        FROM study_records 
        WHERE date = ?
        ORDER BY subject, task_id
    `;
    
    db.all(query, [date], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        const data = {};
        rows.forEach(row => {
            const key = `${row.subject}_${row.task_id}`;
            data[key] = {
                completed: row.completed === 1,
                time: minutesToTime(row.time_minutes)
            };
        });
        
        res.json({ date, data });
    });
});

// Get all history records
app.get('/api/history', (req, res) => {
    const query = `
        SELECT date, subject, SUM(time_minutes) as total_minutes, 
               COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_count
        FROM study_records
        GROUP BY date, subject
        ORDER BY date DESC
        LIMIT 365
    `;
    
    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // Group by date
        const history = {};
        rows.forEach(row => {
            if (!history[row.date]) {
                history[row.date] = { date: row.date, subjects: {} };
            }
            history[row.date].subjects[row.subject] = row.total_minutes;
        });
        
        res.json(Object.values(history));
    });
});

// Get streak information
app.get('/api/streak', (req, res) => {
    const query = `
        SELECT date, total_minutes
        FROM daily_stats
        WHERE total_minutes > 0
        ORDER BY date DESC
        LIMIT 365
    `;
    
    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // Calculate current streak
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < rows.length; i++) {
            const recordDate = new Date(rows[i].date);
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            
            if (rows[i].date === expectedDate.toISOString().slice(0, 10)) {
                streak++;
            } else {
                break;
            }
        }
        
        res.json({ streak });
    });
});

// Get exam countdown to 考研 dates
app.get('/api/exam-countdown', (req, res) => {
    const targetDate = '2027-12-26'; // Typical 考研 date
    const today = new Date();
    const target = new Date(targetDate);
    const daysLeft = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    
    res.json({ targetDate, daysLeft });
});

// Get statistics summary
app.get('/api/stats', (req, res) => {
    const query = `
        SELECT date, total_minutes, english_minutes, math_minutes, politics_minutes, c_minutes
        FROM daily_stats
        ORDER BY date DESC
        LIMIT 30
    `;
    
    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows.reverse());
    });
});

// Update daily stats after saving records
function updateDailyStats(date) {
    const query = `
        SELECT 
            COALESCE(SUM(time_minutes), 0) as total,
            COALESCE(SUM(CASE WHEN subject = 'english' THEN time_minutes ELSE 0 END), 0) as english,
            COALESCE(SUM(CASE WHEN subject = 'math' THEN time_minutes ELSE 0 END), 0) as math,
            COALESCE(SUM(CASE WHEN subject = 'politics' THEN time_minutes ELSE 0 END), 0) as politics,
            COALESCE(SUM(CASE WHEN subject = 'c' THEN time_minutes ELSE 0 END), 0) as c
        FROM study_records
        WHERE date = ?
    `;
    
    db.get(query, [date], (err, row) => {
        if (err) return;
        
        const stmt = db.prepare(`
            INSERT INTO daily_stats (date, total_minutes, english_minutes, math_minutes, politics_minutes, c_minutes)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET
                total_minutes = excluded.total_minutes,
                english_minutes = excluded.english_minutes,
                math_minutes = excluded.math_minutes,
                politics_minutes = excluded.politics_minutes,
                c_minutes = excluded.c_minutes,
                updated_at = CURRENT_TIMESTAMP
        `);
        
        stmt.run(
            date, 
            row.total, row.english, row.math, row.politics, row.c
        );
        stmt.finalize();
    });
}

// Initialize database on startup
initDatabase();

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
