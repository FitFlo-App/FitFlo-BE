const express = require('express');
const serviceRouter = express.Router();

const pathwayRouter = require('../pathway/pathway.routes');

serviceRouter.use('/pathway', pathwayRouter);

module.exports = serviceRouter;