const express = require('express');
const userRouter = express.Router();

const authRouter = require('../actions/auth/user.auth.routes');
const profileRouter = require('../actions/profile/profile.routes');

userRouter.use('/auth', authRouter);
userRouter.use('/profile', profileRouter);

module.exports = userRouter;