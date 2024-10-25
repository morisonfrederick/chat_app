// userController.ts
import { User } from '../Model/userModel';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET|| 'SOMESECRET'


async function postUser(req: Request, res: Response):Promise<void>{
    console.log('post user request recieved');
    
    try {
        const { username, email, password } = req.body;
        console.log(username,email,password);
        

        if (!username || !password || !email) {
             res.status(400).json({ message: 'All fields are required' });
             return;
        }

        const userExist = await User.findOne({ email });
        if (userExist) {
             res.status(400).json({ message: 'User with the same email exists' });
             return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        console.log(newUser);
        
         res.status(201).json({ message: 'User added successfully' });
         return;
    } catch (error) {
        console.error(error);
         res.status(500).json({ message: 'Internal server error' });
         return;
    }
}

async function postLogin(req:Request,res:Response):Promise<void> {
    console.log('login request recieved');
    
    try {
        let {email,password} = req.body;
        console.log(email, password);
        
        if(!email || !password ){
            res.status(400).json('all fields are required');
            return;
        }
    
        let user = await User.findOne({email});
        console.log(user);
        
        if(!user){
            res.status(400).json('no user found');
            return;
        }
        let validUser =await bcrypt.compare(password,user.password)
        if(!validUser){
            res.status(400).json('invalid credentials')
            return;
        }

        const token = jwt.sign({id:user._id,email:user.email},JWT_SECRET,{expiresIn:'1h'})
        res.status(200).json({message:'user logged in successful',token,user:{email:user.email,id:user._id,name:user.username}})
    } catch (error) {
        
    }
}

async function postLogout(req:Request,res:Response):Promise<void> {
    const  {token} = req.body;

}



export { postUser,postLogin };
