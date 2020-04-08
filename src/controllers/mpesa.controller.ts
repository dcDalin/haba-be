import { Response } from "express";
import axios from "axios";
import moment from "moment";
import { request as gRequest } from "graphql-request";
import isReachable from "is-reachable";
import request from "request";
import User from "../models/user.model";
import accessEnv from "../helpers/accessEnv";
import mpesa from "../utils/mpesa";
const APP_URL = accessEnv("APP_URL");
const LIPA_NA_MPESA_ONLINE_PASSKEY = accessEnv("LIPA_NA_MPESA_ONLINE_PASSKEY");
const LIPA_NA_MPESA_ONLINE_SHORT_CODE = accessEnv(
	"LIPA_NA_MPESA_ONLINE_SHORT_CODE"
);
const SHORT_CODE = accessEnv("SHORT_CODE");

class MpesaController {
	static async getToken(req: any, res: any) {
		res.status(200).json({ message: req.access_token });
	}

	static async registerURL(req: any, res: Response) {
		const endpoint = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";

		request(
			{
				method: "POST",
				url: endpoint,
				headers: {
					Authorization: `Bearer ${req.access_token}`,
				},
				json: {
					ShortCode: SHORT_CODE,
					ResponseType: "Cancelled",
					ConfirmationURL: `${APP_URL}/pay/c2b/confirm`,
					ValidationURL: `${APP_URL}/pay/c2b/validate`,
				},
			},
			function (error, _response, body) {
				if (error) {
					res.json(error);
				}
				res.status(200).json(body);
			}
		);
	}

	static async simulate(req: any, res: any) {
		const endpoint = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate";

		try {
			const result = await axios({
				method: "POST",
				url: endpoint,
				headers: { Authorization: `Bearer ${req.access_token}` },
				data: {
					ShortCode: "600326",
					Amount: 10,
					BillRefNumber: "testing",
					Msisdn: "254715973838",
					CommandID: "CustomerPayBillOnline",
				},
			});
			res.status(200).json(result.data);
		} catch (error) {
			console.log("Error is: ", error);
			res.status(401).json({ message: error });
		}
	}

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
		const callBackUrlWorks = await isReachable(`${APP_URL}/pay/stk-callback`);

		if (!callBackUrlWorks) {
			console.log(`${APP_URL}/pay/stk-callback: is not reachable`);
			return res.status(404).json({ msg: "Callback URL does not work" });
		}

		const user = await User.findOne({ where: { userName: payToUserName } });

		if (!user) {
			return res.status(404).json({ msg: "Username not found" });
		}

		// Encode message
		const encodedMessage = encodeURI(message);

		mpesa
			.lipaNaMpesaOnline({
				BusinessShortCode: LIPA_NA_MPESA_ONLINE_SHORT_CODE,
				Amount: amount,
				PartyA: phoneNumber,
				PartyB: LIPA_NA_MPESA_ONLINE_SHORT_CODE,
				PhoneNumber: phoneNumber,
				CallBackURL: `${APP_URL}/pay/stk-callback?phoneNumber=${phoneNumber}&userId=${user.id}&name=${name}&message=${encodedMessage}&isPrivate=${isPrivate}`,
				AccountReference: payToUserName,
				passKey: LIPA_NA_MPESA_ONLINE_PASSKEY,
				TransactionType: "CustomerPayBillOnline",
				TransactionDesc: "Haba",
			})
			.then((response) => {
				return res.status(200).json({
					msg: "Success, input MPesa pin",
					response: response.ResponseCode,
				});
			})
			.catch((error) => {
				console.error(error);
				return res
					.status(400)
					.json({ msg: "An unknown error occured", response: error });
			});
	}

	static async stkCallback(req: any, res: any) {
		console.log("Callback starting");
		// Get values from url params
		const { phoneNumber, userId, message, isPrivate } = req.query;

		// for some reason, isPrivate is string
		// We need to convert it to a boolean value
		// otherwise our haba_newHaba mutation will fail
		let value = isPrivate;
		let fromIsPrivate = value === "true";

		let { name } = req.query;

		// Destructure ResultCode from Saf response
		const { ResultCode } = req.body.Body.stkCallback;

		// Decode the message from callback url query string
		const decodedMessage = decodeURI(message);
		console.log("Decoded message is: ", decodedMessage);

		if (ResultCode === 0) {
			const { Item } = req.body.Body.stkCallback.CallbackMetadata;

			// if name is empty, set it to default `Someone`
			name = name ? name : "Someone";

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

			console.log("Got near request");

			try {
				await gRequest(`${APP_URL}/graphql`, mutation, variables);
			} catch (err) {
				console.log("*****************");
				console.log("MPESA Mutation did not work: ", err);
			}
		} else {
			console.error("**************************************");
			console.log(req.body.Body.stkCallback);
			res
				.status(200)
				.json({ code: ResultCode, message: req.body.Body.stkCallback });
		}
		/**
		 {
				MerchantRequestID: '1998-22770637-1',
				CheckoutRequestID: 'ws_CO_080320200845172154',
				ResultCode: 1031,
				ResultDesc: 'Request cancelled by user'
			}
			{
  MerchantRequestID: '11614-1471978-1',
  CheckoutRequestID: 'ws_CO_090320201600180986',
  ResultCode: 26,
  ResultDesc: 'System busy. The service request is rejected.'
} 
			{
				MerchantRequestID: '14671-4716794-1',
				CheckoutRequestID: 'ws_CO_080320200845525939',
				ResultCode: 0,
				ResultDesc: 'The service request is processed successfully.',
				CallbackMetadata: { Item: [ [Object], [Object], [Object], [Object] ] }
			}
		 * 
		 */
	}
}

export default MpesaController;
