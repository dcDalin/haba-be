import { request as gRequest } from 'graphql-request';
import isReachable from 'is-reachable';
import User from '../models/user.model';
import accessEnv from '../helpers/accessEnv';
import mpesa from '../utils/mpesa';
const APP_URL = accessEnv('APP_URL');

class MpesaController {
  static async stkPay(req: any, res: any) {
    // TODO: Valdiate input
    const {
      phoneNumber,
      payToUserName,
      amount,
      name,
      message,
      isPrivate,
    } = req.body;

    // Check if stk works before allowing transactions
    // STK has no way of cancelling case callback don't work
    const callBackUrlWorks = await isReachable(`${APP_URL}/pay/stkcallback`);

    if (!callBackUrlWorks) {
      console.log(`${APP_URL}/pay/stkcallback: is not reachable`);
      return res.status(404).json({ msg: 'Callback URL does not work' });
    }

    const user = await User.findOne({ where: { userName: payToUserName } });

    if (!user) {
      return res.status(404).json({ msg: 'Username not found' });
    }

    // Encode message
    const encodedMessage = encodeURI(message);

    const callbackUrl = `${APP_URL}/pay/stkcallback?phoneNumber=${phoneNumber}&userId=${user.id}&name=${name}&message=${encodedMessage}&isPrivate=${isPrivate}`;

    const transactionDesc = 'HABA';

    const transactionType = 'CustomerPayBillOnline';
    try {
      console.log(callbackUrl);

      const response = await mpesa.lipaNaMpesaOnline(
        phoneNumber,
        amount,
        callbackUrl,
        payToUserName,
        transactionDesc,
        transactionType
      );
      console.log(callbackUrl);
      if (response) {
        console.log('Response: ', response.data);
        const { ResponseCode, CustomerMessage } = response.data;
        if (ResponseCode === '0') {
          return res.status(200).json({
            status: 'success',
            msg: CustomerMessage,
            data: response.data,
          });
        } else {
          return res
            .status(400)
            .json({ status: 'error', msg: CustomerMessage });
        }
      } else {
        return res
          .status(400)
          .json({ status: 'error', msg: 'An error occured, please try again' });
      }
    } catch (error) {
      console.log('Error is: ', error);

      return res.status(400).json({
        status: 'error',
        msg: 'An unknown error occured, please try again later',
      });
    }
  }

  static async stkCallback(req: any, res: any) {
    console.log('Callback starting');
    // Get values from url params
    const { phoneNumber, userId, message, isPrivate } = req.query;

    // for some reason, isPrivate is string
    // We need to convert it to a boolean value
    // otherwise our haba_newHaba mutation will fail
    let value = isPrivate;
    let fromIsPrivate = value === 'true';

    let { name } = req.query;

    // Destructure ResultCode from Saf response
    const { ResultCode } = req.body.Body.stkCallback;

    // Decode the message from callback url query string
    const decodedMessage = decodeURI(message);
    console.log('Decoded message is: ', decodedMessage);

    if (ResultCode === 0) {
      const { Item } = req.body.Body.stkCallback.CallbackMetadata;

      // if name is empty, set it to default `Someone`
      name = name ? name : 'Someone';

      // TODO: Find way of securing this mutation
      const mutation = `mutation Haba_newHaba(
        $userId: String!
				$mpesaCode: String!
				$fromNumber: String!
				$fromName: String!
				$fromMessage: String!
				$fromIsPrivate: Boolean!
				$fromAmount: Float!
			) {
				haba_newHaba(habaNewInput: { 
          userId: $userId,
					mpesaCode: $mpesaCode,
					fromNumber: $fromNumber, 
					fromName: $fromName, 
					fromMessage: $fromMessage, 
					fromIsPrivate: $fromIsPrivate, 
					fromAmount: $fromAmount, 
				}) {
					fromName
				}
			}`;

      const variables = {
        userId,
        mpesaCode: Item[1].Value,
        fromNumber: phoneNumber,
        fromName: name,
        fromMessage: decodedMessage,
        fromIsPrivate,
        fromAmount: Item[0].Value,
      };

      console.log('Got near request');

      try {
        await gRequest(`${APP_URL}/graphql`, mutation, variables);
      } catch (err) {
        console.log('*****************');
        console.log('MPESA Mutation did not work: ', err);
      }
    } else {
      console.error('**************************************');
      console.log(req.body.Body.stkCallback);
      res
        .status(200)
        .json({ code: ResultCode, message: req.body.Body.stkCallback });
    }
  }
  static async stkStatus(req: any, res: any) {
    const { checkoutRequestId } = req.body;
    try {
      const response = await mpesa.lipaNaMpesaQuery(checkoutRequestId);
      if (response) {
        const { ResultDesc } = response.data;
        console.log('Response is: ', response);
        res.status(200).json({ status: 'success', msg: ResultDesc });
      } else {
        res.status(400).json({ status: 'error', msg: 'something went wrong' });
      }
    } catch (err) {
      console.log('Err is: ', err);
      const { errorMessage } = err.response.data;
      res.status(400).json({ status: 'error', msg: errorMessage });
    }
  }
}

export default MpesaController;
