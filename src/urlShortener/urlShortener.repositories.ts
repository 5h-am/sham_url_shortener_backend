import { query } from '../config/db.js'


export const insertUrlDetails = async(originalUrl: string, urlCode: string, userId?: string) => {
    await query(
    'INSERT INTO urls(urls_code, users_id, original_url) VALUES($1, $2, $3)',
    [urlCode, userId ?? null, originalUrl]
  )
}

export const fetchUrls = async(userId: string) => {
  await query("SELECT * FROM urls WHERE users_id = $1", [userId])
}

export const deleteUrl = async(userId: string) => {
  await query("DELETE FROM urls WHERE users_id = $1", [userId])
}

