import express from "express";
import mpesaController from "../controllers/mpesa.controller";
import genToken from "../utils/generateAccessToken";

const mpesaRouter = express.Router();

mpesaRouter.get("/get-token", genToken, mpesaController.getToken);
mpesaRouter.get("/register", genToken, mpesaController.registerURL);
mpesaRouter.post("/c2b/confirm", (req, res) => {
	console.log("Confirmation URL");
	console.log(req.body);
	res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
});
mpesaRouter.post("/c2b/validate", (req, res) => {
	console.log("Validation URL");
	console.log(req.body);
	res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
});

mpesaRouter.get("/simulate", genToken, mpesaController.simulate);

mpesaRouter.post("/stk-pay", genToken, mpesaController.stkPay);

mpesaRouter.get("/stk-callback", (_req, res) => {
	res.send("Working");
});

mpesaRouter.post("/stk-callback", mpesaController.stkCallback);

export default mpesaRouter;
