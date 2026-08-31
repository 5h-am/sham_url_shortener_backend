import app from './app.js'
import { closePool } from './config/db.js'
import { closeRedis } from './config/redis.js'
import { logger } from './config/logger.js'
import { env } from './config/env.js'
import { queueQuit } from './config/queue.js'


const port = env.PORT

const server = app.listen(port, () => {
    console.log(`Server booting on the ${port}`)
    console.log("Connection Established")

    logger.info(`Server booting on the ${port}`)
    logger.info("Connection Established")
})

const handleExit = (signal : string) => {
    console.log(`\n Received ${signal}. Performing a graceful shutdown`)
    logger.info(`\n Received ${signal}. Performing a graceful shutdown`)
    server.close(async() => {
        try{
            console.log("HTTP Server Closed")
            logger.info("HTTP Server Closed")

            await queueQuit()
            console.log("Queue Closed")
            logger.info("Queue Closed")

            await closeRedis()
            console.log("Redis Connection Closed")
            logger.info("Redis Connection Closed")

            await closePool()         
            console.log("Database connection closed")
            logger.info("Databse Connection Closed")
            process.exit(0)

        }catch(err) {
            console.log("Error Occured while shutting down the server", err)
            logger.error({ err }, "Error Occured while shutting down the server")
            process.exit(1)
        }
    })
}

process.on("SIGINT", () => handleExit("SIGINT"))
process.on("SIGTERM", () => handleExit("SIGTERM"))