// import { mpesa } from '../../../utils/mpesa';
import pubsub from '../pubSub';
import accessEnv from '../../../helpers/accessEnv';
import checkAuth from '../../../utils/checkAuth';
import User from '../../../models/user.model';
import sequelize from '../../../db/connection';
import UserTransaction from '../../../models/userTransaction.model';
import { TRANSACTION_CHANGE } from '../types';
import { sms } from '../../../utils/sendVerificationCode';
// const MPESA_SHORT_CODE = accessEnv('MPESA_SHORT_CODE');
// const APP_URL = accessEnv('APP_URL');
// const NODE_ENV = accessEnv('NODE_ENV');
// const MPESA_TEST_MSISDN = accessEnv('MPESA_TEST_MSISDN');
// const MPESA_INITIATOR_NAME = accessEnv('MPESA_INITIATOR_NAME');


export default {
  Mutation: {
    async earnings_initiateMpesaWithdrawal(
      _: null,
      { amount }: any,
      context: any,
    ) {
      const me = checkAuth(context);

      const { id } = me;

      const user = await User.findByPk(id);

      if (user) {
        const { phoneNumber, balance } = user;

        // Check if you have enough cash in the place
        // TODO: CHANGE TO `>` after you done testing
        if (amount > balance) {
          return {
            status: 'error',
            message: 'Sorry, you have insufficient funds',
          };
        } else {
          // Send sms to us

          await sms.send({
            to: 254715973838,
            message: `${phoneNumber} wants to withdraw ${amount}`,
          });

          await sms.send({
            to: 254728600789,
            message: `${phoneNumber} wants to withdraw ${amount}`,
          });

          return {
            status: 'success',
            message: 'Your request is being processed',
          };
          // Phone number depending on the environment
          // const withdrawPhoneNumber =
          //   NODE_ENV === 'production' ? phoneNumber : MPESA_TEST_MSISDN;

          // const successUrl = `${APP_URL}/pay/b2c/success?amount=${amount}&userId=${id}`;

          // return mpesa
          //   .b2c({
          //     Initiator: MPESA_INITIATOR_NAME,
          //     Amount: amount,
          //     PartyA: MPESA_SHORT_CODE,
          //     PartyB: withdrawPhoneNumber,
          //     QueueTimeOutURL: `${APP_URL}/pay/b2c/timeout`,
          //     ResultURL: successUrl,
          //     CommandID: 'BusinessPayment',
          //     Occasion: 'Withdrawal',
          //     Remarks: 'Withdrawal',
          //   })
          //   .then((response) => {
          //     console.log('Response is: ', response);
          //     if (response.ResponseCode === '0') {
          //       return {
          //         status: 'success',
          //         message: 'Your request is being processed',
          //       };
          //     } else {
          //       return {
          //         status: 'error',
          //         message: 'Something went wrong, please try again',
          //       };
          //     }
          //   })
          //   .catch((error) => {
          //     console.log('Error is: ', error);
          //     return {
          //       status: 'error',
          //       message: 'Something went wrong, please try again',
          //     };
          //   });
        }
      } else {
        return {
          status: 'error',
          message: 'Something went wrong, please try again',
        };
      }
    },
    async earnings_mpesaWithdraw(
      _: null,
      { amount, userId, transactionCode }: any,
    ) {
      const user: any = await User.findByPk(userId);
      // start a transaction

      const findExists = await UserTransaction.count({
        where: { transactionCode },
      });

      if (findExists !== 0) {
        throw new Error('Transaction code exists');
      }
      console.log('****************************************');
      console.log(findExists);

      // Destructure current balance
      const { balance } = user;

      // **************************************
      // update user balance
      const newBalance = balance - parseFloat(amount);
      // **************************************

      const serviceFee = 0;
      const transactionType = 'WITHDRAW';

      // start a transaction
      const t = await sequelize.transaction();
      try {
        const transRes = await UserTransaction.create(
          {
            userId,
            transactionCode,
            amount,
            serviceFee,
            transactionType,
            balance: newBalance,
          },
          { transaction: t },
        );

        await Promise.all([
          user.increment('balance', {
            by: parseFloat(amount) * -1,
            transaction: t,
          }),
          user.increment('withdrawn', {
            by: parseFloat(amount),
            transaction: t,
          }),
        ]);

        await t.commit();

        // Fetch the user
        const updatedUser: any = await User.findByPk(userId);

        const { id, netIncome, withdrawn, balance } = updatedUser;

        const subRes = {
          id,
          netIncome,
          withdrawn,
          availableForWithdrawal: balance,
          earnings: transRes.toJSON(),
        };
        // Subscription on the logged in user side,
        // While on earnings page case a new earning pops up
        pubsub.publish(TRANSACTION_CHANGE, {
          earnings_transactonChange: subRes,
        });

        return true;
      } catch (err) {
        console.log('Err is: ', err);
        return err;
      }
    },
  },
};
