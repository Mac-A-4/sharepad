
const { sessionId: SESSION_ID, userId: USER_ID } = (function() {
    const params = new URLSearchParams(window.location.search);
    return {
        sessionId: params.get('sessionId'),
        userId: params.get('userId'),
    };
})();

function redirectIndex() {
    window.location.href = '/index.html';
}

if (!SESSION_ID || !USER_ID) {
    alert('Failed to get session information.');
    redirectIndex();
}

const sessionIdSpan = document.getElementById('span-session-id');
sessionIdSpan.innerText = SESSION_ID;

const selectRemote = document.getElementById('select-remote');
const localTextArea = document.getElementById('textarea-local');
const remoteTextArea = document.getElementById('textarea-remote');

let isLocalTextAreaDirty = false;
let isRequestingUpdate = false;

localTextArea.addEventListener('input', () => {
    isLocalTextAreaDirty = true;
});

setInterval(() => {
    if (isLocalTextAreaDirty && !isRequestingUpdate) {
        isLocalTextAreaDirty = false;
        isRequestingUpdate = true;
        fetch('api/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: SESSION_ID,
                userId: USER_ID,
                data: localTextArea.value,
            }),
        }).then(() => {
            isRequestingUpdate = false;
        }).catch(() => {
            alert('Failed to send update to session.');
            isRequestingUpdate = false;
        });
    }
}, 100);

let previousStatus = [];

function statusUsersChanged(currentStatus) {
    if (currentStatus.length !== previousStatus.length) {
        return true;
    } else {
        for (let i = 0; i < currentStatus.length; ++i) {
            if (currentStatus[i].name !== previousStatus[i].name) {
                return true;
            }
        }
        return false;
    }
}

function updateRemoteSelect(currentStatus) {
    if (statusUsersChanged(currentStatus)) {
        while (selectRemote.firstChild) {
            selectRemote.removeChild(selectRemote.firstChild);
        }
        for (let i = 0; i < currentStatus.length; ++i) {
            let user = currentStatus[i];
            let option = document.createElement('OPTION');
            option.value = i;
            option.innerText = user.name;
            selectRemote.appendChild(option);
        }
        previousStatus = currentStatus;
    }
}

function onStatus(status) {
    updateRemoteSelect(status);
    let index = selectRemote.value;
    if (index !== null && index !== '' && index >= 0 && index <= status.length) {
        remoteTextArea.value = status[index].data;
    } else {
        remoteTextArea.value = '';
    }
}

let isRequestingStatus = false;

setInterval(() => {
    if (!isRequestingStatus) {
        isRequestingStatus = true;
        fetch('api/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: SESSION_ID,
                userId: USER_ID,
            }),
        }).then(response => {
            response.json().then(status => {
                onStatus(status);
                isRequestingStatus = false;
            });
        }).catch(() => {
            alert('Failed to get status of session.');
            isRequestingStatus = false;
        });
    }
}, 100);
