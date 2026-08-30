import { fetchTopBrowsers, fetchTopCountries, fetchTopReferrers, fetchTopDevices, fetchTopOs, fetchClicksOverTime } from "./analysis.repositories.js"

export const topValuesService = async(userId: string) => {
    const topBrowsers = await fetchTopBrowsers(userId)
    const topCountries = await fetchTopCountries(userId)
    const topReferrers = await fetchTopReferrers(userId)
    const topDevices = await fetchTopDevices(userId)
    const topOs = await fetchTopOs(userId)

    return {
        topBrowsers,
        topCountries,
        topReferrers,
        topDevices,
        topOs
    }
}

export const clicksOverTimeService = async(userId: string, groupBy: string) => {
    const clicksData = await fetchClicksOverTime(userId, groupBy)
    return clicksData
}