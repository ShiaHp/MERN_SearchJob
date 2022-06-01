const express = require('express')
const authenticateUser  = require('../middleware/auth')
const router = express.Router();
const {register,login,updateUser,forgotPassword,resetPassword,loginWithGoogle} =require('../controllers/authController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/loginWithGoogle').post(loginWithGoogle);
router.route('/updateUser').patch(authenticateUser,updateUser);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').post(resetPassword);
module.exports = router;