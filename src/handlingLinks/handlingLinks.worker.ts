import { Worker } from 'bullmq'
import { logger } from '../config/logger.js'
import { UAParser } from 'ua-parser-js'
import { connection } from '../config/queue.js'
import axios from 'axios'
import { insertAnalysisData } from './handlingLinks.repositories.js'


const worker = new Worker('urlAnalysis', async(job) => {
    try{
        const { userAgent, referrer, ipAddress, clickedAt, urlsId } = job.data
        const { browser, device, os } = userAgentParser(userAgent)
        const country = await countryFetcher(ipAddress)
        await insertAnalysisData(clickedAt, ipAddress, country, urlsId, referrer, browser!, device!, os!, )
        

    }catch(err) {
        logger.error({queue: 'urlShortener', jobName: job?.name, attemptsMade: job?.attemptsMade, data: job?.data}, `Job ${job?.id} failed: ${err instanceof Error ? err.message: 'Unknown'}`)
        if(job?.attemptsMade === job?.opts.attempts) {
            console.log(`Url Shortener Database Insertion Job Permanently Failed: ${job.id}`)
        }
    }
},{
    connection,
    concurrency: 5
    

})


const userAgentParser = (userAgent: string) => {
    const { browser, device, os } = UAParser(userAgent)
    return { browser: browser?.name, device: device?.type, os: os?.name  }

}

const countryFetcher = async(ipAddress: string) => {
    const { data } = await axios.get(`https://countries.dev/ip/${ipAddress}`)
    const countryName = data.country.name
    return countryName

}