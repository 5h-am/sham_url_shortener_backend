import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const accessTokenGeneration = (refreshId: string) => {
    const accessToken  = jwt.sign(
            {refreshId},
            env.ACCESS_TOKEN_SECRET,
            {expiresIn: '20m'}
        )
    return accessToken
}

export const refreshTokenGeneration = (refreshId:string) => {
    const refreshToken = jwt.sign(
        {refreshId},
        env.REFRESH_TOKEN_SECRET,
        {expiresIn : '24h'}
    )
    return { refreshToken }
}