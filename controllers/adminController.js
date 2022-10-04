const bcrypt = require('bcrypt');
const { hash } = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

//register admin
const registerAdmin = async(req,res) =>{
    try{
        if(!req.body.admin_name){
            return res.status(400).json({
                status :0,
                message: 'please enter admin name'

            })
        }
        if(!req.body.admin_email){
            return res.status(400).json({
                status :0,
                message: 'please enter admin_email'

            })
        }
        if(!req.body.admin_password){
            return res.status(400).json({
                status :0,
                message: 'please enter admin_password'

            })
        }
        
        else{
            Admin.find({admin_email: req.body.admin_email})
            .exec()
            .then(admin =>{
                if(admin.length >= 1){
                    res.status(400).json({
                        status:0,
                        message : "admin email already exist"
                    })
                }
                else{
                    bcrypt.hash(req.body.admin_password,10, (err, hash)=>{
                        if(err){
                            res.status(400).json({
                                status: 0, 
                                message: err.message
                            });
                        }
                        else{
                            if(req.file){
                                adminPicture = req.file.path
                            } 

                            // const verificationCode = Math.floor(10000 + Math.random() * 900000)
                            const verificationCode = 123456;

                            const admin = new Admin({
                            admin_name : req.body.admin_name,
                            admin_email : req.body.admin_email,
                            admin_password : hash,
                          
                            adminPicture: (req.file ? req.file.path : req.body.adminPicture),
                            code : verificationCode
                             })
                            admin.save()
                            .then(result =>{
                                // sendEmail(admin.admin_email, verificationCode, "admin email Verification")
                                return res.status(200).json({
                                    status: 1, 
                                    message: 'admin registered successfully.',
                                    data: {
                                       admin_id: result._id
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

// login admin

const loginAdmin = async (req , res )=>{
    if(!req.body.admin_email){
        return res.status(400).send({
            status : 0,
            message: "admin email field is required"
        })
    }
    else if(!req.body.admin_password){
        return res.status(400).send({
            status : 0,
            message : "admin password field is required"
        })

    }
    else {
        Admin.find({admin_email : req.body.admin_email})
        .exec()
        .then(admin =>{
            if(admin.length<1){
                return res.status(400).send({
                    status: 0,
                    message : "admin email not found"
                })                                                 
            }
            else{
                bcrypt.compare(req.body.admin_password, admin[0].admin_password, (err , result) =>{
                    if(err){
                        return res.status(400).send({
                            status : 0,
                            message: "Auth Failed"
                        })
                    }
                    if(result){
                        const token = jwt.sign(
                        {
                            admin_email : admin[0].admin_email,
                            adminId : admin[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "24hr"
                        })
                        admin[0].admin_authentication = token
                        admin[0].save()

                        return res.status(200).json({
                            status : 1,
                            message: "admin logged in",
                            token: token,
                            data : admin[0]


                        })
                        


                    }
                    return res.status(400).send({
                        status: 0, 
                        message: 'Incorrect admin password.'
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

module.exports = {registerAdmin , loginAdmin}