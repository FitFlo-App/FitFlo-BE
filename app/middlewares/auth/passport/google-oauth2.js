const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GoogleStrategy = require('passport-google-oauth2').Strategy;
const createUser = require('../../../domains/users/entities/user.controller').createUser;

const Strategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_OAUTH_CALLBACK,
    passReqToCallback: true,
}, async function(request, accessToken, refreshToken, profile, done) {
    try {
        const user = await prisma.auth.findUnique({
            where: { email: profile.email },
        });
    
        if (!user) {
            await createUser(profile.email, "google", null, true);
        }
        
        return done(null, profile);
    } catch (err) {
        console.error(err);
    }
});

const serializeUser = (user, done) => {
    done(null, user);
};

const deserializeUser = (user, done) => {
    done(null, user);
};

const isLoggedIn = (req, res, next) => {
    req.user ? next() : res.status(401).json({
        status: 'error',
        message: 'Google Auth Unauthorized',
        data: {}
    });
};

module.exports = {
    Strategy,
    serializeUser,
    deserializeUser,
    isLoggedIn
};