import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { urlShortenerQueue, urlAnalysisQueue } from '../config/queue.js'

export const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
    queues: [
        new BullMQAdapter(urlShortenerQueue),
        new BullMQAdapter(urlAnalysisQueue)
    ],
    serverAdapter,
})