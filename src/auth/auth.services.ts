import { accountCreation, loginDetailsFetcher, forgetPwdEmail, resetPwd } from "./auth.repositories.js"
import argon2 from 'argon2'
import { accessTokenGeneration, refreshTokenGeneration } from "../utils/token.js"
import { AppError } from "../utils/appError.js"
import jwt from 'jsonwebtoken'
import { env } from "../config/env.js"
import { emailTransport, mailOptions } from "../config/email.js"
import { forgetPwdEmailBuilder } from "../utils/email/forgetPasswordHtml.js"

export const signUpService = async(email: string, pwd: string, fullName: string) => {
    const hashPwd = await argon2.hash(pwd)
    const user = await accountCreation(email, hashPwd, fullName)
    const accessToken  = accessTokenGeneration(user.id)
    const { refreshId, refreshToken } = refreshTokenGeneration()

    return { accessToken, refreshId, refreshToken, userId: user.id }  
}

export const logInService = async(email: string, pwd: string) => {
    const user = await loginDetailsFetcher(email)
    if(user === undefined || !user ) {
        throw new AppError("Invalid Credentials", 401)
    }
    const isValid = await argon2.verify(user.password_hash, pwd)
    if(!isValid) {
        throw new AppError("Invalid Credentials", 401)
    }

    const accessToken  = accessTokenGeneration(user.id)
    const { refreshId, refreshToken } = refreshTokenGeneration()

    return { accessToken, refreshId, refreshToken, userId: user.id }

    
}

export const refreshService = (userId: string) => {
    const accessToken = accessTokenGeneration(userId)
    const { refreshId, refreshToken } = refreshTokenGeneration()
    return { accessToken, refreshId, refreshToken }
}

export const forgetPwdService = async(email:string) => {
    const user = await forgetPwdEmail(email)
    if(!user || user === undefined) {
        return 
    }
    const token = jwt.sign(
        {userId: user.id},
        env.RESET_PASSWORD_TOKEN_SECRET,
        {expiresIn: '15m'}
    )
    const resetPwdUrl = `${env.FRONTEND_URL}/resetPwd/${token}`
    const resetPwdEmail = forgetPwdEmailBuilder(resetPwdUrl)
    const options = mailOptions({ to: email, subject: 'Reset Account Password', html: resetPwdEmail})
    const transporter = emailTransport()

    await transporter.sendMail(options)

    return
}

export const resetPwdService = async(token: string, newPwd: string) => {
    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET)
    if(typeof payload !== 'string'){
        const { userId } = payload
        const hashPwd = await argon2.hash(newPwd)
        await resetPwd(hashPwd, userId)
    }
}