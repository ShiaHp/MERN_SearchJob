const User = require ('../models/User')
const {StatusCodes} = require('http-status-codes')
const sendEmail = require('../utils/sendEmail')
const cron = require('node-cron');
const {BadRequestError,NotFoundError,Unauthenticated} = require('../errors/index')
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
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

const updateUser =async (req, res) => {
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
     res.status(StatusCodes.OK).json({ updateUser,token,location : updateUser.location });


};
const signToken = id =>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_LIFETIME
    })
}

const register = async (req, res,next) => {
    const {name,email,password,passwordConfirm,isAdmin } = req.body;


    if(!name || !email || !password || !passwordConfirm ) {
        throw new BadRequestError('Please provide all values');

    }
    const userAlreadyExists = await User.findOne({ email});

    if(userAlreadyExists){
        throw new BadRequestError('Email already in use');
    }
    const user = await User.create({name,email,password,passwordConfirm,isAdmin});
    const token = user.createJWT();

    res.status(StatusCodes.CREATED).json({ 
            messages : 'Success',
            token : token,
            user : {
                email : user.email,
                lastName : user.lastName,
                location : user.location,
                name : user.name,
                isAdmin : user.isAdmin
                
            }
         });
   
}

const login =  async (req, res,) => {
    const {email, password} = req.body;
    if(!email || !password) {
        throw new BadRequestError('Please provide all values');
    };

    const user = await User.findOne({email}).select('+password')
    
    if(!user) {
        throw new Unauthenticated('Invalid Credentials');
    }
   


    const isPassword = await user.comparePassword(password);
    
    if(!isPassword) {
        throw new Unauthenticated('Invalid Credentials');
    }

    const token = jwt.sign(
        {
            isAdmin: user.isAdmin
        },
          process.env.JWT_SECRET,
        {expiresIn : '1d'}
    )
    user.password = undefined;

    res.status(StatusCodes.OK).json({
            user,token,location:user.location
    })
}

const loginWithGoogle = async (req,res) => {
    const {email,facebookId} = req.body;
    if(!email || !facebookId) {
        throw new BadRequestError('Please provide all values')
    }
    const user = await User.findOne({email: email})
    if(!user) {   throw new Unauthenticated('Invalid Credentials');}
    const token = user.createJWT();
    res.status(200).json({
        user,token,location:user.location
    })
}



const forgotPassword = async(req, res) => {

     const user = await User.findOne({
            email: req.body.email
        });

        if(!user) {
            throw new NotFoundError('There is no user with email ' )
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({validateBeforeSave  : false});

        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;
        const message =  `Forgot your password ? Submit a PATCH request to reset your password and passwordConfirm to : ${resetURL} .
        \nIf you did't forget your password , please ignore this email!`;
        try{
          
                await sendEmail({
                    receiverEmail : user.email,
                    UserName : user.name,
                    website : "Jobfun",
                    redirectLink : resetURL,
                    resetToken : resetToken
                })

                cron.schedule('0 */1 * * * *', async () => {
                    await transporter.sendMail({
                        email : user.email,
                        subject : 'Your password reset token (valid for 10 minutes)',
                        message,
                        
                    })
                 });
                res.status(StatusCodes.OK).json({
                    status : 'success',
                    message : 'Token send to email !'
                })
        } catch(e) {
           
            user.passwordResetToken = undefined;
            user.passwordResetExpires =undefined;
            await user.save({validateBeforeSave: false})
            throw new NotFoundError('There is no user with email ' )
              
        
        }
}

const resetPassword =async(req, res ,next) => {
    // 1, Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken : hashedToken ,
        passwordResetExpires : {$gt : Date.now()},
    });

    // 2,if token has not expired, and there is user ,set the new password 
    if(!user){
        throw new NotFoundError('Token is invalid')
    }
    user.password = req.body.password;
    user.passwordConfirm= req.body.passwordConfirm
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3, update changedPasswordAt props for the users


    // 4, log the user in , send JWT

    const token = signToken(user._id)
    // payload, secret key 
    res.status(201).json({
        status : 'success',
        token,

    })
}
    const getAllUsers = async (req, res) =>{
    
        const {sort,search,isAdmin} = req.query

        const queryObject ={
            createdBy : req.user.userId
        }
   
        if(isAdmin && isAdmin !=='all'){
            queryObject.isAdmin = isAdmin
        }
        if(search){
            queryObject.name = {$regex:search , $options: 'i'}
        }
      
        let result = User.find(queryObject)
          
    if (sort === 'latest') {
        result = result.sort('-createdAt')
      }
      if (sort === 'oldest') {
        result = result.sort('createdAt')
      }


      const page = Number(req.query.page) || 1 ;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      result = result.skip(skip).limit(limit);

    
        try {
            const users = await result
        
            const totalUsers = await User.countDocuments(queryObject)
            const numOfPages = Math.ceil(totalUsers /limit)
            // const token = jwt.sign({isAdmin: users.users.isAdmin},process.env.JWT_SECRET,{
            //     expiresIn : process.env.JWT_LIFETIME
            // })
            res.status(200).json({
                message : 'Success',
                users ,
                totalUsers,
                numOfPages
            });

        } catch (error) {
                console.log(error)
        }
    }

const deleteUser = async (req, res) => {
    const {id} = req.params
            try {
               await User.findByIdAndDelete(id);
                res.status(200).send({ message: 'Success'})
            } catch (error) {
                res.status(404).json({   messages : error.message})
             
            }
    }


module.exports = { register,login,updateUser, forgotPassword,resetPassword,loginWithGoogle,getAllUsers,deleteUser }