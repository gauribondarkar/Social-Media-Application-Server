const User = require('../models/User');
const bcrypt = require('bcrypt'); //to hash the password
const jwt = require('jsonwebtoken');
const {error, success} = require("../utils/responseWrapper");
// signup controller

const signupController = async (req, res) => {
   try {
        const {email, password, name} = req.body;
        if(!email || !password || !name){
            // return res.status(400).send("all fields are required");
            return res.send(error(400, "all fields are required"));
        }

        const oldUser = await User.findOne({email});
        if(oldUser) {
            // return res.status(409).send("this email Id already exists");
            return res.send(error(409, "this email Id already exists"));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })


        return res.send(
            success(201, 'user created successfully')
        )
   } catch (e) {
        return res.send(error(500, e.message));
   } 
}


// login controller

const loginController = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            // return res.status(400).send("all fields are required");
            return res.send(error(400, "all fields are required"));
        }

        const user = await User.findOne({email}).select('+password');
        
        if(!user) {
            // return res.status(404).send("user does not exists");
            return res.send(error(404, "user does not exists"));
        }

        //password matching
        const matched = await bcrypt.compare(password, user.password);
        if(!matched) {
            // return res.status(403).send("incorrect password");
            return res.send(error(403, "incorrect password"));
        }

        
        const accessToken = generateAccessToken({
            _id: user._id, 
        });

        
        const refreshToken = generateRefreshToken({
            _id: user._id, 
        });

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true
        })

       
        // return res.json({accessToken});
        return res.send(success(200, {
            accessToken
        }))
    } catch (e) {
        return res.send(error(500, e.message));
   }
};

//this api will check the refresh token validity and generate a new access token 
const refreshAccessTokenController = async(req, res) => {
    const cookies = req.cookies;
    if(!cookies.jwt) {
        // return res.status(401).send("refresh token is required");
        return res.send(error(401, "refresh token is required"));
    }

    const refreshToken = cookies.jwt;
    console.log('refresh', refreshToken);
    try {
        const decoded = await jwt.verify(
            refreshToken, 
            process.env.REFRESH_TOKEN_PRIVATE_KEY
        );

        const _id = decoded._id;
        const accessToken = generateAccessToken({_id});

        // return res.status(201).json({accessToken});
        return res.send(success(201, {
            accessToken
        }))
    } catch (e) {
        console.log(e);
        // return res.status(401).send("Invalid refresh key");
        return res.send(error(401, "Invalid refresh key"));
    }
}


const logoutController = async (req, res) => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true
        })

        return res.send(success(200, 'user logged out'));
    } catch (error) {
        return res.send(error(500, e.message));
    }
}


//internal functions
const generateAccessToken = (data) => {
    try {
       
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
            expiresIn: "1d"
        });
        console.log(token);
        return token;
    } catch (e) {
        console.log(e);
    }
    
}


const generateRefreshToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
            expiresIn: "1y"
        });
        console.log(token);
        return token;
    } catch (e) {
        console.log(e);
    }
    
}

module.exports = {
    signupController,
    loginController,
    refreshAccessTokenController,
    logoutController
}