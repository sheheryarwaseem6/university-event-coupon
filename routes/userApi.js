const router = require('express').Router()
const { verifyToken } = require('../middleware/authenticate')
const { getContent } = require('../controllers/commonController')
const {register , login, socialLogin, verifyUser, resendCode, forgotPassword, updatePassword, changePassword, logout } = require('../controllers/authController')
const {getProfile , updateProfile} = require('../controllers/userController')
const {favourite, favouriteEvents} = require('../controllers/favouriteController')
const {getEvents , getEvent , getPreviousEvents , getUpcomingEvents ,getCurrentEvents} = require('../controllers/eventController')
const { upload } = require('../middleware/multer')



/** Content */
router.get('/get-content/:type', getContent);

// user routes 

router.get('/user',verifyToken, getProfile);
router.put('/updateProfile', verifyToken, upload.single('profilePicture'), updateProfile)


router.post('/register', upload.single('profilePicture'), register)
router.post('/login', login)
router.post('/social-login', upload.single('profilePicture'), socialLogin)
router.post('/verify-user', verifyUser);
router.post('/resend-code', resendCode);
router.post('/forgot-password', forgotPassword);
router.post('/update-password', updatePassword);
router.put('/change-password',verifyToken, changePassword);
router.post('/logout', verifyToken , logout)


//event routes
router.get('/getEvents' ,verifyToken, getEvents)
router.get('/getEvent' ,verifyToken, getEvent)
router.get('/getPreviousEvents' ,verifyToken, getPreviousEvents)
router.get('/getUpcomingEvents' ,verifyToken, getUpcomingEvents)
router.get('/getCurrentEvents' ,verifyToken, getCurrentEvents)


//favourite
router.post('/favourite' ,verifyToken, favourite)
router.get('/getFavourite' ,verifyToken, favouriteEvents)






module.exports = router