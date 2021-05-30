const jwt = require ("jsonwebtoken");
const User = require("../model/user");

const auth = async (req,res,next)=>{
 try {
     const token = await req.cookies.jwt;
    //  console.log(token);
     const verifyUser = await jwt.verify(token,process.env.SECRET_KEY);
    //  console.log(verifyUser);
     const user = await User.findOne({_id:verifyUser._id});
    //  console.log(`user`+user.phone);

    req.token = token;
    req.user = user;


     next();
 } catch (error) {
    res.status(401).redirect("login");

    //  res.status(401).send("<h1>Please login/register.</h1>");
 }
}

module.exports = auth;