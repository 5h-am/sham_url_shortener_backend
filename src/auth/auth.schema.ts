import { z } from 'zod'

export const userSignUpSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    fullName: z.string()
})

export const userLoginSchema = z.object({
    email: z.email(),
    password: z.string().min(8)
})


export const userForgetPwdSchema = z.object({
    email: z.email(),
})

export const userResetPwdSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(8)
})