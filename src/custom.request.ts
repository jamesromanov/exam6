import { UserModel } from './users/entities/user.model';
declare global {
  namespace Express {
    interface Request {
      user?: UserModel;
    }
  }
}
