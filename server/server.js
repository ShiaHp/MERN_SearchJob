const express = require('express');
const app = express();
const dotenv = require('dotenv')
dotenv.config()


// routes
const authRouter = require('./routes/authRoutes')

// 
const connectDB = require('./db/connect.js')
// middleware
const errorHandleMessage = require('./middleware/error-handler');
const  notFoundMiddleware  = require('./middleware/not-found');



app.use(express.json())
app.get('/', (req, res) => {
    res.send('Welcome to middleware')
})

app.use('/api/v1/auth',authRouter)


app.use(notFoundMiddleware)
app.use(errorHandleMessage)

const port = process.env.PORT || 2828;



const start = async () => {
    try{
    await connectDB(process.env.MONGO_URL)

    app.listen(port,()=>{
        console.log(`Server is listening on port ${port}`);
        console.log(`Connect to DB`);
    })
    } catch(err){
        console.log(err)
    }
}
start()