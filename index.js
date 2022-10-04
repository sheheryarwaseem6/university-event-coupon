const express = require('express')
const dotenv = require('dotenv').config()
const mongoose = require('mongoose')
const http = require('http');
const Chat = require('./models/Chat');
var fs = require('fs');
const apiRoutes = require('./routes/userApi')
const AdminRoutes = require('./routes/adminApi')
const User = require('./models/User')
const Notification = require('./models/Notification')
const moment = require('moment')

const app = express()
// const server = http.createServer(app);

// sockit
const options = {
    key: fs.readFileSync('/home/serverappsstagin/ssl/keys/c2a88_d6811_bbf1ed8bd69b57e3fcff0d319a045afc.key'),
    cert: fs.readFileSync('/home/serverappsstagin/ssl/certs/server_appsstaging_com_c2a88_d6811_1665532799_3003642ca1474f02c7d597d2e7a0cf9b.crt'),
};
const server =  require('https').createServer(options,app);
const {
    get_messages,
    send_message
} = require('./config/messages');

var io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: false,
        transports: ['websocket', 'polling'],
        allowEIO3: true
    },
});

     
const bodyParser = require('body-parser')
const Content = require('./models/Content');
const cors = require('cors')

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.use('/api', apiRoutes)
app.use('/admin', AdminRoutes)

//Multer file upload
app.use('/uploads', express.static('uploads')); 


/** Content seeder */
const contentSeeder = [
    {
        title: "Privacy Policy",
        content: "This is privacy policy.",
        type: "privacy_policy"
    },
    {
        title: "Terms and Conditions",
        content: "This is terms and conditions.",
        type: "terms_and_conditions"
    }
];
const dbSeed = async () => {
    await Content.deleteMany({});
    await Content.insertMany(contentSeeder);
}
dbSeed().then( () => {
    // mongoose.connection.close();
})

// Run when client connects
io.on('connection', socket => {
    console.log("socket connection " + socket.id);
    socket.on('get_messages', function(object) {
        var user_room = "user_" + object.sender_id;
        socket.join(user_room);
        get_messages(object, function(response) {
            if (response.length > 0) {
                console.log("get_messages has been successfully executed...");
                io.to(user_room).emit('response', { object_type: "get_messages", data: response });
            } else {
                console.log("get_messages has been failed...");
                io.to(user_room).emit('error', { object_type: "get_messages", message: "There is some problem in get_messages..." });
            }
        });
    });
    // SEND MESSAGE EMIT
    socket.on('send_message',async function(object) {
        // notification start //
    const receiver_object = await User.find({
        _id: object.receiver_id,
      });
      const sender_object = await User.find({
        _id: object.sender_id,
      });
      console.log("sender_object:", sender_object);
      let receiver_device_token = "";
      let receiver_name = "";
      let is_notification_reciever = " ";
      for (let i = 0; i < receiver_object.length; i++) {
        receiver_device_token = receiver_object[i].user_device_token;
        receiver_name = receiver_object[i].userName;
        is_notification_reciever = receiver_object[i].is_notification;
      }
      let sender_device_token = "";
      let sender_name = "";
      let sender_image = "";
      // let sender_id = "";
      for (let i = 0; i < sender_object.length; i++) {
        sender_device_token = sender_object[i].user_device_token;
        sender_name = sender_object[i].userName;
        sender_image = sender_object[i].profilePicture;
        // sender_id = sender_object[i]._id;
      }
      // console.log("sender_name:", sender_name);
      const notification_obj_receiver =  {
        user_device_token: receiver_device_token,
        title: receiver_name,
        body: `${sender_name} has send you a message.`,
        notification_type: "msg_notify",
        vibrate: 1,
        sound: 1,
        sender_id: object.sender_id,
        sender_name: sender_name,
        sender_image: sender_image,
      };
      // console.log("notification_obj_receiver:", notification_obj_receiver);
      // is_notification_reciever == "true"
      //  console.log("reciever_notificatrion:", is_notification_reciever);
      if (is_notification_reciever == 1) {
        push_notifications(notification_obj_receiver);
      }
      const notification = new Notification({
        user_device_token: notification_obj_receiver.user_device_token,
        title: notification_obj_receiver.title,
        body: notification_obj_receiver.body,
        notification_type: notification_obj_receiver.notification_type,
        sender_id: notification_obj_receiver.sender_id,
        sender_name: notification_obj_receiver.sender_name,
        sender_image: notification_obj_receiver.sender_image,
        receiver_id: notification_obj_receiver.receiver_id,
        date: moment(new Date()).format("YYYY-MM-DD"),
      });

       await notification.save();
      // notification end //
  
  
  
  
  
  
  
  
        var sender_room = "user_" + object.sender_id;
        var receiver_room = "user_" + object.receiver_id;
        send_message(object, function(response_obj) {
            if (response_obj) {
                console.log("send_message has been successfully executed...");
                io.to(sender_room).to(receiver_room).emit('response', { object_type: "get_message", data: response_obj });
            } else {
                console.log("send_message has been failed...");
                io.to(sender_room).to(receiver_room).emit('error', { object_type: "get_message", message: "There is some problem in get_message..." });
            }
        });
    });
});


const PORT =process.env.PORT 


// const adminRoutes = require('./routes/adminApi')


mongoose.connect(
    process.env.DB_CONNECT,{
        useUnifiedTopology :true,
        useNewUrlParser : true
    }, () => console.log('Database Connected')
)

server.listen(PORT, ()=> console.log(`server is running on ${PORT} port.`))