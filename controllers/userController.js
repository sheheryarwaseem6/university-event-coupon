const User = require('../models/User');


const getProfile = async (req,res)=>{
    try{
        const user = await User.findById(req.user._id).select('-password');
        
        return res.status(200).json(user);
    }catch(err){
        res.status(500).json({error:err.message});
    }
}

const updateProfile = async(req, res) =>{
    try{
        const user = await User.findByIdAndUpdate({_id: req.user._id},{user_name: req.body.user_name,  profilePicture: req.file ? req.file.path : req.body.profilePicture, user_email : req.body.user_email, program : req.body.progam, address : req.body.address, bio : req.body.bio}, {new:true});
        // const { user_name , user_email , number, profilePicture } = req.body ;
        // if ( user_name ) {
        // user.user_name = user_name ;
        // }
        // if ( user_email ) {
        // user.user_email = user_email ;
        // }
        // if ( number ) {
        // user.number = number ;
        // }
        // if (req.file) {
        //     profilePicture = req.file.path;
        // }
        // User Avatar : TODO
        // await user.save ( ) ;

        return res.status(200).send({
            status : 1,
            message: "profile updated",
            user
        })
    }
    catch (error) {
    return res.status(500).json({
    status : 0 ,
    message : error.message ,
    } ) ;
    }
}

module.exports={getProfile ,updateProfile}