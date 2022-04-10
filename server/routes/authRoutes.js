const express = require('express')

const router = express.Router();
const {register,login,updateUser} =require('../controllers/authController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/updateUser').post(updateUser);

module.exports = router;