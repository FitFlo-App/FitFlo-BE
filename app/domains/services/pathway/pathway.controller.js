const Service = require('../entities/services.model').Service;
const transformers = require('../../../utils/nlp/xenova/transformers');
const tokenizer = require('../../../utils/nlp/natural/tokenizer');
const iris = require('../../../configs/database/iris/iris.client');

const diseaseFallback = JSON.parse(process.env.DISEASE_FALLBACK);
const models = JSON.parse(process.env.OPENROUTER_API_MODELS);

const create = async (req, res) => {
    try {
        const { message, model } = req.body;

        if (!message) {
            return res.status(400).json({
                status: 'error',
                message: 'Parameter "message" required',
                data: {}
            });
        }

        let chosenModel;
        if (model) {
            if (!models.includes(model)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Parameter "message" required',
                    data: {}
                });
            }

            chosenModel = model;
        } else {
            console.log("No model chosen. Falling back to qwen/qwq-32b:free . . .");
            chosenModel = "qwen/qwq-32b:free";
        }

        const getService = await Service.findOne({ email: req.user.email });
        if (!getService) {
            return res.status(400).json({
                status: 'error',
                message: "User profile is not completed yet",
                data: {}
            });
        }

        const vectorInput = Array.from(await transformers.generateEmbedding(tokenizer(message).join(" ")));
        const irisResults = await iris.search(vectorInput, 3);

        let chatRequest = `Our customer request below may include heath-related complaints:\n\n${message}\n\n`;
        if (irisResults.length > 0) {
            chatRequest += `Our system detect that the symptom may related to ${irisResults[0].disease} disease. Return a reply of medical advice to improve our customer health. Reply with format {"chatReply":chatReply,"disease":"${irisResults[0].disease}"} and without filler comment such as 'Okay, here's a response addressing'. Example: {"chatReply":chatReply,"disease":"${irisResults[0].disease}"}`;
        } else {
            chatRequest += `Return a reply of medical advice to improve our customer health and one disease the most likely from the list ${JSON.stringify(diseaseFallback)}. Reply with format {"chatReply":chatReply,"disease":disease} and without filler comment such as 'Okay, here's a response addressing'. Example: {"chatReply":chatReply,"disease":"Multiple Sclerosis"}`;
        }

        const requestBody = {
            model: chosenModel,
            messages: [{ role: 'user', content: chatRequest }],
        };

        const response = await fetch(process.env.OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://fitflo-api.faizath.com',
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
            message: message,
            role: "user"
        });
        chatData.push({
            message: JSON.parse(chatCompletetion)["chatReply"],
            role: "assistant",
            model: chosenModel,
            disease: JSON.parse(chatCompletetion)["disease"],
            diseaseSource: (irisResults.length > 0 ? "Intersystems IRIS" : "OpenRouter.ai API with model " + chosenModel)
        });
        getService.pathwayChats.push({chatData});
        const chatId = await getService.save();

        return res.status(200).json({
            status: 'success',
            message: "Successfuly create user chat",
            data: {
                chatId: chatId.pathwayChats.slice(-1)[0]._id,
                model: chosenModel,
                response: JSON.parse(chatCompletetion)["chatReply"],
                disease: JSON.parse(chatCompletetion)["disease"],
                diseaseSource: (irisResults.length > 0 ? "Intersystems IRIS" : "OpenRouter.ai API with model " + chosenModel)
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

const read = async (req, res) => {
    try {
        const chatId = req.query.chatId;
        if (!chatId) {
            return res.status(400).json({
                status: 'error',
                message: 'Parameter "chatId" required',
                data: {}
            });
        }

        const pathwayChat = await Service.findOne(
            { email: req.user.email, "pathwayChats._id": chatId },
            { "pathwayChats.$": 1 }
        );
        if (!pathwayChat) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid chatId: chatId not found',
                data: {}
            });
        }

        let chatSession = pathwayChat["pathwayChats"][0].toObject();
        chatSession.chatData = chatSession.chatData.map(({ _id, ...data }) => data);

        res.status(200).json({
            status: "success",
            message: "Successfuly read user chat",
            data: {
                chats: chatSession["chatData"]
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

const update = async (req, res) => {
    try {
        const { chatId, message, model } = req.body;

        if (!chatId || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'Parameter "chatId" and "message" required',
                data: {}
            });
        }

        let chosenModel;
        if (model) {
            if (!models.includes(model)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Parameter "message" required',
                    data: {}
                });
            }

            chosenModel = model;
        } else {
            console.log("No model chosen. Falling back to qwen/qwq-32b:free . . .");
            chosenModel = "qwen/qwq-32b:free";
        }

        const pathwayChat = await Service.findOne(
            { email: req.user.email, "pathwayChats._id": chatId },
            { "pathwayChats.$": 1 }
        );
        if (!pathwayChat) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid chatId: chatId not found',
                data: {}
            });
        }

        const chatSession = pathwayChat["pathwayChats"][0]["chatData"];

        const vectorInput = Array.from(await transformers.generateEmbedding(tokenizer(message).join(" ")));
        const irisResults = await iris.search(vectorInput, 3);

        let chatRequest = "Here is the previous chat between our customer and AI asstant:\n\n";

        for (chat of chatSession) {
            chatRequest += `${chat["role"]}: ${chat["message"]}\n`;
        }

        chatRequest += `\nOur customer add conversation that may include heath-related complaints:\n\n${message}\n\n`;
        if (irisResults.length > 0) {
            chatRequest += `Our system detect that the symptom may related to ${irisResults[0].disease} disease. Return a reply of medical advice to improve our customer health. Reply with format {"chatReply":chatReply,"disease":"${irisResults[0].disease}"} and without filler comment such as 'Okay, here's a response addressing'. Example: {"chatReply":chatReply,"disease":"${irisResults[0].disease}"}`;
        } else {
            chatRequest += `Return a reply of medical advice to improve our customer health and one disease the most likely from the list ${JSON.stringify(diseaseFallback)}. Reply with format {"chatReply":chatReply,"disease":disease} and without filler comment such as 'Okay, here's a response addressing'. Example: {"chatReply":chatReply,"disease":"Multiple Sclerosis"}`;
        }

        const requestBody = {
            model: chosenModel,
            messages: [{ role: 'user', content: chatRequest }],
        };

        const response = await fetch(process.env.OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://fitflo-api.faizath.com',
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
            message: message,
            role: "user"
        });
        chatData.push({
            message: JSON.parse(chatCompletetion)["chatReply"],
            role: "assistant",
            model: chosenModel,
            disease: JSON.parse(chatCompletetion)["disease"],
            diseaseSource: (irisResults.length > 0 ? "Intersystems IRIS" : "OpenRouter.ai API with model " + chosenModel)
        });

        await Service.findOneAndUpdate(
            { 
                email: req.user.email, 
                "pathwayChats._id": chatId 
            },{ 
                $push: { 
                    "pathwayChats.$.chatData": { $each: chatData }
                }
            }
        );

        return res.status(200).json({
            status: 'success',
            message: "Successfuly update user chat",
            data: {
                chatId: chatId,
                model: chosenModel,
                response: JSON.parse(chatCompletetion)["chatReply"],
                disease: JSON.parse(chatCompletetion)["disease"],
                diseaseSource: (irisResults.length > 0 ? "Intersystems IRIS" : "OpenRouter.ai API with model " + chosenModel)
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
    create,
    read,
    update
};