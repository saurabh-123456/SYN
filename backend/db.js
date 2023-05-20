const mongoose  = require('mongoose');

const mongoURI = "mongodb://localhost:27017/syn";

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("connected to mongo succesfully");
    })
}

module.exports = connectToMongo;