const express = require('express')
const authenticateUser  = require('../middleware/auth')
const User = require ('../models/User')
const router = express.Router();
const {loginWithGoogle,getAllUsers, deleteUser} =require('../controllers/authController');
const multer = require('multer');


router.route('/getAllUsers').get(getAllUsers)
router.route('/deleteUser/:id').delete(deleteUser)

module.exports = router;