const jwt = require('jsonwebtoken');
const User = require("../models/User");
const {error} = require('../utils/responseWrapper') ;

module.exports = async (req, res, next) => {
   if(!req.headers || 
     !req.headers.authorization || 
     !req.headers.authorization.startsWith("Bearer")
    ) {
        // return res.status(401).send(`Authorization header is required`);
        return res.send(error(401, "Authorization header is required"));
    }

    const accessToken = req.headers.authorization.split(" ")[1];
    console.log('this is the accessToken gauri', accessToken);
    try {
        const decoded = await jwt.verify(
            accessToken, 
            process.env.ACCESS_TOKEN_PRIVATE_KEY
        );

        req._id = decoded._id;
        console.log("this is the decoded id", decoded);
        const user = await User.findById(req._id);

        console.log("this isthe user", user);
        if(!user) {
            return res.send(error(404, 'user not found'));
        }
        console.log("we came upto this");
        next();
    } catch (e) {
        console.log('this is the error',e);
        // return res.status(401).send("Invalid access key");
        return res.send(error(401, "Invalid access key"));
    }
    
}