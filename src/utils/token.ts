import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import crypto from 'node:crypto'

export const accessTokenGeneration = (userId: string) => {
    const accessToken  = jwt.sign(
            {userId},
            env.ACCESS_TOKEN_SECRET,
            {expiresIn: '20m'}
        )
    return accessToken
}

export const refreshTokenGeneration = () => {
    const refreshId = crypto.randomUUID()
    const refreshToken = jwt.sign(
        {refreshId},
        env.REFRESH_TOKEN_SECRET,
        {expiresIn : '24h'}
    )
    return { refreshId, refreshToken }
}