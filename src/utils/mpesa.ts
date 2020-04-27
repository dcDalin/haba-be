import { Mpesa } from 'mpesa-api';
import accessEnv from '../helpers/accessEnv';
const MPESA_CONSUMER_KEY = accessEnv('MPESA_CONSUMER_KEY');
const MPESA_CONSUMER_SECRET = accessEnv('MPESA_CONSUMER_SECRET');
const MPESA_SECURITY_CREDENTIAL = accessEnv('MPESA_SECURITY_CREDENTIAL');
const MPESA_ENVIRONMENT = accessEnv('MPESA_ENVIRONMENT');
const MPESA_INITIATOR_NAME = accessEnv('MPESA_INITIATOR_NAME');
const MPESA_SHORT_CODE = accessEnv('MPESA_SHORT_CODE');
const APP_URL = accessEnv('APP_URL');

const credentials = {
  client_key: MPESA_CONSUMER_KEY,
  client_secret: MPESA_CONSUMER_SECRET,
  initiator_password: MPESA_SECURITY_CREDENTIAL,
  certificatepath: null,
};

const mpesa = new Mpesa(credentials, MPESA_ENVIRONMENT);

const reversal = (transactionCode: string, amount: number) => {
  mpesa
    .reversal({
      Initiator: MPESA_INITIATOR_NAME,
      TransactionID: transactionCode,
      Amount: amount,
      ReceiverParty: MPESA_SHORT_CODE,
      ResultURL: `${APP_URL}/pay/reversal/success`,
      QueueTimeOutURL: `${APP_URL}/pay/reversal/timeout`,
      CommandID: 'TransactionReversal' /* OPTIONAL */,
      RecieverIdentifierType: 11,
      Remarks: 'ERROR TRANSACTING' /* OPTIONAL */,
      Occasion: 'Do a haba' /* OPTIONAL */,
    })
    .then((response) => {
      console.log(response);
      console.log('Reversal successful');
    })
    .catch((error) => {
      console.error(error);
      console.error('Could not reverse the transaction');
    });
};

export { mpesa, reversal };
