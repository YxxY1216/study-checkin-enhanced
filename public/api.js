// Study Checkin API Client
const API_BASE = window.location.origin;

async function apiFetch(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        return await res.json();
    } catch (e) {
        console.error('API Error:', e);
        return null;
    }
}

async function loadToday() {
    const result = await apiFetch('/api/today');
    if (!result) {
        const data = {};
        SUBJECTS.forEach(s => s.tasks.forEach((_, i) => {
            data[`${s.id}_${i}`] = { completed: false, time: '0:00' };
        }));
        return data;
    }
    const data = result.data;
    SUBJECTS.forEach(s => s.tasks.forEach((_, i) => {
        const key = `${s.id}_${i}`;
        if (!data[key]) data[key] = { completed: false, time: '0:00' };
    }));
    return data;
}

async function saveToday(d) {
    return await apiFetch('/api/today', {
        method: 'POST',
        body: JSON.stringify({ data: d })
    });
}

async function loadHistory() {
    const result = await apiFetch('/api/history');
    return result || [];
}

async function saveHistory(h) {
    return true; // History is managed server-side
}

async function loadStreak() {
    const result = await apiFetch('/api/streak');
    return result ? { current: result.streak, best: result.streak, lastDate: todayKey() } : { current: 0, best: 0, lastDate: null };
}

async function saveStreak(s) {
    return true;
}

function archiveDay(key, data) {
    // Archive is handled server-side
}
