import {JWT_EXPIRE_TIME,JWT_KEY, JWT_KEY_ADMIN} from "../config/token.config.js";
import jwt from "jsonwebtoken";
export const TokenEncode=(email,user_id)=>{
    const KEY=JWT_KEY;
    const EXPIRE={"expiresIn":JWT_EXPIRE_TIME};
    const PAYLOAD={email:email,user_id:user_id}
    return jwt.sign(PAYLOAD,KEY,EXPIRE);
}
export const TokenDecode=(token)=>{
    try{
        console.log(token ,"from decode")
        const KEY=JWT_KEY;
        return jwt.verify(token,KEY)
    }
    catch{
        return null;
    }

}



export const TokenEncodeForAdmin=(email,user_id)=>{
    const KEY=JWT_KEY_ADMIN;
    const EXPIRE={"expiresIn":JWT_EXPIRE_TIME};
    const PAYLOAD={email:email,user_id:user_id}
    return jwt.sign(PAYLOAD,KEY,EXPIRE);
}



export const TokenDecodeForAdmin=(token)=>{
    try{
        console.log(token ,"from decode")
        const KEY=JWT_KEY_ADMIN;
        return jwt.verify(token,KEY)
    }
    catch{
        return null;
    }

}
