const jwt = require('jsonwebtoken')
const tokenModel = require('../models/token-model')


class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {expiresIn: '30d'})
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({userId})
        if(tokenData) {
            tokenData.refreshToken = refreshToken
            tokenData.save();
        }

        return await tokenModel.create({user: userId, refreshToken})
    }
}

module.exports = new TokenService();