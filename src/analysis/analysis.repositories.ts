import { query } from "../config/db.js"

export const fetchTopCountries = async(urlsId: string) => {
    const results = await query('SELECT country, COUNT(*) AS count FROM clicks WHERE urls_id = $1 AND country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 10', [urlsId])
    return results.rows
}

export const fetchTopReferrers = async(urlsId: string) => {
    const results = await query('SELECT referrer, COUNT(*) AS count FROM clicks WHERE urls_id = $1 AND referrer IS NOT NULL GROUP BY referrer ORDER BY count DESC LIMIT 10', [urlsId])
    return results.rows
}

export const fetchTopBrowsers = async(urlsId: string) => {
    const results = await query('SELECT browser, COUNT(*) AS count FROM clicks WHERE urls_id = $1 AND browser IS NOT NULL GROUP BY browser ORDER BY count DESC LIMIT 10', [urlsId])
    return results.rows
}

export const fetchTopDevices = async(urlsId: string) => {
    const results = await query('SELECT device, COUNT(*) AS count FROM clicks WHERE urls_id = $1 AND device IS NOT NULL GROUP BY device ORDER BY count DESC LIMIT 10', [urlsId])
    return results.rows
}

export const fetchTopOs = async(urlsId: string) => {
    const results = await query('SELECT os, COUNT(*) AS count FROM clicks WHERE urls_id = $1 AND os IS NOT NULL GROUP BY os ORDER BY count DESC LIMIT 10', [urlsId])
    return results.rows
}

export const fetchClicksOverTime = async(urlsId: string, groupBy: string) => {
    const results = await query(`SELECT DATE_TRUNC('${groupBy}', clicked_at) AS grouped_by, COUNT(*) as click_count FROM clicks WHERE urls_id = $1 GROUP BY grouped_by ORDER BY grouped_by`, [urlsId])
    return results.rows
}