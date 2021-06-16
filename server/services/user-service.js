const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mainService = require('./mail-service')
const tokenService = require('./token-service')

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})
        if (candidate) {
            throw new Error(`Пользователь с почтовым адресом ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()
        const user = await UserModel.create({email, password: hashPassword, activationLink})


        await mainService.sendActivationMail(email, activationLink);


        const dtoUser = {
            id: user._id,
            email: user.email,
            isActivated: user.isActivated,
        }

        const tokens = tokenService.generateToken(dtoUser)

        await tokenService.saveToken(dtoUser.id, tokens.refreshToken)

        return {
            ...tokens,
            user: dtoUser
        }
    }
}

module.exports = new UserService()