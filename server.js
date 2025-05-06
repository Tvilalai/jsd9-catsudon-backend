import dotenv from 'dotenv'
import express from 'express'
import { connectMongo } from './config/db.js'
import apiRouter from './routes/apiRouter.js'
dotenv.config()
const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use('/calnoy-api/v1', apiRouter)

app.listen(PORT,()=>{
    connectMongo()
    console.log("server running on http://localhost:"+PORT)
})