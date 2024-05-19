import dotenv from 'dotenv'
import connectDB from './db/index.js'
import { app } from './app.js'

dotenv.config({ path: "./.env" });

connectDB()
.then(()=>{
    app.on('error', (error) => {
        console.log(" Error while connecting to DB:"+error)
    })
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`)
    })
}).catch((error) => {
    console.log(" Error while connecting to DB:"+error)
})