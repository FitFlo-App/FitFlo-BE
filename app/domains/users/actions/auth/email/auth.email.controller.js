const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bcrypt = require('bcrypt');
const signToken = require('../../../../../utils/auth/jwt/sign');
const verify = require('../../../../../utils/auth/jwt/verify');

const createUser = require('../../../entities/user.controller').createUser;
const mailsender = require('../../../../../utils/mail/sender');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.auth.findUnique({
            where: { email: email },
        });
    
        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: process.env.DEBUG ? "Email not Found" : "Invalid Credentials",
                data: {}
            });
        }

        if (bcrypt.compareSync(password, user.password)) {
            const userTokenSign = {
                email: email,
                auth: "email",
                isActive: true,
            }
            return res.status(200).json({
                status: 'success',
                message: "Login Success",
                data: {
                    email: email,
                    token: signToken(userTokenSign)
                }
            });
        } else {
            return res.status(400).json({
                status: 'error',
                message: process.env.DEBUG ? "Wrong Password" : "Invalid Credentials",
                data: {}
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

const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Parameter "email" required',
                data: {}
            });
        }

        const user = await prisma.auth.findUnique({
            where: { email: email },
        });
    
        if (user) {
            return res.status(400).json({
                status: 'error',
                message: process.env.DEBUG ? "Email already registered" : "Bad Request",
                data: {}
            });
        } else {
            await createUser(email, "email", password);
        }
        
        let userTokenSign = {
            email: email,
            auth: "email",
            isActive: false
        }

        const token = signToken(userTokenSign);
        
        await mailsender.sendmail({
            fromaddres: 'FitFlo <fitflo@mail.faizath.com>',
            receipients: email,
            subject: 'Sign in to FitFlo',
            message: `Hi\n\nPlease click the following link to sign in to FitFlo\n${req.protocol}://${req.get('host')}/user/auth/email/activate/${token}\n\n\n`,
            html: false
        });
        return res.status(200).json({
            status: 'success',
            message: 'Email sent. Please check yout inbox',
            data: {}
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

const activate = async (req, res) => {
    try {
        const { token } = req.params;
        const verification = verify(token);
        if (verification.status == "error") {
            return res.status(401).json({
                status: "error", 
                message: "Unauthorized: Invalid Authentication",
                data: {}
            });
        } else {
            const user = await prisma.auth.findUnique({
                where: { email: verification.data.email },
            });
            if (user) {
                if (!user.isActive) {
                    await prisma.auth.update({
                        where: { email: verification.data.email },
                        data: { isActive: true },
                    });
                } else {
                    const refreshedToken = signToken({
                        email: verification.data.email,
                        auth: "email",
                        isActive: true
                    });
                    res.redirect('/?token=' + refreshedToken);
                }
            } else {
                return res.status(401).json({
                    status: "error", 
                    message: "Unauthorized: Invalid Authentication",
                    data: {}
                });
            }
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            status: 'error',
            message: process.env.DEBUG ? err.message : "Bad Request",
            data: {}
        });
    }
};

const emailAuthController = {
    login,
    register,
    activate
};

module.exports = emailAuthController;