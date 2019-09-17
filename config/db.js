const mongoose = require(`mongoose`);
require('dotenv').config();
// const config = require(`config`);
// const db = config.get(`mongoURI`);

// const mongoURI = "mongodb+srv://umrUser:Modb348%21@cluster0-o0eck.mongodb.net/test?retryWrites=true&w=majority";

const connectDB = async () => {
    try {

        // await mongoose.connect(db,
        await mongoose.connect(process.env.mongoURI, 
            { useNewUrlParser: true,
              userCreateIndex: true,
              useFindAndModify: false});
        console.log(`mongoDB connected!!`);
    }
    catch(err) {
        console.log("error connecting to mongoDB")
        console.error(err.message);
        process.exit(1)
    }
}

module.exports = connectDB;