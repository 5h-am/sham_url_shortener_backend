import { Worker } from 'bullmq'
import { connection } from '../config/queue.js'
import { insertUrlDetails, deleteUrl } from './urlShortener.repositories.js'
import { logger } from '../config/logger.js'

const worker = new Worker('urlShortener', async(job) => {
    try{
        switch(job.name) {
            case 'insert-url-database-protected':
                await insertUrlDetails(job.data.originalUrl, job.data.urlCode, job.data.userId)
                break
            case 'insert-url-database-unprotected':
                await insertUrlDetails(job.data.originalUrl, job.data.urlCode)
                break
        }
    }catch(err) {
        logger.error({queue: 'urlShortener', jobName: job?.name, attemptsMade: job?.attemptsMade, data: job?.data}, `Job ${job?.id} failed: ${err instanceof Error ? err.message: 'Unknown'}`)
        if(job?.attemptsMade === job?.opts.attempts) {
            console.log(`Url Shortener Database Insertion Job Permanently Failed: ${job.id}`)
        }
    }
},{
    connection,
    concurrency: 9
})

const expireWorker = new Worker('expiredUrls', async(job) => {
    try{
        await deleteUrl(job.data.userId)
    }catch(err) {
        logger.error({queue: 'urlShortener', jobName: job?.name, attemptsMade: job?.attemptsMade, data: job?.data}, `Job ${job?.id} failed: ${err instanceof Error ? err.message: 'Unknown'}`)
        if(job?.attemptsMade === job?.opts.attempts) {
            console.log(`Url Shortener Database Insertion Job Permanently Failed: ${job.id}`)
        }
    }
},{
    connection,
    concurrency: 2,
})

