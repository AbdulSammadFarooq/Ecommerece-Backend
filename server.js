// npm modules
const express = require("express");
require('dotenv').config();
const app = express()
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary")
const fileUpload = require("express-fileupload")
const cors = require('cors');
app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true
}));
app.use(cors());


// user modules
const connectDB = require("./DB/connection")

// database connection
connectDB()

// import all routes
const products = require("./routes/routes")
const users = require("./routes/routes")
const orders = require("./routes/routes")

// middleware
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload())


// settting up cloudninary config
 cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


app.use('/api/v1', users)
app.use('/api/v1/', products)
app.use('/api/v1/', orders)


const port = process.env.PORT || 4000

app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${port} in ${process.env.NODE_ENV} mode`)
})