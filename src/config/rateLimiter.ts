import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max : 5,
    message: {
        error: "Too Many authentication attempts",
        retryAfter: "1 min"
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
})

export const urlShortenerLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: "Too many url shortening request",
            message: "Too many request from this ip, Please try again later",
            retryAfter: "1 min"
        })
    }
})
export const redirectUrlLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: "Too many url redirect request",
            message: "Too many request from this ip, Please try again later",
            retryAfter: "1 min"
        })
    }
})