const express = require('express');
const app = express();
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors');
const morgan = require('morgan')
const auth = require('../server/middleware/auth')
app.use(cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // allow session cookie from browser to pass through
}));
require('express-async-errors');
const passport = require('passport')
const session = require('express-session');
 require('../server/config/auth');
 app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
// routes
const authRouter = require('./routes/authRoutes')
const jobsRouter = require('./routes/jobsRoutes')
const usersRouter = require('./routes/usersRouter')
// 
const connectDB = require('./db/connect.js')
// middleware
const errorHandleMessage = require('./middleware/error-handler');
const notFoundMiddleware  = require('./middleware/not-found');
const authenticateUser  = require('./middleware/auth')
if(process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
}

const CLIENT_HOME_PAGE_URL = "http://localhost:3000/gmail";

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET' 
  }));

  app.use(passport.initialize());
  // deserialize cookie from the browser
  app.use(passport.session());

app.use(express.json())
// app.get('/', (req, res) => {
//     res.json({msg : 'Welcome!'})
// })

app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/google/callback', 
  passport.authenticate('google', {
    successRedirect : CLIENT_HOME_PAGE_URL,
    failureRedirect: '/login/failed' 
})
);

app.get('/login/success', (req, res) => {
    
    if(req.user){
        res.status(200).json({
            success: true,
            message: "user has successfully authenticated",

            user : req.user
        })
    }
       

   });
   
app.get('/login/failed',(req, res) => {
    res.status(404).send({message: 'User Authentication Error'})
}

)








app.get('/api/v1', (req, res) => {
    res.json({msg : 'API'})
})

// app.get('/auth/google',
// passport.authenticate['google',{ scope : ['email','profile']}]
// )

app.use('/api/v1/auth',authRouter)
app.use('/api/v1/jobs',auth,jobsRouter)
app.use('/api/v1/users',auth,usersRouter)

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