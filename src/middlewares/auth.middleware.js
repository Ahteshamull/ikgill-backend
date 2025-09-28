import {TokenDecode} from "../utils/tokenUtility.js";
export const authCheck=async (req,res,next)=>{

  // console.log(res.cookies.token)
  const token= req.cookies.token;
    const authHeader = req.headers.authorization; 

    console.log(authHeader)
    console.log(token)
  // if (!authHeader && !authHeader.startsWith("Bearer ") && !tokens) {
  //   return res.status(401).json({ message: "No token provided" });
  // }



 let decoded=TokenDecode(token);
  
    if(decoded===null){
        res.status(401).json({status:"fail",Message:"Unauthorized",token:token});
    }
    else{
        let user_id=decoded.id;
        req.headers.user_id=user_id;
        next();
    }
}