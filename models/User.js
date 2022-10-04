const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({

    user_name :{
        type : String
    },
    user_email : {
        type: String
    },
    user_password:{
        type: String        
    },

    profilePicture:{
        type: String,
        default: null
    },
    program:{
        type : String,
        default : null
    },
    address:{
        type: String,
        default : null
    },
    bio:{
        type: String,
        default : null
    },
    code: {
        type: Number,
        default: null
    },
    verified: {
        type: Number,
        default: 0
    },
    is_favourite:{
      type: Number,
      default: 0,
    },
    is_notification: {
      type: Number,
      default: 1,
    },
    is_blocked: {
      type: Number,
      default: 0,
    },

    user_authentication:{   
        type: String,
        default: null
    },
    user_social_token :{
        type : String,
        default: null
    },
    user_social_type:{
        type : String,
        default: null
    },
    user_device_type:{
        type : String,
        default: null
    },
    user_device_token:{
        type : String,
        default: null
    },
    userLocation: {
      location: {
        type: String,
        default: null,
      },
      type: {
        type: String,
        enum: ["Point"],
        required: false,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    }
},
{timestamps : true})

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_KEY);
    // user.user_authentication = token;
    await user.save();
    //console.log("tokeeen--->", token);
    return token;
}


const User = mongoose.model('User', userSchema)

module.exports = User