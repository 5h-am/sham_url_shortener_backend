import { query } from '../config/db.js'

export const fetchOriginalUrl = async(urlCode: string) => {
    const result = await query('SELECT id, original_url FROM urls WHERE urls_code = $1', [urlCode])
    return result.rows[0]
}

export const insertAnalysisData = async(clickedAt: string, ipAddress: string, country: string, urlsId: string, referer: string, browser: string, device: string, os: string) => {
    await query('INSERT INTO clicks(clicked_at, ip_address, country, urls_id, referrer, browser, device, os) VALUES($1, $2, $3, $4, $5, $6, $7, $8)', [clickedAt, ipAddress, country, urlsId, referer, browser, device, os])
}