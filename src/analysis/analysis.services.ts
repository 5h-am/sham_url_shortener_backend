import { fetchTopBrowsers, fetchTopCountries, fetchTopReferrers, fetchTopDevices, fetchTopOs, fetchClicksOverTime } from "./analysis.repositories.js"

export const topValuesService = async(urlsId: string) => {
    const topBrowsers = await fetchTopBrowsers(urlsId)
    const topCountries = await fetchTopCountries(urlsId)
    const topReferrers = await fetchTopReferrers(urlsId)
    const topDevices = await fetchTopDevices(urlsId)
    const topOs = await fetchTopOs(urlsId)

    return {
        topBrowsers,
        topCountries,
        topReferrers,
        topDevices,
        topOs
    }
}

export const clicksOverTimeService = async(urlsId: string, groupBy: string) => {
    const clicksData = await fetchClicksOverTime(urlsId, groupBy)
    return clicksData
}