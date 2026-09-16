import { z } from 'zod'

export const clickOverTimeSchema = z.object({
    urlsId: z.string(),
    groupBy: z.enum(['hour', 'day', 'week', 'month', 'year'])
})