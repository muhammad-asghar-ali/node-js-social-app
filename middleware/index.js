const { expressjwt: jwt } = require("express-jwt");

module.exports.requireSignIn = () => {
    jwt({
        secret: process.env.JWTSCRECT,
        algorithms: ['HS256']
    })
}