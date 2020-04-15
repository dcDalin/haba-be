// @ts-ignore
import Mpesa from 'mpesa-node';
import accessEnv from '../helpers/accessEnv';
import path from 'path';
const CONSUMER_KEY = accessEnv('CONSUMER_KEY');
const CONSUMER_SECRET = accessEnv('CONSUMER_SECRET');
const INITIATOR_NAME = accessEnv('INITIATOR_NAME');
const SECURITY_CREDENTIAL = accessEnv('SECURITY_CREDENTIAL');
const LIPA_NA_MPESA_ONLINE_SHORT_CODE = accessEnv(
  'LIPA_NA_MPESA_ONLINE_SHORT_CODE'
);
const MPESA_ENVIRONMENT = accessEnv('MPESA_ENVIRONMENT');
const SHORT_CODE = accessEnv('SHORT_CODE');
const LIPA_NA_MPESA_ONLINE_PASSKEY = accessEnv('LIPA_NA_MPESA_ONLINE_PASSKEY');

const credentials = {
  consumerKey: CONSUMER_KEY,
  consumerSecret: CONSUMER_SECRET,
  environment: MPESA_ENVIRONMENT,
  shortCode: SHORT_CODE,
  initiatorName: INITIATOR_NAME,
  lipaNaMpesaShortCode: LIPA_NA_MPESA_ONLINE_SHORT_CODE,
  lipaNaMpesaShortPass: LIPA_NA_MPESA_ONLINE_PASSKEY,
  securityCredential: SECURITY_CREDENTIAL,
  certPath: path.resolve('src/keys/cert.cer'),
};

const mpesa = new Mpesa(credentials);

export default mpesa;
