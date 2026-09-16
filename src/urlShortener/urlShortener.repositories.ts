import { query } from '../config/db.js'


export const insertUrlDetails = async(originalUrl: string, urlCode: string, userId?: string) => {
    await query(
    'INSERT INTO urls(urls_code, users_id, original_url) VALUES($1, $2, $3)',
    [urlCode, userId ?? null, originalUrl]
  )
}

export const fetchAllUrls = async(userId: string, sortBy: string) => {
  const results = await query(`SELECT urls.id, urls.urls_code, urls.original_url, urls.created_at, COUNT(clicks.id) AS totalClicks FROM urls LEFT JOIN clicks on clicks.urls_id = urls.id WHERE urls.users_id = $1 GROUP BY urls.id ORDER BY ${sortBy}`, [userId])
  return results.rows
}

export const fetchUrlsByDate = async(userId:string, urlsByDate: string, sortBy:string) => {
  const results = await query(`SELECT urls.id, urls.urls_code, urls.original_url, urls.created_at, COUNT(clicks.id) AS totalClicks FROM urls LEFT JOIN clicks on clicks.urls_id = urls.id WHERE urls.users_id = $1 AND urls.created_at >= DATE_TRUNC($2, NOW()) GROUP BY urls.id ORDER BY ${sortBy}`, [userId, urlsByDate])
  return results.rows
}

export const deleteUrl = async(urlId: string, userId: string) => {
  await query("DELETE FROM urls WHERE id = $1 AND users_id = $2", [urlId, userId])
}

