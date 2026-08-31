import { query } from '../config/db.js'


export const insertUrlDetails = async(originalUrl: string, urlCode: string, userId?: string) => {
    await query(
    'INSERT INTO urls(urls_code, users_id, original_url) VALUES($1, $2, $3)',
    [urlCode, userId ?? null, originalUrl]
  )
}

export const fetchUrls = async(userId: string) => {
  const results = await query("SELECT * FROM urls WHERE users_id = $1", [userId])
  return results.rows
}

export const deleteUrl = async(urlCode: string, userId: string) => {
  await query("DELETE FROM urls WHERE urls_code = $1 AND users_id = $2", [urlCode, userId])
}

