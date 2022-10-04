
const mongoose = require ('mongoose');
const jwt = require('jsonwebtoken')

const adminSchema = new mongoose.Schema({
    admin_name:{
        type : String
    },
    admin_email:{
        type: String
    },
    admin_password:{
        type : String
    },
    admin_auth:{
        type : String
    },
    adminPicture:{
        type: String,
        default : null
    }

}, {
    timestamps: true
})

adminSchema.methods.generateAuthToken = async function () {
    const admin = this;
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_KEY);
    // user.user_authentication = token;
    await admin.save();
    //console.log("tokeeen--->", token);
    return token;
}


const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin