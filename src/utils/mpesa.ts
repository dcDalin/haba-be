import { Mpesa } from "mpesa-api";
import accessEnv from "../helpers/accessEnv";
import path from "path";
const CONSUMER_KEY = accessEnv("CONSUMER_KEY");
const CONSUMER_SECRET = accessEnv("CONSUMER_SECRET");
const INITIATOR_PASSWORD = accessEnv("INITIATOR_PASSWORD");
const MPESA_ENVIRONMENT = accessEnv("MPESA_ENVIRONMENT");

const credentials = {
	client_key: CONSUMER_KEY,
	client_secret: CONSUMER_SECRET,
	initiator_password: INITIATOR_PASSWORD,
	certificatepath: path.resolve("src/keys/cert.cer"),
};

const mpesa = new Mpesa(credentials, MPESA_ENVIRONMENT);

export default mpesa;
