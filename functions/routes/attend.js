const Router = require('express');
const env = require('../environment-variables');

const router = Router();

const KEY = env.apiKey;

let sessions = [];

router.get('/session', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401);
        return;
    }

    if (req.headers.session === undefined || req.headers.timeout === undefined) {
        res.send({ message: 'invalid headers' });
        return;
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    startSession(req, res);
});

router.post('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401);
        return;
    }
    let sessionId = req.headers.sessionId;
    if (sessionId !== this.sessionId) {
        res.sendStatus(404);
    }
    let id = req.body.id;
    addStudentToSession(id, sessionId);
});

const startSession = (req, res) => {
    let session = {
        id: req.headers.session,
        time: 0,
        timeout: req.headers.timeout,
        students: [],
    };
    sessions.push(session);

    const intervalId = setInterval(() => {

        if (time === timeout) {
            clearInterval(this);
            res.end();
        }
    }, 1000);

    req.on('close', () => {
        clearInterval(intervalId);
    });
};

const addStudentToSession = (studentId, sessionId) => {
    sessions.forEach(session => {
        if (session.id === sessionId) {
            session.students.push(studentId);
        }
    })
};

const deleteSession = (sessionId) => {
    for(let i = 0; i < sessions; i++) {
        if (sessions[i].id === sessionId) {
            sessions.splice(i, 1);
            break;
        }
    }
};

const increment = (sessionId) => {
    sessions.forEach(session => {
       if (session.id === sessionId) {
           return session;
       }
    });
};

module.exports = router;

// function sseDemo(req, res) {
//     let messageId = 0;
//
//     const intervalId = setInterval(() => {
//         res.write(`id: ${messageId}\n`);
//         res.write(`data: Test Message -- ${Date.now()}\n\n`);
//         messageId += 1;
//     }, 1000);
//
//     req.on('close', () => {
//         clearInterval(intervalId);
//     });
// }

