const mongoose = require('mongoose')


const notificationSchema = new mongoose.Schema({
    user_device_token:{
        type : String
    },
    title:{
        type : String
    },
    body:{
        type : String
    },
    notification_type : {
        type : String
    },
    sender_id:{
        type : String
    },
    sender_name : {
        type : String
    },
    sender_image:{
        type : String
    },
    receiver_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    date : {
        type : String
    }
},
{timestamps : true})

const Notification = mongoose.model("Notification", notificationSchema)

module.exports = Notification