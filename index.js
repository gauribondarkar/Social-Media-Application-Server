const  express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv').config('./env');
const dbConnect = require("./dbConnect");
const authRouter = require('./routers/authRouter');
const postsRouter = require('./routers/postsRouter');
const userRouter = require('./routers/userRouter')
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

const app = express();

// middlewares
app.use(express.json({limit: '10mb'})); // to parse the body
app.use(morgan("common")); // to let us know which api we hit
app.use(cookieParser()); //as we storing refresh token inside cookie
app.use(cors({
    credentials: true,
    origin:"https://letssocialize.onrender.com"
}))

app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use("/user", userRouter);

app.get('/' , (req, res) =>{
    res.status(200).send("ok from server");
})
const PORT = process.env.PORT || 5001;

// db connection
dbConnect();

app.listen(PORT, () =>{
    console.log(`listening on Port: ${PORT}`)
})
