import { Pool } from 'pg'
import { logger } from './logger.js'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30 * 1000,
    connectionTimeoutMillis: 2000
})

pool.on("connect", () => {
    console.log("A new client successfully connected to postgresql")
    logger.info("A new client successfully connected to postgresql")
})

pool.on("error", (err) => {
    console.log("Error happened while creating a new postgresql connection", err.message)
    logger.error({ err }, "Error happened while creating a new postgresql connection")
})

const query = async(text: string, params?: unknown[]) => {
    const start = Date.now()
    try{
        const res = await pool.query(text, params)
        const duration = start - Date.now()

        logger.info(`Query executed in ${duration}ms. Command: ${text.split(' ')[0]}`)
        return res
    }catch(err) {
        logger.error({ err }, "Error Occured while executing the query")
        throw err
    }
}

const closePool = async () => {
    logger.info("Closing the database connection")
    await pool.end()
}

export { query, closePool }