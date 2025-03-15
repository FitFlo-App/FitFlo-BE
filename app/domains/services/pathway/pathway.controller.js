const Service = require('../entities/services.model').Service;

const transformers = require('../../../utils/nlp/xenova/transformers');
const tokenizer = require('../../../utils/nlp/natural/tokenizer');

const iris = require('../../../configs/database/iris/iris.client');

const diseaseFallback = ['Multiple Sclerosis', 'Parkinson’s Disease', 'Gastroesophageal Reflux Disease', 'Appendicitis', 'Asthma', 'Lung Cancer', 'Pneumonia', 'Breast Cancer', 'Heart Attack', 'Fibromyalgia', 'Kidney Failure', 'Leukemia', 'Skin Cancer', 'Dengue Fever', 'Rheumatoid Arthritis', 'Lymphoma', 'Hepatitis B', 'Alzheimer’s Disease', 'Shingles', 'Vertigo', 'Cervical Cancer', 'Liver Cirrhosis', 'Irritable Bowel Syndrome', 'Strep Throat', 'Influenza', 'Food Poisoning', 'Gallstones', 'Meningitis', 'Polio', 'Migraine', 'Psoriasis', 'Peptic Ulcer', 'Gout', 'Diabetes Mellitus', 'Bronchitis', 'Hypothyroidism', 'Tuberculosis', 'Prostate Cancer', 'Urinary Tract Infection', 'Hyperthyroidism', 'Chronic Fatigue Syndrome', 'Malaria', 'Stroke', 'Hypertension', 'Epilepsy', 'Colon Cancer', 'Pancreatitis', 'Osteoporosis', 'Common Cold', 'Eczema'];

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
        console.log(`chosenModel: ${chosenModel}`);

        const getService = await Service.findOne({ email: req.user.email });

        if (!getService) {
            return res.status(400).json({
                status: 'error',
                message: "User profile is not completed yet",
                data: {}
            });
        }

        const vectorInput = await transformers.generateEmbedding(tokenizer(message).join(" "));

        const irisResults = await iris.search(vectorInput, 3);

        let chatRequest = `Our customer request below may include heath-related complaints:\n\n${message}\n\n`;

        if (irisResults.status) {
            chatRequest += `Our system detect that the symptom may related to ${irisResults.data[0]} disease. Return a reply of medical advice to improve our customer health.`;
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

        console.log(`chatCompletetion: ${chatCompletetion}`);

        let chatData = [];
        chatData.push({
            message: message,
            role: "user"
        });
        
        if (irisResults.status) {
            chatData.push({
                message: chatCompletetion,
                role: "assistant",
                suspectedDisease: irisResults.data[0]
            });
            console.log(`suspectedDisease: ${irisResults.data[0]}`);
        } else {
            chatData.push({
                message: JSON.parse(chatCompletetion)["chatReply"],
                role: "assistant",
                suspectedDisease: JSON.parse(chatCompletetion)["disease"]
            });
            console.log(`suspectedDisease: ${JSON.parse(chatCompletetion)["disease"]}`);
        }

        console.log(chatData);

        getService.pathwayChats.push({chatData});
        
        console.log(getService);

        const chatID = await getService.save();

        if (irisResults.status) {
            return res.status(200).json({
                status: 'success',
                message: "Successfuly process user chat",
                data: {
                    chatId: chatID.pathwayChats.slice(-1)[0]._id,
                    model: chosenModel,
                    response: chatCompletetion,
                    diseaase: irisResults.data[0]
                }
            });
        } else {
            return res.status(200).json({
                status: 'success',
                message: "Successfuly process user chat",
                data: {
                    chatId: chatID.pathwayChats.slice(-1)[0]._id,
                    model: chosenModel,
                    response: JSON.parse(chatCompletetion)["chatReply"],
                    diseaase: JSON.parse(chatCompletetion)["disease"]
                }
            });
        }
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