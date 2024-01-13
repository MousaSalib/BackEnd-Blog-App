const mongoose = require("mongoose")
module.exports = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected")
    }catch (error) {
        console.log("Connected to DB failed", error)
    }
}