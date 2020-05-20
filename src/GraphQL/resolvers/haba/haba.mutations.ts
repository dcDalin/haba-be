import pubsub from '../pubSub';
import sequelize from '../../../db/connection';
// import { reversal } from '../../../utils/mpesa';
import Haba from '../../../models/haba.model';
import User from '../../../models/user.model';
import Admin from '../../../models/admin.model';
import UserTransaction from '../../../models/userTransaction.model';
import AdminTransaction from '../../../models/adminTransaction.model';
import { NEW_HABA, TRANSACTION_CHANGE } from '../types';
import checkAuth from '../../../utils/checkAuth';
import { sms } from '../../../utils/sendVerificationCode';

export default {
  Mutation: {
    async haba_reply(_: null, { habaId, reply }: any, context: any) {
      const me = checkAuth(context);

      const { id } = me;

      const user = await User.findByPk(id);

      if (!user) {
        return {
          status: 'failure',
          message: 'An unknown error occured',
        };
      }

      const haba = await Haba.findByPk(habaId);

      if (!haba) {
        return {
          status: 'failure',
          message: 'An unknown error occured',
        };
      }

      haba.reply = reply;
      await haba.save();

      return {
        status: 'success',
        message: 'Reply has been updated',
      };
    },
    async haba_newHaba(
      _: null,
      {
        habaNewInput: {
          userId,
          mpesaCode,
          fromNumber,
          fromName,
          fromMessage,
          fromIsPrivate,
          fromAmount,
        },
      }: any,
    ) {
      // start a transaction
      const t = await sequelize.transaction();
      try {
        // New transaction started from MPESA Success
        const res = await Haba.create(
          {
            userId,
            fromNumber,
            fromName,
            fromMessage,
            fromIsPrivate,
            fromAmount,
          },
          { transaction: t },
        );

        // Don't
        // Touch
        // This
        // Code
        // *********************************************************
        const amountReceived = fromAmount;
        const amountUserReceived = 0.95 * amountReceived;
        const amountCompanyReceived = 0.05 * amountReceived;
        // *********************************************************
        // Don't
        // Touch
        // This
        // Code

        // Sanity check, case the rates are off!
        // Got to add up to amount received
        // if (amountUserReceived + amountCompanyReceived !== amountReceived) {
        //   console.log('Amount received not correct, about to reverse');
        //   reversal(mpesaCode, fromAmount);
        //   return 'error';
        // }

        const adminOnePhoneNumber = '254715973838';
        const adminTwoPhoneNumber = '254728600789';
        const adminThreePhoneNumber = '254703625710';

        const adminOneShare = 0.72;
        const adminTwoShare = 0.2;
        const adminThreeShare = 0.08;

        const adminOnceCut = adminOneShare * amountCompanyReceived;
        const adminTwoCut = adminTwoShare * amountCompanyReceived;
        const adminThreeCut = adminThreeShare * amountCompanyReceived;

        // Sanity check, case the admin cuts are are off!
        // Got to add up to amount received
        // TODO: Admin share always 0.9999999 fix it
        // if (adminOneShare + adminTwoShare + adminThreeShare !== 1) {
        //   console.log(adminOneShare + adminTwoShare + adminThreeShare);
        //   console.log(1);
        //   console.log('Reversing because admin cuts not 1');
        //   reversal(mpesaCode, fromAmount);

        //   return 'error';
        // }

        // Fetch user
        const userBal: any = await User.findByPk(userId);

        // Update balance and netIncome on the user above
        userBal.increment(['balance', 'netIncome'], {
          by: amountUserReceived,
          transaction: t,
        });

        // Create new user transaction
        const transRes = await UserTransaction.create(
          {
            userId,
            transactionCode: mpesaCode,
            amount: amountUserReceived,
            serviceFee: amountCompanyReceived,
            transactionType: 'HABA',
            balance: userBal.balance + amountUserReceived,
          },
          { transaction: t },
        );

        // Fetch admin one -> DC -> phoneNumber is the pk
        const adminOneBal: any = await Admin.findByPk(adminOnePhoneNumber);

        // Update balance and netIncome on the admin one -> DC -> adminOneCut
        adminOneBal.increment(['balance', 'netIncome'], {
          by: adminOnceCut,
          transaction: t,
        });

        // Fetch admin two -> Odizo
        const adminTwoBal: any = await Admin.findByPk(adminTwoPhoneNumber);

        // Update balance and netIncome on the admin two -> Odizo -> adminTwoCut
        adminTwoBal.increment(['balance', 'netIncome'], {
          by: adminTwoCut,
          transaction: t,
        });

        // Fetch admin three -> Kenn
        const adminThreeBal: any = await Admin.findByPk(adminThreePhoneNumber);

        // Update balance and netIncome on the admin two -> Odizo -> adminTwoCut
        adminThreeBal.increment(['balance', 'netIncome'], {
          by: adminThreeCut,
          transaction: t,
        });

        // Create new admin transaction
        // For both admins
        await AdminTransaction.bulkCreate(
          [
            {
              adminPhoneNumber: adminOnePhoneNumber,
              amount: adminOnceCut,
              transactionType: 'SERVICE FEE',
              balance: adminOneBal.balance + adminOnceCut,
            },
            {
              adminPhoneNumber: adminTwoPhoneNumber,
              amount: adminTwoCut,
              transactionType: 'SERVICE FEE',
              balance: adminTwoBal.balance + adminTwoCut,
            },
            {
              adminPhoneNumber: adminThreePhoneNumber,
              amount: adminThreeCut,
              transactionType: 'SERVICE FEE',
              balance: adminThreeBal.balance + adminThreeCut,
            },
          ],
          { transaction: t },
        );

        await t.commit();

        const user: any = await User.findByPk(userId);

        const message = `${fromName} did a ${fromAmount} HABA on your account. Log in and say thank you.`;

        await sms.send({
          message,
          to: `+${user.phoneNumber}`,
        });

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

        // Sub on the user profile
        // When a new haba pops up
        pubsub.publish(NEW_HABA, { haba_subNewHaba: res.toJSON() });

        return res.toJSON();
      } catch (err) {
        // Reverse the MPESA transaction
        console.log('Error caught, about to reverse pay');
        reversal(mpesaCode, fromAmount);
        return err;
      }
    },
  },
};
