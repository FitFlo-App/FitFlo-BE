const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    auth: {
        type: [String],
        enum: ['google', 'email'],
        required: true,
    },
    picture: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: false },
    walletAddress: { type: String, required: true },
    encryptedSecretKey: { type: String, required: true },
    encryptedSecretKeyBackup: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

module.exports = {
    User
};