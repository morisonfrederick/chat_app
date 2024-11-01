import { Request, Response } from 'express';
import { User } from '../Model/userModel';

async function deleteUsers(req: Request, res: Response) {
    try {
        const result = await User.deleteMany({}); // Deletes all documents in the 'User' collection
        res.status(200).json({ message: 'All users deleted successfully', result });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete users', error });
    }
}

export { deleteUsers };
