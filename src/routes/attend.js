const fs = require('fs');
const path = require('path');
const Router = require('express');
const env = require('../environment-variables');
const router = Router();
const dataFile = path.join(__dirname, 'data.json');
console.log(dataFile);
const KEY = env.apiKey;

let session = undefined;
let messageId = 0;

router.get('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401);
        return;
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    res.write('\n');

    session = {
        id: req.headers.id,
        timeout: req.headers.timeout,
        students: []
    };

    fs.writeFileSync(dataFile, JSON.stringify(session), 'utf8');
    console.log('session created');

    const intervalId = setInterval(() => {
        if (fs.existsSync(dataFile)) {
            session = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        }
        if (messageId > session.timeout) {
            clearInterval(intervalId);
            fs.unlinkSync(dataFile);
            messageId = 0;
            res.write('session ended');
            res.end();
            console.log('session ended');
            return;
        }
        if (session.students.length > 0) {
            const student = session.students.pop();
            res.write(`${ student }`);
            res.write('\n');
            console.log('student: ', student);
            fs.writeFileSync(dataFile, JSON.stringify(session), 'utf8');
        }
        messageId += 2;
    }, 2000);
});

router.post('/', (req, res) => {
    if (req.headers.secret !== KEY) {
        res.sendStatus(401);
        return;
    }

    if (fs.existsSync(dataFile)) {
        session = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }


    if (!session || !req.headers.session || req.headers.session !== session.id) {
        res.send({ statusCode: 404, message: 'Session does not exists'  });
        return;
    }

    session.students.push(req.headers.id);
    console.log('joined session');

    fs.writeFileSync(dataFile, JSON.stringify(session), 'utf8');
    res.send({ statusCode: 200, message: 'added to session'});
});

module.exports = router;
