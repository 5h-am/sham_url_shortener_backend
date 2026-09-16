import { z } from 'zod'

export const urlShortenerSchema = z.object({
    originalUrl : z.url()
})

export const listAllUrlsSchema = z.object({
    urlsByDate : z.enum(["all", "day", "week", "month"]).optional(),
    sortBy: z.enum(['created_at', 'totalClicks']).optional()
})