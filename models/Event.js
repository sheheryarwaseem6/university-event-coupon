const mongoose = require ('mongoose')


const eventSchema= new mongoose.Schema({

    eventPictures :[],
    eventName : {
        type : String,
        default : null
    },
    eventDescription:{
        type: String,
        default : null

    },
    eventTime:{
        type : String,
        default : null
    },
    eventDate : {
        type : String,
        default: null
    },
    eventLocation: {
        location:{
            type : String,
            default : null
        },
        coordinates: {
            type: [Number],
            required: false
        }
    },
    
    favouriteEvents: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ]
},
{timestamps : true})

const Event = mongoose.model('Event', eventSchema)

module.exports = Event