require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const session =require('express-session');
const cookieParser = require('cookie-parser');
const nocache = require('nocache');
const path = require('path');


const app= express();

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');


const fileUpload = require('express-fileupload')

//register view engine
app.set('view engine','ejs');
mongoose.set('strictQuery',false);

mongoose
    .connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(()=>{
        console.log("connected to mongoDB");
    })
    .catch((err)=>{
        console.log("Error connecting to mongoDB: ",err);
    })

    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
        secure:true
    })

    //middleware
app.use(express.static('public'));
 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles : true,
    limits: {fileSize: 50 * 2024 * 1024}
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {sameSite: 'strict'},
    saveUninitialized: true,
    resave: false
}));
app.use(nocache());
// routes
app.use('/admin',adminRoutes);
app.use('/',userRoutes);

app.use((req, res, next) => {
    res.status(404).render('user/error404');
});


// start the app
app.listen(process.env.PORT,()=>{
    console.log(`http://localhost:${process.env.PORT}`)
});