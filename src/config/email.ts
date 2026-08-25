import nodemailer from 'nodemailer'
import { AppError } from '../utils/appError.js'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

export const emailTransport = () => {
    try{
        const transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            service: env.SMTP_SERVICE,
            secure: true,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PWD
            }
        })
        return transporter

    }catch(err) {
        logger.error({ err }, "Error Occuredd in email Transport")
        throw err
    }
}

export const mailOptions = (options: {to: string, subject: string, html: string }) => {
    return {
        from: env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html
    }
}