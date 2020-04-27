import express from 'express';
import mpesaController from '../controllers/mpesa.controller';

const mpesaRouter = express.Router();

// For testing if callback url works
mpesaRouter.get('/stkcallback', (_req, res) => {
  res.send('Working');
});

// STK Pay url, initiates the payment procedure
mpesaRouter.post('/stkpay', mpesaController.stkPay);

// Callback url, contains mutation that fills in admin and transaction stuff
mpesaRouter.post('/stkcallback', mpesaController.stkCallback);

mpesaRouter.post('/stkstatus', mpesaController.stkStatus);

mpesaRouter.post('/b2c/timeout', (req, _res) => {
  console.log('Timeout');
  console.log(req);
});

mpesaRouter.post('/b2c/success', mpesaController.b2cSuccess);

mpesaRouter.post('/reversal/success', (req, _res) => {
  console.log('Success reversal');
  console.log(req);
});

mpesaRouter.post('/reversal/timeout', (req, _res) => {
  console.log('Reversal timeout');
  console.log(req);
});

export default mpesaRouter;
