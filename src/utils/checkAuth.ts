import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import accessEnv from '../helpers/accessEnv';
const JWT_SECRET = accessEnv('JWT_SECRET');

const checkAuth = (context: any): any => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split('Bearer ')[1];
    if (token) {
      try {
        const user = jwt.verify(token, JWT_SECRET!);
        return user;
      } catch (err) {
        throw new AuthenticationError('UNAUTHENTICATED');
      }
    }
    throw new Error("Authentication token 'Bearer [Token]");
  }
  // Authorization header must be provided
  throw new Error('Not logged in :(');
};

export default checkAuth;
