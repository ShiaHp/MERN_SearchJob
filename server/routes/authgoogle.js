const router = require("express").Router();
const passport = require("passport");
const CLIENT_HOME_PAGE_URL = "http://localhost:3000";






router.get('/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/google/callback', 
  passport.authenticate('google', {
    successRedirect : '/login/success',
    failureRedirect: '/login/failed' 
})
);

router.get('/login/success', (req, res) => {
    
    if(req.user){
        res.status(200).json({
            success: true,
            message: "user has successfully authenticated",

            user : req.user
        })
    }
       

   });
   
router.get('/login/failed',(req, res) => {
    res.status(401).json({
        success: false,
        message: "user failed to authenticate."
      });

}

)

module.exports = router;