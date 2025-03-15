const express = require('express');
const pathwayRouter = express.Router();

const verifyToken = require('../../../middlewares/auth/jwt/jwt.verify');

const pathwayController = require('./pathway.controller');

pathwayRouter.post('/create-chat', verifyToken, pathwayController.create);
pathwayRouter.get('/read-chat', verifyToken, pathwayController.read);
pathwayRouter.put('/continue-chat', verifyToken, pathwayController.update);

module.exports = pathwayRouter;