import app from './app.js'

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
    console.log(`Server booting on the ${port}`)
    console.log("Connection Established")
})

const handleExit = (signal : string) => {
    console.log(`\n Received ${signal}. Performing a graceful shutdown`)
    server.close(async() => {
        try{
            console.log("HTTP Server Closed")
            
            console.log("Database connection closed")
            process.exit(0)

        }catch(err) {
            console.log("Error Occured while shutting down the server", err)
            process.exit(1)
        }
    })
}

process.on("SIGKILL", () => handleExit("SIGKILL"))
process.on("SIGTERM", () => handleExit("SIGTERM"))