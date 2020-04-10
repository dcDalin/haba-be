import jwt from 'jsonwebtoken';
import accessEnv from '../helpers/accessEnv';
const JWT_SECRET = accessEnv('JWT_SECRET');

const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
    },
    JWT_SECRET!,
    { expiresIn: '1d' }
  );
};

export { generateToken };
