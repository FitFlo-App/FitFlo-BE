const express = require('express');
const userRouter = express.Router();

const authRouter = require('../actions/auth/user.auth.routes');

userRouter.use('/auth', authRouter);

module.exports = userRouter;