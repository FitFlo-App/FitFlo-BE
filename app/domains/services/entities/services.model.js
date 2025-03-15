const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    email: { type: String, required: true },
    pathwayChats: [{
        chatData: [{
            message: { type: String, required: true },
            role: { type: String, enum: ['user', 'assistant'], required: true },
            profile: {
                gender: { type: String, enum: ['male', 'female'], required: false },
                birthDate: { type: Date, required: false},
                height: { type: Number, required: false },
                weight: { type: Number, required: false },
                medicalHistory: { type: String, required: false },
            },
            pathwayNodes: [{
                id: { type: Number, required: true },
                data: {
                    label: { type: String, required: true },
                    info: { type: String, required: true }
                }
            }],
            pathwayEdges: [{
                id: { type: Number, required: true },
                source: { type: Number, required: true },
                target: { type: Number, required: true }
            }]
        }]
    }]
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = {
    Service
};