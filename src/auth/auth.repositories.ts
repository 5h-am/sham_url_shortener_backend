import { DatabaseError } from "pg"
import { query } from "../config/db.js"
import { logger } from "../config/logger.js"
import { AppError } from "../utils/appError.js"

export const accountCreation = async(email: string, pwd: string, fullName: string ) => {
    try{
        const result = await query('INSERT INTO users(email, password_hash, full_name) VALUES($1, $2, $3) RETURNING id, role', [email, pwd, fullName])
        return result.rows[0]
    }catch(err) {
        logger.error({ err }, 'Error occured while inserting the user details in the datbase')
        if(err instanceof DatabaseError) {
            if(err.code === '23505') {
                throw new AppError('Email already exists', 409)
            }
        }
        throw err
    }
}

export const loginDetailsFetcher = async(email: string) => {
    const result = await query('SELECT id, password_hash, role FROM users WHERE email = $1', [email])
    console.log(result.rows[0])
    return result.rows[0]
}


export const forgetPwdEmail = async(email:string) => {
    const result = await query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email])
    return result.rows[0]
}

export const resetPwd= async(pwd:string, userId:string) => {
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [pwd, userId])
}
