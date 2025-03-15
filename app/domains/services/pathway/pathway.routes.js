const express = require('express');
const pathwayRouter = express.Router();

const verifyToken = require('../../../middlewares/auth/jwt/jwt.verify');

const pathwayController = require('./pathway.controller');

pathwayRouter.post('/create-chat', verifyToken, pathwayController.create);

module.exports = pathwayRouter;