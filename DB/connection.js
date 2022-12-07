const mongoose = require("mongoose")

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.LIVE_DB,{
            useNewUrlParser:true,
        })
        console.log('MongoDB connection is established successfully!');
    }
    catch(error){
        console.log(error)
        console.log(`MongoDB connection error`);
    }
}
module.exports=connectDB