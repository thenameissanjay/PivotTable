const express = require('express')
const db = require('./connection')
const router = require('./routers/routers')
const triggerRouter = require('./routers/triggerroutes')

const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/user', router)
app.use('/api/trigger', triggerRouter)

app.listen(8080, ()=>{
    console.log('server is runing ');
})