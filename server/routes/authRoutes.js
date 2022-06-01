const express = require('express')
const authenticateUser  = require('../middleware/auth')
const User = require ('../models/User')
const router = express.Router();
const {register,login,updateUser,forgotPassword,resetPassword,loginWithGoogle} =require('../controllers/authController');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({ storage: storage });

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/loginWithGoogle').post(loginWithGoogle);
router.patch('/updateUser/:id',uploadOptions.single('avatar'),async (req, res) => {
    console.log(req.body)
    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const {email,name,lastName,location} = req.body;
    const fileName = file.filename;

    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if(!email || !name || !lastName ){
        throw new BadRequestError('Please provide all values')
    }

    const updateUser = await User.findByIdAndUpdate(req.params.id, {
            name : req.body.name,
            email : req.body.email,
            lastName : req.body.lastName,
            location : req.body.location,
            avatar :`${basePath}${fileName}`
    }, { new : true})
  
   
    if(!updateUser) return res.status(500).json({ status : 'The user cant be updated'})

    const token =  updateUser.createJWT();
     res.status(200).json({ updateUser,token,location : updateUser.location });


});
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').post(resetPassword);
module.exports = router;