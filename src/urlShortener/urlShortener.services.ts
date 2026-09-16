import { fetchAllUrls, fetchUrlsByDate } from "./urlShortener.repositories.js";

export const listAllUrlsService = async(userId: string, urlsByDate: string, sortBy: string) => {
    if(urlsByDate === 'all') {
        const urls = await fetchAllUrls(userId, sortBy)
        return urls

    }else {
        const urls = await fetchUrlsByDate(userId, urlsByDate, sortBy)
        return urls   
    }
    
}