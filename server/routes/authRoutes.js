const express = require('express')
const authenticateUser  = require('../middleware/auth')
const router = express.Router();
const {register,login,updateUser} =require('../controllers/authController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/updateUser').patch(authenticateUser,updateUser);

module.exports = router;