import { query } from '../config/db.js'


export const insertUrlDetails = async(originalUrl: string, urlCode: string, userId?: string) => {
    await query(
    'INSERT INTO urls(urls_code, users_id, original_url) VALUES($1, $2, $3)',
    [urlCode, userId ?? null, originalUrl]
  )
}


