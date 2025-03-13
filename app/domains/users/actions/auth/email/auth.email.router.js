const express = require('express');
const emailAuthRouter = express.Router();

const emailAuthController = require('./auth.email.controller');

emailAuthRouter.post('/login', emailAuthController.login);
emailAuthRouter.post('/register', emailAuthController.register);
emailAuthRouter.get('/activate', emailAuthController.activate);
emailAuthRouter.get('/activation', emailAuthController.activation);

module.exports = emailAuthRouter;