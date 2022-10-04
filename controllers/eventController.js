const Event = require('../models/Event')
const User = require('../models/User')
const moment = require('moment')




const addEvent = async (req, res) => {
    try {
        if (!req.body.eventName) {
            return res.status(400).json({
                status: 0,
                message: "Event Name is Required"
            })
        }
        if (!req.body.eventDescription) {
            return res.status(400).json({
                status: 0,
                message: "Event Description is Required"
            })
        }
        if (!req.body.eventTime) {
            return res.status(400).json({
                status: 0,
                message: "Event Time is Required"
            })
        }
        if (!req.body.eventDate) {
            return res.status(400).json({
                status: 0,
                message: "Event Date is Required"
            })
        }
        if (!req.body.location) {
            return res.status(400).json({
                status: 0,
                message: "Event Location is Required"
            })
        }
        else {
            // console.log(req.body)
            var files = [];
            if (req.files !== undefined) {
                for (let i = 0; i < req.files.length; i++) {
                    files.push(req.files[i].path);
                }
            }
            else {
                files = []
            }



            if (req.files) {
                eventPicture = req.files.path;
                // console.log(eventPicture);
            }
            const date = moment(req.body.eventDate).format("YYYY-MM-DD");
            const time = moment(req.body.eventTime, [moment.ISO_8601, 'hh:mm']).format("hh:mm a");

            const event = new Event()
            event.eventName = req.body.eventName
            event.eventDescription = req.body.eventDescription
            event.eventDate = date
            event.eventTime = time
            event.eventPictures = files
            event.eventLocation.location = req.body.location
            event.eventLocation.coordinates = [req.body.latitude, req.body.longitude]
            // "location.type": "Point", "location.coordinates": [long, lat]
            // event.eventLocation.location = req.body.location
            // event.eventLocation.latitude = req.body.latitude
            // event.eventLocation.longitude = req.body.longitude

            const addEvent = await event.save()

            if (addEvent) {
                return res.status(200).json({
                    status: 1,
                    message: "Event Added succesfully"
                })
            }
            else {
                return res.status(400).json({
                    message: 'event didnt added'
                });
            }

        }

    } catch (error) {
        return res.status(400).json({
            status: 0,
            message: error.message
        })
    }
}

const getEvents = async(req, res) =>{
    try{
        const currentEvent = await Event.find({
            eventDate : moment(Date.now()).format("YYYY-MM-DD")
        })
        const upcomingEvent = await Event.find({
            eventDate : {$gt : moment(Date.now()).format("YYYY-MM-DD")}
        })
        
        if(!currentEvent || !upcomingEvent ){
            return res.status(200).json({
                status : 1,
                message : "No Events Found"
            })
        }
        else{
            return res.status(200).json({
                status: 1,
                currentEvent,
                upcomingEvent

            })
        }

    }catch(error){
        return res.status(400).json({
            status : 0,
            message: error.message
        })
    }  
}


const getPreviousEvents = async (req , res) =>{
    try {
        const fav = await User.findOneAndUpdate({
            _id : req.user._id
        },{is_favourite : req.body.fav}, {new : true})
        if(fav.is_favourite === 0){
            const newDate = moment(Date.now()).format("YYYY-MM-DD")

        // console.log(newDate)

        const Events = await Event.find({
            eventDate: {$lt: newDate}
        })
        if(Events){
            return res.status(200).json({
                status : 1,
                message : "Previous Events",
                Events
            })
        }
        else{
            return res.status(200).json({
                status : 1,
                message : "No previous Events"
            })
        }
        }
        else{
            const newDate = moment(Date.now()).format("YYYY-MM-DD")

        // console.log(newDate)

        const Events = await Event.find({
            eventDate: {$lt: newDate},
            "favouriteEvents.userId": req.user._id
        })
        if(Events.length < 1){
            return res.status(200).json({
                status : 1,
                message : "No previous Events"
            })
        }
        else{
            return res.status(200).json({
                status : 1,
                message : "Previous Events",
                Events
            })
            
        }
        }
        

    }catch(error){
        return res.status(400).json({
            status: 0,
            message : error.message
        })
    }
}

const getUpcomingEvents = async (req, res) => {
    try{
        
        const fav = await User.findOneAndUpdate({
            _id : req.user._id
        },{is_favourite : req.body.fav}, {new : true})
        if(fav.is_favourite === 0){
            const newDate = moment(Date.now()).format("YYYY-MM-DD")
            
            const Events = await Event.find({
            eventDate : {$gt : moment(Date.now()).format("YYYY-MM-DD")}
            })
            if(!Events){
                return res.status(200).json({
                    status : 1,
                    message : "No Upcoming Events"
                })
            }
            else{
                return res.status(200).json({
                    status : 1,
                    message : "up comming events",
                    Events
                })
            }
        }
        else{
            const newDate = moment(Date.now()).format("YYYY-MM-DD")

        // console.log(newDate)

        const Events = await Event.find({
            eventDate: {$gt : moment(Date.now()).format("YYYY-MM-DD")},
            "favouriteEvents.userId": req.user._id
        })
        if(Events.length < 1){
            return res.status(200).json({
                status : 1,
                message : "No Upcoming Events"
            })
        }
        else{
            return res.status(200).json({
                status : 1,
                message : "Upcoming Events",
                Events
            })
            
        }
        }

        

    }catch(error) {
        return res.status(400).json({
            status : 0,
            message : error.message
        })
    }
}

const getCurrentEvents = async(req, res) =>{
    try{
        const Events = await Event.find({
        eventDate : moment(Date.now()).format("YYYY-MM-DD")
        })
        if(!Events){
            return res.status(200).json({
                status : 1,
                message : "No Current Events"
            })
        }
        else{
            return res.status(200).json({
                status : 1,
                message : "Current Events",
                Events
            })
        }

    }catch(error){
        return res.status(400).json({
            status : 0,
            message : error.message
        })
    }
}

const getEvent = async (req,res)=>{
    try{
        const event = await Event.findById(req.body._id)
        
        return res.status(200).json(event);
    }catch(err){
        res.status(500).json({error:err.message});
    }
}


module.exports = { addEvent , getEvents, getPreviousEvents , getUpcomingEvents , getCurrentEvents ,getEvent}