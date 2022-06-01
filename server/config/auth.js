const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('../models/User')
// app.use(passport.initialize());
// app.use(passport.session());

passport.serializeUser(function(user,done){
    done(null,user);    
})

passport.deserializeUser(function(user,done){
    done(null,user);    
})


passport.use(new GoogleStrategy({
    clientID : '1096084959696-mieer16ofpot2o2ti0431ule2q7b14li.apps.googleusercontent.com',
    clientSecret : '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',
    callbackURL:'http://localhost:2828/google/callback',
},
    async (request,accessToken,refreshToken,profile,done) => {
            const currentUser = await User.findOne({
                facebookId : profile.id
            })
            console.log(currentUser)
            if(!currentUser){
                const newUser = await User.create({
                    name : profile.given_name,
                    email : profile.email,
                    avatar : profile.picture,
                    facebookId : profile.id
                })
                if(newUser){
                    done(null,newUser)
                }
            }
    
       done(null,currentUser)
    }
  
))



