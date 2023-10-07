const express = require('express');
const app = express();

const path = require('path');
const bodyParser = require('body-parser');
const PORT = 3000;

const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');

let users = [
    {
        id: 1,
        username: 'fabio',
        password: '123'
    },
    {
        id: 2,
        username: 'nolasco',
        password: '456'
    }
];

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const secretKey = "@#$%^&*()(*&^%$&0987654@$";
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256'],
    onExpired: async (req, err) => {
        if (new Date() - err.inner.expiredAt < 5000) { return; }
        throw err;
    },
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    for (const user of users) {
        if (username == user.username && password == user.password) {
            let token = jwt.sign({
                id: user.id,
                username: user.username
            }, secretKey, { expiresIn: '3m' });

            res.json({
                success: true,
                err: null,
                token
            });
            break;
        } else {
            res.status(401).json({
                success: false,
                token: null,
                err: 'username or password is incorrect'
            })
        }
    }

});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        text: 'Secret content that only logged in people can see.'
    });
});

app.get('/api/prices', jwtMW, (req, res) => {
    res.json({
        success: true,
        text: 'This is the Price $3.90'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        text: 'This is Settings Page'
    });
});

app.use(function (err, req, res, next) {
    console.log(err.name === 'UnauthorizedError');
    console.log(err);
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officalError: err,
            err: 'Username or password is Incorrect 2'
        });
    } else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`)
});




