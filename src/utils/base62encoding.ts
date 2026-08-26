


export const base62encoding = (urlCount: number) => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let n = urlCount
    const codeLetters = []
    while(n > 0) {
        codeLetters.push(chars[n % 62])
        n = Math.floor(n / 62)
    }

    const urlCode = codeLetters.reverse().join('')
    return urlCode
    
}