// @ts-ignore
import AfricasTalking from 'africastalking';
import accessEnv from '../helpers/accessEnv';
const AT_API_KEY = accessEnv('AT_API_KEY');
const AT_USERNAME = accessEnv('AT_USERNAME');

const africasTalking = new AfricasTalking({
  username: AT_USERNAME,
  apiKey: AT_API_KEY,
});

const sms = africasTalking.SMS;

const sendVerificationCode = async (phoneNumber: string) => {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  // Phone number needs to be like +254....
  const sendTo = `+${phoneNumber}`;

  const message = 'Your verification code is: ' + randomNumber;

  try {
    await sms.send({ to: sendTo, message: message });
    return randomNumber;
  } catch (err) {
    console.log('Err: ', err);
    return false;
  }
};

export default sendVerificationCode;
