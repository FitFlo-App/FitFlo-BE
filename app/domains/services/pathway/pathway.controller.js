const Service = require('../entities/services.model').Service;
const User = require('../../users/entities/user.model').User;

const create = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                status: 'error',
                message: 'Parameter "message" required',
                data: {}
            });
        }

        const getUser = await User.findOne({ email: req.user.email });
        const getService = await Service.findOne({ email: req.user.email });

        const profile = {
            gender: getUser.gender || null,
            birthDate: getUser.birthDate || null,
            height: getUser.height || null,
            weight: getUser.weight || null,
            medicalHistory: getUser.medicalHistory || null,
        }

        if (getUser && getService) {
            if (getUser.isProfileCreated) {
                
            } else {
                return res.status(400).json({
                    status: 'error',
                    message: "User profile is not yet completed",
                    data: {}
                });
            }
        } else {
            return res.status(401).json({
                status: 'error',
                message: process.env.DEBUG ? "Email not Found" : "Invalid Credentials",
                data: {}
            });
        }

        let userchat = "Here is the user medical data:\n";

        for (profileKeys of Object.keys(profile)) {
            if (profile[profileKeys]) {
                userchat += `${profileKeys}: ${profile[profileKeys]}\n`
            }
        }

        const requestBody = {
            model: process.env.OPENROUTER_API_MODEL,
            messages: [{ role: 'user', content: message }],
        };

        const response = await fetch(process.env.OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://api.fitflo.site',
                'X-Title': 'FitFlo AI Health Path Optimizer',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(errorData);
            return res.status(400).json({
                status: 'error',
                message: process.env.DEBUG ? errorData.error.message : "Failed to process request",
                data: errorData.error
            });
        }

        const data = await response.json();
        const chatCompletetion = data.choices[0].message.content;

        let chatData = [];
        chatData.push({
            message: "message",
            role: "user",
            profile: profile,
            pathwayNodes: [],
            pathwayEdges: []
        });
        chatData.push({
            message: "chatCompletetion",
            role: "assistant",
            pathwayNodes: [],
            pathwayEdges: []
        });
        getService.pathwayChats.push({chatData});
        console.log(getService);
        const chatID = await getService.save();

        return res.status(200).json({
            status: 'success',
            message: "Successfuly process user chat",
            data: {
                chatId: chatID.pathwayChats.slice(-1)[0]._id,
                response: "chatCompletetion"
            }
        });
    } catch(err) {
        console.error(err);
        return res.status(400).json({
            status: 'error',
            message: process.env.DEBUG ? err.message : "Bad Request",
            data: {}
        });
    }
};

module.exports = {
    create
};