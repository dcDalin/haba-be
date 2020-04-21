import { Mpesa } from 'mpesa-api';
import accessEnv from '../helpers/accessEnv';
const MPESA_CONSUMER_KEY = accessEnv('MPESA_CONSUMER_KEY');
const MPESA_CONSUMER_SECRET = accessEnv('MPESA_CONSUMER_SECRET');
const MPESA_SECURITY_CREDENTIAL = accessEnv('MPESA_SECURITY_CREDENTIAL');
const MPESA_ENVIRONMENT = accessEnv('MPESA_ENVIRONMENT');

const credentials = {
  client_key: MPESA_CONSUMER_KEY,
  client_secret: MPESA_CONSUMER_SECRET,
  initiator_password: MPESA_SECURITY_CREDENTIAL,
  certificatepath: null,
};

const mpesa = new Mpesa(credentials, MPESA_ENVIRONMENT);

export default mpesa;
