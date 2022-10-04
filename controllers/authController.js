const bcrypt = require('bcrypt');
const { hash } = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {sendEmail} = require('../config/mailer');




//register User
const register = async(req,res) =>{
    try{
        if(!req.body.user_name){
            return res.status(400).json({
                status :0,
                message: 'please enter user name'

            })
        }
        if(!req.body.user_email){
            return res.status(400).json({
                status :0,
                message: 'please enter user_email'

            })
        }
        if(!req.body.user_password){
            return res.status(400).json({
                status :0,
                message: 'please enter user_password'

            })
        }
        if(!req.body.program){
            return res.status(400).json({
                status :0,
                message: 'please select program'

            })
        }
        if(!req.body.address){
            return res.status(400).json({
                status :0,
                message: 'please add address'

            })
        }
        if(!req.body.user_device_token){
            return res.status(400).json({
                status :0,
                message: 'please add user_device_token'

            })
        }
        else{
            User.find({user_email: req.body.user_email})
            .exec()
            .then(user =>{
                if(user.length >= 1){
                    res.status(400).json({
                        status:0,
                        message : "user email already exist"
                    })
                }
                else{
                    bcrypt.hash(req.body.user_password,10, (err, hash)=>{
                        if(err){
                            res.status(400).json({
                                status: 0, 
                                message: err.message
                            });
                        }
                        else{
                            if(req.file){
                                profilePicture = req.file.path
                            } 

                            // const verificationCode = Math.floor(10000 + Math.random() * 900000)
                            const verificationCode = 123456;

                            const user = new User({
                            user_name : req.body.user_name,
                            user_email : req.body.user_email,
                            user_password : hash,
                            program : req.body.program,
                            address : req.body.address,
                            bio : req.body.bio,
                            profilePicture: (req.file ? req.file.path : req.body.profilePicture),
                            user_device_token : req.body.user_device_token,
                            code : verificationCode
                             })
                            user.save()
                            .then(result =>{
                                sendEmail(user.user_email, verificationCode, "user_email Verification")
                                return res.status(200).json({
                                    status: 1, 
                                    message: 'User verification code successfully sent to user_email.',
                                    data: {
                                        user_id: result._id
                                    }
                                })
                            })
                            .catch(err => {
                                res.status(400).json({
                                    status: 0, 
                                    message: err.message 
                                });
                            });
                        }
                    })
                }
            })

        }

    }catch(err){
        return res.status(400).json({
            status : 0,
            message: err.message
        });
    }
}

// login user

