const User = require('../../../entities/user.model').User;

const bcrypt = require('bcrypt');
const signToken = require('../../../../../utils/auth/jwt/sign');
const verifyJWT = require('../../../../../utils/auth/jwt/verify');

const createUser = require('../../../entities/user.controller').createUser;
const mailsender = require('../../../../../utils/mail/sender');

const verify = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Parameter "email" required',
                data: {}
            });
        }

        const getUser = await User.findOne({ email: email });
    
        if (getUser) {
            if (getUser.isEmailVerified) {
                return res.status(400).json({
                    status: 'error',
                    message: process.env.DEBUG ? "Email already verified" : "Bad Request",
                    data: {}
                });
            } else {
                const currentTime = Math.floor(new Date().getTime() / 1000);
                const timeDiff = currentTime - getUser.lastEmailVerification;
                if (timeDiff <= 60 * 5) {
                    return res.status(400).json({
                        status: 'error',
                        message: process.env.DEBUG ? `Email verification already sent ${Math.floor(timeDiff / 60)} minutes${timeDiff % 60 > 0 ? " and " + (timeDiff % 60).toString() + " seconds" : ""} ago. Please wait some time` : "Bad Request",
                        data: {}
                    });
                } else {
                    getUser.lastEmailVerification = currentTime;
                }
            }
        } else {
            const newUser = new User({
                email: email,
                auth: "email",
                lastEmailVerification: Math.floor(new Date().getTime() / 1000)
            });
            await newUser.save();
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
        const verification = verifyJWT(token);
        if (verification.status == "error") {
            res.send("Email Verification Links Expired");
        } else {
            if (verification.data.isEmailVerification) {
                const getUser = await User.findOne({ email: verification.data.email });
                if (getUser) {
                    if (!getUser.isEmailVerified) {
                        getUser.isEmailVerified = true;
                        await getUser.save();   
                        res.send("Email Verified");
                    } else {
                        res.send("Email Already Verified");
                    }
                } else {
                    res.send("Unauthorized: Invalid Authentication");
                }
            } else {
                res.send("Unauthorized: Invalid Authentication");
            }
        }
    } catch (err) {
        console.error(err);
        res.send(process.env.DEBUG ? err.message : "Bad Request");
    }
};

const activation = async (req, res) => {
    try {
        const token = req.query.token;
        const verification = verifyJWT(token);
        if (verification.status == "error") {
            return res.status(401).json({
                status: "error", 
                message: "Verification Link Expired. Please request email verification again.",
                data: {
                    email: "",
                    isVerified: false
                }
            });
        } else {
            if (!verification.data.isVerified) {
                const getUser = await User.findOne({ email: verification.data.email });
                if (getUser) {
                    if (!getUser.isEmailVerified) {
                        return res.status(200).json({
                            status: "success", 
                            message: "User still not verified",
                            data: {
                                email: getUser.email,
                                isVerified: false
                            }
                        });
                    } else {
                        return res.status(200).json({
                            status: "success", 
                            message: "User is verified",
                            data: {
                                email: getUser.email,
                                isVerified: true
                            }
                        });
                    }
                } else {
                    return res.status(401).json({
                        status: "error", 
                        message: "Error: User not found",
                        data: {
                            email: verification.data.email,
                            isVerified: false
                        }
                    });
                }
            } else {
                return res.status(400).json({
                    status: 'error',
                    message: "Invalid Authentication",
                    data: {
                        email: verification.data.email,
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
                email: "",
                isVerified: false
            }
        });
    }
};

const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Parameter "email" and "password" required',
                data: {}
            });
        }

        const getUser = await User.findOne({ email: email });
    
        if (!getUser || !getUser.isEmailVerified) {
            return res.status(400).json({
                status: 'error',
                message: "Email is not yet verified",
                data: {}
            });
        }

        if (getUser.isRegistered) {
            return res.status(400).json({
                status: 'error',
                message: "User is registered",
                data: {}
            });
        }

        getUser.password = await bcrypt.hash(password, 10);
        getUser.isRegistered = true;
        getUser.save();

        return res.status(200).json({
            status: 'success',
            message: "Email registration successful",
            data: {
                email: email
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

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Parameter "email" and "password" required',
                data: {}
            });
        }

        const getUser = await User.findOne({ email: email });
    
        if (!getUser) {
            return res.status(400).json({
                status: 'error',
                message: process.env.DEBUG ? "Email not Found" : "Invalid Credentials",
                data: {}
            });
        }

        if (!getUser.isEmailVerified) {
            return res.status(400).json({
                status: 'error',
                message: "Email is not yet verified",
                data: {}
            });
        }

        if (!getUser.isRegistered) {
            return res.status(400).json({
                status: 'error',
                message: "User is verified, but not registered",
                data: {}
            });
        }

        if (bcrypt.compareSync(password, getUser.password)) {
            const userTokenSign = {
                email: email,
                auth: "email",
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

const emailAuthController = {
    verify,
    activate,
    activation,
    register,
    login
};

module.exports = emailAuthController;