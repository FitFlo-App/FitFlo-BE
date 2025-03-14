const express = require('express');
const profileRouter = express.Router();

const verifyToken = require('../../../../middlewares/auth/jwt/jwt.verify');

const profileController = require('./profile.controller');

profileRouter.post('/create', verifyToken, profileController.create);
profileRouter.get('/read', verifyToken, profileController.read);
profileRouter.put('/update', verifyToken, profileController.update);

module.exports = profileRouter;