const login = async (req , res )=>{
    if(!req.body.user_email){
        return res.status(400).send({
            status : 0,
            message: "user_email field is required"
        })
    }
    if(!req.body.user_password){
        return res.status(400).send({
            status : 0,
            message : "user_password field is required"
        })

    }
    if(!req.body.user_device_token){
        return res.status(400).json({
            status :0,
            message: 'please add user_device_token'

        })
    }
    else {
        User.find({user_email : req.body.user_email})
        .exec()
        .then(user =>{
            if(user.length<1){
                return res.status(400).send({
                    status: 0,
                    message : "user_email not found"
                })                                                 
            }
            else{
                bcrypt.compare(req.body.user_password, user[0].user_password, (err , result) =>{
                    if(err){
                        return res.status(400).send({
                            status : 0,
                            message: "Auth Failed"
                        })
                    }
                    if(result){
                        const token = jwt.sign(
                        {
                            user_email : user[0].user_email,
                            userId : user[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "24hr"
                        })
                        user[0].user_authentication = token
                        user[0].user_device_token = req.body.user_device_token,
                        user[0].userLocation.type ="Point",
                        user[0].userLocation.coordinates= [req.body.long, req.body.lat]
                        user[0].save()

                        return res.status(200).json({
                            status : 1,
                            message: "user logged in",
                            token: token,
                            data : user[0]


                        })
                        


                    }
                    return res.status(400).send({
                        status: 0, 
                        message: 'Incorrect user_password.'
                })
                 
                });
                
            }
        
        })
        .catch(err => {
            res.status(400).send({
                status : 0,
                message : err
            })
        })
    }
}


// social login
const socialLogin = async (req, res) => {
    try {
        const alreadyUserAsSocialToke = await User.findOne({ user_social_token: req.body.user_social_token })
        if (alreadyUserAsSocialToke) {
            if (alreadyUserAsSocialToke.user_type !== req.body.user_type) {
                return res.status(400).send({ status: 0, message: "Invalid User Type!" });
            }
        }
        if (!req.body.user_social_token) {
            return res.status(400).send({ status: 0, message: 'User Social Token field is required' });
        }
        else if (!req.body.user_social_type) {
            return res.status(400).send({ status: 0, message: 'User Social Type field is required' });
        }
        else if (!req.body.user_device_type) {
            return res.status(400).send({ status: 0, message: 'User Device Type field is required' });
        }
        else if (!req.body.user_device_token) {
            return res.status(400).send({ status: 0, message: 'User Device Token field is required' });
        }
        else {
            const checkUser = await User.findOne({ user_social_token: req.body.user_social_token });
            if (!checkUser) {
                if(req.file) {
                    profilePicture = req.file.path
                }
                const newRecord = new User();
                // if(req.file){
                //     newRecord.user_image    = req.file.path
                //  }profilePicture: req.file.path
                // const customer = await stripe.customers.create({
                //     description: 'New Customer Created',
                // });
                // newRecord.stripe_id = customer.id;
                // newRecord.user_image = req.body.user_image ? req.body.user_image : ""
                // newRecord.user_image = req.body.user_image
                    newRecord.profilePicture = (req.file ? req.file.path : req.body.profilePicture),
                    newRecord.user_social_token = req.body.user_social_token,///
                    newRecord.user_social_type = req.body.user_social_type,
                    newRecord.user_device_type = req.body.user_device_type,
                    newRecord.user_device_token = req.body.user_device_token
                
                    newRecord.user_email = req.body.user_email,
                    //newRecord.user_type = req.body.user_type,
                    newRecord.verified = 1
                await newRecord.generateAuthToken();
                const saveLogin = await newRecord.save();
                return res.
                status(200)
                .send({
                    status: 1,
                    message: 'Login Successfully',
                    data: saveLogin
                });
            } else {
                const token = await checkUser.generateAuthToken();
                const upatedRecord = await User.findOneAndUpdate(
                    { _id: checkUser._id },
                    {
                    user_device_type: req.body.user_device_type,
                    user_device_token: req.body.user_device_token,
                    verified: 1,
                    user_authentication : token
                    }
                    ,
                    { new: true });
                    
                return res
                .status(200)
                .json({
                     status: 1,
                     message: 'Login Successfully',
                     token: token,
                     data: upatedRecord
                    })
            }
        }
        
    }
    catch (error) {
        // console.log('error *** ', error);
        res.status(400).json({
            status: 0,
            message: error.message
        });
    }
}


// //verify User
// const verifyUser = async (req, res) => {
//   if (!req.body.user_id) {
//     res.status(400).send({
//       status: 0,
//       message: "User id field is required",
//     });
//   } else if (!req.body.verification_code) {
//     res.status(400).send({
//       status: 0,
//       message: "Verification code field is required",
//     });
//   } else {
//     User.find({ _id: req.body.user_id })
//       .exec()
//       .then((result) => {
//         if (!req.body.verification_code) {
//           res.status(400).send({
//             status: 0,
//             message: "Verification code is required.",
//           });
//         }

//         if (req.body.verification_code == result[0].code) {
//           User.findByIdAndUpdate(
//             req.body.user_id,
//             { verified: 1, code: null },{new:true},
//             (err, user) => {
//               if (err) {
//                 res.status(400).send({
//                   status: 0,
//                   message: "Something went wrong.",
//                 });
//               }
//               if (user) {
//                 const token = jwt.sign(
//                   {
//                     user_email : user[0].user_email,
//                     userId : user[0]._id
//                   },
//                   process.env.JWT_KEY,
//                   {
//                     expiresIn: "20hr",
//                   }
//                 );
//                 User.findOneAndUpdate({
//                   user_authentication: token,
//                   user_device_token: req.body.user_device_token,
//                 }).exec();
//                 //  console.log(user[0].user_authentication);
//                 user.user_authentication = token;
//                 user.save();
//                 return res.status(200).send({
//                   status: 1,
//                   message: "Otp matched successfully.",
//                   token: token,
//                 });
//                 // res.status(200).send({
//                 //     status: 1,
//                 //     message: 'Otp matched successfully.'
//                 // });
//               }
//             }
//           );
//         } else {
//           res.status(200).send({
//             status: 0,
//             message: "Verification code did not matched.",
//           });
//         }
//       })
//       .catch((err) => {
//         res.status(400).send({
//           status: 0,
//           message: "User not found",
//         });
//       });
//   }
// };

// verify user
const verifyUser = async (req, res) => {
    if(!req.body.user_id){
        res.status(400).send({
            status: 0, 
            message: 'User id filed is required' 
        });
    }
    else if(!req.body.verification_code){
        res.status(400).send({
            status: 0, 
            message: 'Verification code filed is required' 
        });
    }
    else{
        User.find({ _id: req.body.user_id })
        .exec()
        .then(result => {
            if(!req.body.verification_code){
                res.status(400).send({
                    status: 0, 
                    message: 'Verification code is required.' 
                });
            }
            // console.log(result)

            if(req.body.verification_code == result[0].code){

                User.findByIdAndUpdate(req.body.user_id, { verified: 1, code: null },{new : true}, (err, _result) => {
                    if(err){
                        res.status(400).send({
                            status: 0, 
                            message: 'Something went wrong.' 
                        });
                    }
                    // console.log(_result)
                    if(_result){
                        const token = jwt.sign(
                        {
                            user_email : _result.user_email,
                            userId : _result._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "24hr"
                        },{new : true})
                        User.findOneAndUpdate({
                            user_authentication: token,
                            user_device_token: req.body.user_device_token,
                        }).exec();
                        // console.log(user[0].user_authentication);
                        // user[0].user_authentication = token;
                        // user[0].save();
                        
                        // console.log("working")
                        return res.status(200).send({
                            status: 1,
                            message: "Otp matched successfully. Use logged in successfully",
                            token: token,
                            data : _result
                        });
                        
                    }
                });
            }
            else{
                res.status(400).send({
                    status: 0, 
                    message: 'Verification code did not matched.' 
                });
            }
        })
        .catch(err => {
            res.status(400).send({
                status: 0, 
                message: 'User not found' 
            });
        });
    }
}


/** Resend code */
const resendCode = async (req, res) => {
    if(!req.body.user_id){
        res.status(400).send({
            status: 0, 
            message: 'User id failed is required.' 
        });
    }
    else{
        User.find({ _id: req.body.user_id })
        .exec()
        .then(result => {
           // const verificationCode = Math.floor(100000 + Math.random() * 900000);
           const verificationCode = 123456;
    
            User.findByIdAndUpdate(req.body.user_id, { verified: 0, code: null }, (err, _result) => {
                if(err){
                    res.status(400).send({
                        status: 0, 
                        message: 'Something went wrong.' 
                    });
                }
                if(_result){
                    sendEmail(result[0].user_email, verificationCode, "Verification Code Resend");
                    res.status(200).send({
                        status: 1, 
                        message: 'Verification code resend successfully.' 
                    });
                }
            });
        })
        .catch(err => {
            res.status(400).send({
                status: 0, 
                message: 'User not found' 
            });
        });
    }
}

/** Forgot password */
const forgotPassword = async (req, res) => {
    if(!req.body.user_email){
        res.status(400).send({
            status: 0, 
            message: 'user_email filed is required' 
        });
    }
    else{
        User.find({ user_email: req.body.user_email })
        .exec()
        .then(user => {
            if(user.length < 1){
                return res.status(404).send({
                    status: 0, 
                    message: 'user_email not found!' 
                });
            }
            else{
               // const verificationCode = Math.floor(100000 + Math.random() * 900000);
               const verificationCode = 123456;

                User.findByIdAndUpdate(user[0]._id, { code: verificationCode }, (err, _result) => {
                    if(err){
                        res.status(400).send({
                            status: 0, 
                            message: 'Something went wrong.' 
                        });
                    }
                    if(_result){
                        sendEmail(user[0].user_email, verificationCode, 'Forgot Password');
                        res.status(200).send({
                            status: 1, 
                            message: 'Code successfully send to user_email.',
                            data: {
                                user_id: user[0]._id
                            }
                        });
                    }
                });
            }
        })
        .catch(err => {
            res.status(400).send({
                status: 0, 
                message: 'User not found' 
            });
        });
    }
}

//updatePassword password
const updatePassword = async (req, res) => {
    if(!req.body.user_id){
        res.status(400).send({
            status: 0, 
            message: 'User id filed is required.' 
        });
    }
    else if(!req.body.new_password){
        res.status(400).send({
            status: 0, 
            message: 'New password filed is required.' 
        });
    }
    else{
        User.find({ _id: req.body.user_id })
        .exec()
        .then(user => {

            bcrypt.hash(req.body.new_password, 10, (error, hash) => {
                if(error){
                    return res.status(400).send({
                        status: 0, 
                        message: error
                    });
                }
                else{
                    User.findByIdAndUpdate(req.body.user_id, { user_password: hash }, (err, _result) => {
                        if(err){
                            res.status(400).send({
                                status: 0, 
                                message: 'Something went wrong.' 
                            });
                        }
                        if(_result){
                            res.status(200).send({
                                status: 1, 
                                message: 'Password updated successfully.' 
                            });
                        }
                    });
                }
            });
        })
        .catch(err => {
            res.status(400).send({
                status: 0, 
                message: 'User not found.'
            });
        });
    }
}


// change password

const changePassword = async (req, res) => {
    try {
        if (!req.body.user_id) {
            res.send({ status: 0, message: 'User ID field is required' });
        }
        // else if (req.body.user_authentication.length === 0) {
        //     res.send({ status: 0, message: 'Authentication field is required' });
        // }
        else if (!req.body.old_password) {
            res.send({ status: 0, message: 'Old Password field is required' });
        }
        else if (!req.body.new_password) {
            res.send({ status: 0, message: 'New Password field is required' });
        }
        else {
            // const userFind = await User.findOne({ _id: req.body.user_id, user_authentication: req.body.user_authentication });
            const userFind = await User.findOne({ _id: req.body.user_id });
            if (userFind) {
                const oldPassword = await bcrypt.compare(req.body.old_password, userFind.user_password);
                if (userFind && oldPassword == true) {
                    const newPassword = await bcrypt.hash(req.body.new_password, 8);
                    await User.findOneAndUpdate({ _id: req.body.user_id }, { user_password: newPassword });
                    res.send({ status: 1, message: 'New password Updated Successfully.' });
                }
                else {
                    res.send({ status: 0, message: 'Password Not Match' });
                }
            } else {
                res.send({ status: 0, message: 'Something Went Wrong.' });
            }
        }
    }
    catch (error) {
        res.status(400).send({
            status: 0,
            message: error
        });
    }
}


//logout

const logout = async (req , res) =>{
    try {

        // if (!req.body._id) {
        //     res.status(400).send({ status: 0, message: 'User ID field is required' });
        // }
        // else if (!req.headers.authorization) {
        //     res.status(400).send({ status: 0, message: 'Authentication Field is required' });
        // }
            
            const updateUser = await User.findOneAndUpdate({ _id: req.body._id }, {
                user_authentication: null,
                user_device_type: null,
                user_device_token: null
            });
            res.status(200).send({ status: 1, message: 'User logout Successfully.' });

        
    } catch (e) {
        res.status(400).send(e.message);
    }
}


module.exports={
    register , login , socialLogin, verifyUser, resendCode , forgotPassword, updatePassword, changePassword , logout
}