const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    email: { type: String, required: true },
    pathwayChats: [{
        chatData: [{
            message: { type: String, required: true },
            role: { type: String, enum: ['user', 'assistant'], required: true },
            suspectedDisease: { type: String, required: false }
        }]
    }]
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = {
    Service
};