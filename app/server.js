const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: [
        'http://localhost:80',
        'http://localhost:8080',
        'http://localhost:4173',
        'http://localhost:5173'
    ],
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const verifyToken = require('./middlewares/auth/jwt/jwt.verify');

const userRouter = require('./domains/users/entities/user.router');
app.use('/user', userRouter);

app.get('/', (req, res) => {
    if (req.user) {
        res.send(`Hello ${req.user.email}\n\nJWT Token (from "token" GET param): <br/><br/><textarea>${req.query.token}</textarea>`);
    } else {
        if (req.query.token) {
            res.send(`JWT Token (from "token" GET param): <br/><br/><textarea>${req.query.token}</textarea>`);
        } else {
            res.send("<a href='/user/auth/google'>Login with google</a>");   
        }
    }
});

app.get('/protected', verifyToken, (req, res) => {
    res.send(`Hello ${req.user.email}`);
});

module.exports = app;