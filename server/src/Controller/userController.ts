// userController.ts
import { User,Iuser } from '../Model/userModel';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt,{JwtPayload} from 'jsonwebtoken';
import { friendRequestArray } from '../types/types';

interface CustomRequset extends Request {
    user?:{
        id:string,
        email:string
    }
}

const JWT_SECRET = process.env.JWT_SECRET as string


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
        console.log(JWT_SECRET);
        
    
    
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
//function to search friends 
async function findFrinds(req:Request,res:Response):Promise<void> {

    try {
        console.log('find function is called');
        
        const {search} = req.body;
        const user = search 
        ? await User.find({ username: { $regex: search, $options: 'i' } })
        : await User.find();
        
        res.status(200).json(user)
    } catch (error) {
        console.log(error);
        res.status(500).json('an error occured while searching for friends')
        
    }

}

async function sendfriendRequset(req:Request,res:Response) {
    try {
        console.log('trying to send friend request');
        
        //destructure and validate input
        const {friendId ,userString} = req.body;
        
        if(!friendId||!userString){
            res.status(400).json({error:'user id of both user and friend is required'});
            return;
        }
        //parse the userString
        const userObject = JSON.parse(userString)

        //find and validate the user and friend
        const user = await User.findById(userObject.id) as Iuser;
        const friend = await User.findById(friendId)
        if(!user||!friend){
            res.status(400).json('user or friend  not found')
            return;
        }
        
            //checking friend request is exist in the friend request array
        if(friend.friendRequests.includes(friendId)){
            res.status(400).json({error:'Friend request already send'})
            return;
        }

        //add user id to the friend request list and save
        friend.friendRequests.push(userObject.id)
        await friend.save()
        
        //send success response
        res.status(200).json({message:'user request send successfully'})
        return;
        
    } catch (error) {
      console.log(error);
        
    }
}

// function to display friend requests recieved from friends
async function getFrendRequset(req:Request,res:Response){
    console.log('get friend request is called');
    
 
    try {
            //destructure and validate input
        const id = req.query.id

        if(!id){
            res.status(400).json({error:'user id is required'})
            return;
        }

            //get the user and friend request array and validate 
        const user =await User.findById(id);
        

        if(!user){
            res.status(400).json({error:'no user found for the id provided'})
            return;
        }
        if(!user?.friendRequests.length){
            res.status(200).json({message:'no friend request available'})
            return;
        }

        if(user?.friendRequests?.length){
            

            //retrieve all friends request from the friends array 
            let friendsArray = await Promise.all(
                user.friendRequests.map(async(id:string)=>{
                    let friend = await User.findById(id)
                    return friend;
                })
            )
            
            
            res.status(200).json({data:friendsArray})
            return;
        }
    res.status(400).json({error:'some error happend'})
        
    } catch (error) {
        console.log(error);
        
    }

    
}
//function to accept or reject the friend request
async function manageFriendRequest(req:Request,res:Response) {
    try {
        console.log('manage friend request is called');
        
            // destructuring the friend id and the user id and validating
        const {friendId,userId,option} = req.body
        console.log('friend id is : ',friendId);
        console.log('user id is : ',userId);
        
        


        if(!friendId||!userId){
            res.status(400).json('frindId and/or userID is missing')
            return;
        }
        const user = await User.findById(userId)
        const friend = await User.findById(friendId)

        if(!user||!friend){
            res.status(400).json('this user is no longer available')
            return;
        }

        // handle the rejection
        if(option==='reject'){
                user.friendRequests= user?.friendRequests.filter((id)=>id!=friendId)
                await user?.save()
                console.log('new friend : ',user.friendRequests);
                

                 //retrieve all friends request from the friends array 
                let friendsArray = await Promise.all(
                user.friendRequests.map(async(id:string)=>{
                    let friend = await User.findById(id)
                    return friend;
                })
            )
                res.status(200).json({data:friendsArray,message:'rejected succefully'})
                return;
        }

        // handle friend request acceptance 
        if(option==='accept'){
            try {
                //adding friend to the user's friend array

            if(user&&friend){
                user.friends.push(friendId)
                friend.friends.push(userId)
                await user.save()
                await friend.save()

                 //retrieve all friends request from the friends array 
                let friendsArray = await Promise.all(
                    user.friendRequests.map(async(id:string)=>{
                        let friend = await User.findById(id)
                        return friend;
                    })
                )
                
                res.status(200).json({data:friendsArray,message:'friend added successfully'})
                return;
        }
                
            } catch (error) {
                res.status(400).json(error)
                return;
            }
        }
    } catch (error) {
        res.status(400).json({error})
        return;
    }
}

//function to display friends 

async function listFriends(req:CustomRequset,res:Response) {
    try {
        console.log('request to get friendlist received');
        
        const userID = req.user?.id
        const user = User.findById(userID)
        console.log('list of friends for the home page');
        
        
        
    } catch (error) {
        
    }
}



export { postUser,postLogin,findFrinds,sendfriendRequset,getFrendRequset,manageFriendRequest };
