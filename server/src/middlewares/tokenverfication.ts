import { NextFunction, Request, Response } from "express";
import jwt, {JwtPayload} from 'jsonwebtoken';

interface CustomRequset extends Request {
        user?:string|JwtPayload
}

const  JWT_SECRET = process.env.JWT_SECRET as string
const verifyToken = (req:CustomRequset,res:Response,next:NextFunction)=>{
        console.log('jwt secret is ; ',JWT_SECRET);
        
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if(!token){
            res.status(400).json({message:'access token is missing'});
            return;
        }

        try {
            const decoded = jwt.verify(token,JWT_SECRET);
            console.log('this is decoded user from the token: ',decoded);
            
            req.user = decoded;
            next()
        } catch (error) {
            console.log(error);
            
        }

}
export default verifyToken