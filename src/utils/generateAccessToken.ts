import axios from 'axios';
import accessEnv from '../helpers/accessEnv';
const CONSUMER_SECRET = accessEnv('CONSUMER_SECRET');
const ENDPOINT = accessEnv('ENDPOINT');
const CONSUMER_KEY = accessEnv('CONSUMER_KEY');

// middleware function for generating the token
const genToken = async (req: any, res: any, next: any) => {
  const endpoint = ENDPOINT;
  const consumerKey = CONSUMER_KEY;
  const consumerSecret = CONSUMER_SECRET;

  const auth = new Buffer(`${consumerKey}:${consumerSecret}`).toString(
    'base64'
  );

  try {
    const response = await axios.get(endpoint!, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    req.access_token = response.data.access_token;
    next();
  } catch (error) {
    res.status(401).json({ message: error });
  }
};

export default genToken;
