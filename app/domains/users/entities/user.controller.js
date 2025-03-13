const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const createUser = async (email, auth, password, nullpass=false) => {
    try {
        await prisma.auth.create({
            data: {
                email,
                auth,
                password: (auth === 'email' ? (nullpass ? "" : await bcrypt.hash(password, 10)) : null),
                isActive: (auth === 'email' ? false : true),
            },
        });
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    createUser
};