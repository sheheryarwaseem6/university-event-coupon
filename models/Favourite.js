const mongoose = require ('mongoose')

const favouriteSchema = new mongoose.Schema({

    eventId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Event'
    },
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'

    }
})

const Favourite = mongoose.model('Favourite', favouriteSchema)

module.exports = Favourite