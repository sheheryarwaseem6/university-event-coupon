const router = require('express').Router()
// const {verifyAdmin} = require('../middleware/authenticate')
const {registerAdmin, loginAdmin} = require('../controllers/adminController')
const {addEvent} = require('../controllers/eventController')
const { upload } = require('../middleware/multer')

//admin routes

router.post('/registerAdmin', upload.single('adminPicture'), registerAdmin)
router.post('/loginAdmin', loginAdmin)


//event routes
router.post('/addEvent', upload.array('eventPictures' , 12), addEvent)



module.exports = router;