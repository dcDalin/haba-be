// @ts-ignore
import AfricasTalking from 'africastalking';
import moment from 'moment';
import User from '../models/user.model';
import accessEnv from '../helpers/accessEnv';
const AT_API_KEY = accessEnv('AT_API_KEY');
const AT_USERNAME = accessEnv('AT_USERNAME');

const africasTalking = new AfricasTalking({
  username: AT_USERNAME,
  apiKey: AT_API_KEY,
});

const sms = africasTalking.SMS;

const makeId = (length: number) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const sendVerificationCode = async (phoneNumber: string) => {
  // Phone number needs to be like +254....
  const sendTo = `+${phoneNumber}`;

  const randomNumber = makeId(4);

  const message = 'Your goHaba verification code is: ' + randomNumber;

  try {
    await sms.send({ to: sendTo, message: message });
    return randomNumber;
  } catch (err) {
    console.log('Err: ', err);
    return false;
  }
};

const resendVerificationCode = async (userId: string, phoneNumber: string) => {
  // Phone number needs to be like +254....
  const sendTo = `+${phoneNumber}`;

  const randomNumber = makeId(4);

  const message = 'Your goHaba verification code is: ' + randomNumber;

  const user = await User.findByPk(userId);

  if (!user) {
    return false;
  } else {
    const { smsRequestCount, updatedAt } = user;

    if (smsRequestCount < 4) {
      try {
        await sms.send({ to: sendTo, message: message });
        await user.increment('smsRequestCount', { by: 1 });
        return { status: 'success', data: randomNumber };
      } catch (err) {
        console.log('Err: ', err);
        return {
          status: 'error',
          data: 'Could not send SMS',
        };
      }
    } else {
      const dateUpdate = moment(updatedAt);
      const dateNow = moment(Date.now());

      const timeElapsed = dateNow.diff(dateUpdate, 'minutes');

      const timeToShow = 10 - timeElapsed;

      if (timeToShow < 1) {
        try {
          await sms.send({ to: sendTo, message: message });
          user.smsRequestCount = 0;
          await user.save();
          return { status: 'success', data: randomNumber };
        } catch (err) {
          console.log('Err: ', err);
          return {
            status: 'error',
            data: 'Could not send SMS',
          };
        }
      } else {
        return {
          status: 'error',
          data: `Too many SMS requests, try agin in ${timeToShow} minutes`,
        };
      }
    }
  }
};

export { sendVerificationCode, resendVerificationCode, sms };
