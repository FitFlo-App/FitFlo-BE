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

        const verificationToken = signToken({
            email: email,
            isEmailVerification: true
        });

        const verificationCheckToken = signToken({
            email: email,
            isVerified: false
        });
        
        await mailsender.sendmail({
            fromaddres: 'FitFlo <noreply@fitflo.site>',
            receipients: email,
            subject: 'Sign in to FitFlo',
            message: `Hi\n\nPlease click the following link to verify your account registration at FitFlo\n\n\n${req.protocol}://${req.get('host')}/user/auth/email/activate?token=${encodeURIComponent(verificationToken)}\n\n\nIf you did not initiate this registration request, please disregard this email.\n\nThank You.\n\n\n`,
            html: false
        });
        return res.status(200).json({
            status: 'success',
            message: 'Email sent. Please check yout inbox',
            data: {
                verificationCheck: `${req.protocol}://${req.get('host')}/user/auth/email/activation?token=${encodeURIComponent(verificationCheckToken)}`
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

const activate = async (req, res) => {
    try {
        const token = req.query.token;
        const verification = verify(token);
        if (verification.status == "error") {
            res.send("Email Verification Links Expired");
            // return res.status(401).json({
            //     status: "error", 
            //     message: "Unauthorized: Invalid Authentication",
            //     data: {}
            // });
        } else {
            if (verification.data.isEmailVerification) {
                const user = await prisma.auth.findUnique({
                    where: { email: verification.data.email },
                });
                if (user) {
                    if (!user.isActive) {
                        await prisma.auth.update({
                            where: { email: verification.data.email },
                            data: { isActive: true },
                        });res.send("Email Verified");
                    } else {
                        res.send("Email Already Verified");
                        // const refreshedToken = signToken({
                        //     email: verification.data.email,
                        //     auth: "email",
                        //     isActive: true
                        // });
                        // res.redirect('/?token=' + refreshedToken);
                    }
                } else {
                    res.send("Unauthorized: Invalid Authentication");
                    // return res.status(401).json({
                    //     status: "error", 
                    //     message: "Unauthorized: Invalid Authentication",
                    //     data: {}
                    // });
                }
            } else {
                res.send("Unauthorized: Invalid Authentication");
            }
        }
    } catch (err) {
        console.error(err);
        res.send(process.env.DEBUG ? err.message : "Bad Request");
        // return res.status(400).json({
        //     status: 'error',
        //     message: process.env.DEBUG ? err.message : "Bad Request",
        //     data: {}
        // });
    }
};

const activation = async (req, res) => {
    try {
        const token = req.query.token;
        const verification = verify(token);
        if (verification.status == "error") {
            return res.status(401).json({
                status: "error", 
                message: "Verification Link Expired. Please request email verification again.",
                data: {
                    isVerified: false
                }
            });
        } else {
            if (!verification.data.isVerified) {
                const user = await prisma.auth.findUnique({
                    where: { email: verification.data.email },
                });
                if (user) {
                    if (!user.isActive) {
                        return res.status(200).json({
                            status: "success", 
                            message: "User still not verified",
                            data: {
                                isVerified: false
                            }
                        });
                    } else {
                        return res.status(200).json({
                            status: "success", 
                            message: "User is verified",
                            data: {
                                isVerified: true
                            }
                        });
                    }
                } else {
                    return res.status(401).json({
                        status: "error", 
                        message: "Error: User not found",
                        data: {
                            isVerified: false
                        }
                    });
                }
            } else {
                return res.status(400).json({
                    status: 'error',
                    message: "Invalid Authentication",
                    data: {
                        isVerified: false
                    }
                });
            }
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            status: 'error',
            message: process.env.DEBUG ? err.message : "Bad Request",
            data: {
                isVerified: false
            }
        });
    }
};

const emailAuthController = {
    login,
    register,
    activate,
    activation
};

module.exports = emailAuthController;