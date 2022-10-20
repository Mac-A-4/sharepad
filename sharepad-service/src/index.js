const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('/sharepad-web'));

const createId = () => {
    const ALPHABET = 'abcdefghijklmopqrstuvwxyz0123456789';
    const LENGTH = 32;
    let result = '';
    for (let i = 0; i < LENGTH; ++i) {
        result += ALPHABET[Math.floor(Math.random()*ALPHABET.length)];
    }
    return result;
};

const SESSIONS = {};

const expired = (accessed, timeout) => {
    return (accessed < (new Date()).getTime() - timeout);
};

const cleanup = () => {
    const SESSION_TIMEOUT = 1000 * 60;
    const USER_TIMEOUT = 1000 * 10;
    for (let sessionId in SESSIONS) {
        if (expired(SESSIONS[sessionId].accessed, SESSION_TIMEOUT)) {
            delete SESSIONS[sessionId];   
        } else {
            for (let userId in SESSIONS[sessionId].users) {
                if (expired(SESSIONS[sessionId].users[userId].accessed, USER_TIMEOUT)) {
                    delete SESSIONS[sessionId].users[userId];
                }    
            }
        }
    }  
};

app.post('/api/create', (_, res) => {
    cleanup();
    const sessionId = createId();
    SESSIONS[sessionId] = {
        sessionId,
        accessed: (new Date()).getTime(),
        users: {},
    };
    return res.status(200).json({sessionId}); 
});

app.post('/api/connect', (req, res) => {
    cleanup();
    const sessionId = req.body.sessionId;
    const name = req.body.name;
    if (!sessionId || !name || !SESSIONS[sessionId]) {
        return res.status(400).send();
    }
    const userId = createId();
    SESSIONS[sessionId].users[userId] = {
        userId,
        name,
        accessed: (new Date()).getTime(),
        data: '',
    };
    SESSIONS[sessionId].accessed = (new Date()).getTime();
    return res.status(200).json({userId});
});

app.post('/api/status', (req, res) => {
    cleanup();
    const sessionId = req.body.sessionId;
    const userId = req.body.userId;
    if (!sessionId || !userId || !SESSIONS[sessionId] || !(SESSIONS[sessionId].users[userId])) {
        return res.status(400).send();  
    }
    let result = Object.entries(SESSIONS[sessionId].users).filter(([_, x]) => x.userId !== userId).map(([_, x]) => {
        return {
            name: x.name,
            data: x.data
        };
    });
    SESSIONS[sessionId].accessed = (new Date()).getTime();
    SESSIONS[sessionId].users[userId].accessed = (new Date()).getTime();
    return res.status(200).json(result);
});

app.post('/api/update', (req, res) => {
    cleanup();
    const sessionId = req.body.sessionId;
    const userId = req.body.userId;
    const data = req.body.data;
    if (!sessionId || !userId || !data || !SESSIONS[sessionId] || !(SESSIONS[sessionId].users[userId])) {
        return res.status(400).send();
    }
    SESSIONS[sessionId].users[userId].data = data;
    SESSIONS[sessionId].accessed = (new Date()).getTime();
    SESSIONS[sessionId].users[userId].accessed = (new Date()).getTime();
    return res.status(200).send();
});

app.listen(8080);
