import { z } from 'zod'

export const urlShortenerSchema = z.object({
    originalUrl : z.url()
})