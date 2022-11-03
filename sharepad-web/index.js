
function redirectSession(sessionId, userId) {
    window.location.href = `session.html?sessionId=${sessionId}&userId=${userId}`;
}

async function onConnect(sessionId, name) {
    let connectResponse = await fetch('api/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionId,
            name,
        }),
    });
    if (!connectResponse.ok) {
        alert('Failed to connect to session.');
        return;
    }
    let userId = (await connectResponse.json()).userId;
    redirectSession(sessionId, userId);
}

async function onCreate(name) {
    let createResponse = await fetch('api/create', {
        method: 'POST',
    });
    if (!createResponse.ok) {
        alert('Failed to create session.');
        return;
    }
    let sessionId = (await createResponse.json()).sessionId;
    await onConnect(sessionId, name);
}

const createButton = document.getElementById('button-create');
const connectButton = document.getElementById('button-connect');
const createNameInput = document.getElementById('input-create-name');
const connectNameInput = document.getElementById('input-connect-name');
const connectSessionIdInput = document.getElementById('input-connect-session-id');

function setFormDisabled(disabled) {
    createButton.disabled = disabled;
    connectButton.disabled = disabled;
    createNameInput.disabled = disabled;
    connectNameInput.disabled = disabled;
    connectSessionIdInput.disabled = disabled;
}

createButton.addEventListener('click', async () => {
    setFormDisabled(true);
    await onCreate(createNameInput.value);
    setFormDisabled(false);
});

connectButton.addEventListener('click', async () => {
    setFormDisabled(true);
    await onConnect(connectSessionIdInput.value, connectNameInput.value);
    setFormDisabled(false);
});
