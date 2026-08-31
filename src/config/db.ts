import { Pool } from 'pg'
import { logger } from './logger.js'
import { env } from './env.js'

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30 * 1000,
    connectionTimeoutMillis: 2000
})

pool.on("connect", () => {
    logger.info("A new client successfully connected to postgresql")
})

pool.on("error", (err) => {
    logger.error({ err }, "Error happened while creating a new postgresql connection")
})

const query = async(text: string, params?: unknown[]) => {
    const start = Date.now()
    try{
        const res = await pool.query(text, params)
        const duration = Date.now() - start

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