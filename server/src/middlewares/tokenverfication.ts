import { NextFunction, Request, Response } from "express";
import jwt, {JwtPayload} from 'jsonwebtoken';

interface CustomRequset extends Request {
        user?:string|JwtPayload
}

const  JWT_SECRET = process.env.JWT_SECRET as string
const verifyToken = (req:CustomRequset,res:Response,next:NextFunction)=>{
        
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if(!token){
            res.status(400).json({message:'access token is missing'});
            return;
        }

        try {
            const decoded = jwt.verify(token,JWT_SECRET);
            
            req.user = decoded;
            next()
        } catch (error) {
            console.log(error);
            
        }

}
export default verifyToken