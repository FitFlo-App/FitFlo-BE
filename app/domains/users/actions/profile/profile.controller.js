const User = require('../../entities/user.model').User;

const create = async (req, res) => {
    try {
        const { fullname, gender, birthDate, height, weight, medicalHistory } = req.body;
        const getUser = await User.findOne({ email: req.user.email });
        if (getUser) {
            if (!getUser.isProfileCreated) {

                if (gender && !["male", "female"].includes(gender)) {
                    return res.status(400).json({
                        status: 'error',
                        message: "gender can only be 'male' or 'female'",
                        data: {}
                    });
                }

                getUser.fullname = fullname;
                getUser.gender = gender;
                getUser.birthDate = birthDate;
                getUser.height = height;
                getUser.weight = weight;
                getUser.medicalHistory = medicalHistory;
                getUser.isProfileCreated = true;
                await getUser.save();
                return res.status(200).json({
                    status: 'success',
                    message: "Profile successfully created.",
                    data: {
                        fullname: fullname || null,
                        gender: gender || null,
                        birthDate: birthDate || null,
                        height: height || null,
                        weight: weight || null,
                        medicalHistory: medicalHistory || null
                    }
                });
            } else {
                return res.status(400).json({
                    status: 'error',
                    message: "Profile already created. Use profile update method to update data.",
                    data: {}
                });
            }
        } else {
            return res.status(process.env.DEBUG ? 400 : 401).json({
                status: 'error',
                message: process.env.DEBUG ? "Email from token not found" : "Invalid Token Authorization",
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

const read = async (req, res) => {
    try {
        const getUser = await User.findOne({ email: req.user.email });
        if (getUser) {
            return res.status(200).json({
                status: 'success',
                message: "Profile successfully read.",
                data: {
                    isProfileCreated: getUser.isProfileCreated || false,
                    fullname: getUser.fullname || null,
                    gender: getUser.gender || null,
                    birthDate: getUser.birthDate || null,
                    height: getUser.height || null,
                    weight: getUser.weight || null,
                    medicalHistory: getUser.medicalHistory || null
                }
            });
        } else {
            return res.status(process.env.DEBUG ? 400 : 401).json({
                status: 'error',
                message: process.env.DEBUG ? "Email from token not found" : "Invalid Token Authorization",
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

const update = async (req, res) => {
    try {
        const { fullname, gender, birthDate, height, weight, medicalHistory } = req.body;
        const getUser = await User.findOne({ email: req.user.email });
        if (getUser) {
            if (getUser.isProfileCreated) {

                if (gender && !["male", "female"].includes(gender)) {
                    return res.status(400).json({
                        status: 'error',
                        message: "gender can only be 'male' or 'female'",
                        data: {}
                    });
                }

                getUser.fullname = fullname;
                getUser.gender = gender;
                getUser.birthDate = birthDate;
                getUser.height = height;
                getUser.weight = weight;
                getUser.medicalHistory = medicalHistory;
                await getUser.save();
                return res.status(200).json({
                    status: 'success',
                    message: "Profile successfully updated.",
                    data: {
                        fullname: fullname || null,
                        gender: gender || null,
                        birthDate: birthDate || null,
                        height: height || null,
                        weight: weight || null,
                        medicalHistory: medicalHistory || null
                    }
                });
            } else {
                return res.status(400).json({
                    status: 'error',
                    message: "Profile is not created yet. Use profile create method to update data.",
                    data: {}
                });
            }
        } else {
            return res.status(process.env.DEBUG ? 400 : 401).json({
                status: 'error',
                message: process.env.DEBUG ? "Email from token not found" : "Invalid Token Authorization",
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

module.exports = {
    create,
    read,
    update
}