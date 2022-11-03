const { sessionId: SESSION_ID } = (function() {
    const params = new URLSearchParams(window.location.search);
    return {
        sessionId: params.get('sessionId')
    };
})();

function redirectIndex() {
    window.location.href = 'index.html';
}

function redirectSession(sessionId, userId) {
    window.location.href = `session.html?sessionId=${sessionId}&userId=${userId}`;
}

if (!SESSION_ID) {
    alert('Failed to get session information.');
    redirectIndex();
}

const createName = () => {
    const ALPHABET = 'abcdefghijklmopqrstuvwxyz0123456789';
    const LENGTH = 6;
    let result = '';
    for (let i = 0; i < LENGTH; ++i) {
        result += ALPHABET[Math.floor(Math.random()*ALPHABET.length)];
    }
    return result;
};

(async function() {
    let connectResponse = await fetch('api/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionId: SESSION_ID,
            name: createName()
        }),
    });
    if (!connectResponse.ok) {
        alert('Failed to connect to session.');
        redirectIndex();
        return;
    }
    let userId = (await connectResponse.json()).userId;
    redirectSession(sessionId, userId);
})();
