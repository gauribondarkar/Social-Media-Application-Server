const mongoose = require('mongoose');

module.exports = async() =>{
    const mongoUri = "mongodb+srv://gauribo17:AjeDpRrL3XzOFb21@cluster0.sllhfkk.mongodb.net/?retryWrites=true&w=majority";
    try {
        const connect = await mongoose.connect(mongoUri, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });

        console.log(`mongodb connected: ${connect.connection.host}`)
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
    
}