const Favourite = require('../models/Favourite')
const Event = require('../models/Event')

// add and delete favourites

const favourite = async (req, res) => {
    try {
        if (!req.body.eventId) {
            return res.status(400).send({
                status: 0,
                message: "Product ID is required"
            })
        }
        else {
            // const findProducts = await Favourite.find({ })
            // console.log(findProducts)
            // if (findProducts.length >= 1) {
            //     // console.log(findCatogory)
            //     return res.status(400).send({
            //         status: 0,
            //         message: "Product Already Exists"
            //     })
            // }
            // const findfvrt = await Favourite.find({ userId: req.user._id, eventId: req.body.eventId })
            const findfvrt = await Favourite.find({ userId: req.user._id, eventId: req.body.eventId })
            console.log(findfvrt)
            if (findfvrt.length > 0) {
                const delfvrt = await Favourite.findOneAndDelete({ userId: req.user._id })
                const favDelEvent = await Event.findOneAndUpdate({
                    _id: req.body.eventId
                },{$pull:{favouriteEvents:{userId: req.user._id}}},{new : true})
                if (delfvrt) {
                    res.status(200).send({
                        status: 1,
                        message: "Favourite deleted"
                    })
                }
                else {
                    return res.status(400).send({
                        status: 0,
                        message: "fvrt not del"
                    })
                }
            }
            else {
                const favourites = await Favourite.create({
                    userId: req.user._id, eventId: req.body.eventId,
                })
                const favEvent = await Event.findOneAndUpdate({
                    _id: req.body.eventId
                },{$push:{favouriteEvents:{userId: req.user._id}}},{new : true})
                if (favourites) {
                    res.status(200).send({
                        status: 1,
                        message: "Add to Favourites"
                    })
                }
                else {
                    return res.status(400).send({
                        status: 0,
                        message: "Something went wrong 2"
                    })
                }
            }
        }
    }
    catch (error) {
        return res.status(400).send({
            status: 0,
            message: error
        })
    }
}

//get all favourites


const favouriteEvents = async (req, res) => {
    try {
        console.log("1")
        const favourites = await Favourite.find({ userId: req.user._id }).populate({
            path: "eventId",
            model: "Event",
            select:"eventName , eventTime , eventLocation.location , eventPictures"
            
        })
        return res.status(200).send({
            status: 1,
            message: "success",
            favourites
        })
    } catch (error) {
        console.log("2")
        return res.status(400).json(error.message)
    }
}

module.exports = {
    favourite,
    favouriteEvents
}