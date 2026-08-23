import { Application } from 'express'
import path from 'path'
import pino from 'pino'
import { pinoHttp } from 'pino-http'
import crypto from 'node:crypto'

const base = path.resolve("./logs")
const infoPath = path.join(base, "info/info.log")
const errorPath = path.join(base, "error/error.log")

const transports = pino.transport({
    targets: [
        {
            target: "pino-roll",
            level: "info",
            options: { file: infoPath, frequency: "daily", mkdir: true, limit: { count: 15 }, dateFormat: "dd-MM-yyyy"}
        },
        {
            target: "pino-roll",
            level: "error",
            options: { file: errorPath, frequency: "daily", mkdir: true, limit: { count: 15 }, dateFormat: "dd-MM-yyyy"}
        },
    ],
})

const logger = pino({ timestamp: pino.stdTimeFunctions.isoTime }, transports)

const configLogger = ( app: Application ) => {
    app.use(
        pinoHttp({
            logger,

            genReqId: (req, res) => {
                const existingId = req.id ?? req.headers["x-request-id"]
                if (existingId) { return existingId}
                const id = crypto.randomUUID()
                res.setHeader("X-Request-Id", id)
                return id
            },
        })
    )
}

export { logger, configLogger } 