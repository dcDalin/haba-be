import jwt from 'jsonwebtoken';
import accessEnv from '../helpers/accessEnv';
const JWT_SECRET = accessEnv('JWT_SECRET');

const generateToken = (user: any) => {
  const { id, userName, displayName, bio, profileUrl, phoneNumber } = user;
  return jwt.sign(
    {
      id,
      userName,
      displayName,
      bio,
      profileUrl,
      phoneNumber,
    },
    JWT_SECRET!,
    { expiresIn: '1d' }
  );
};

export { generateToken };
