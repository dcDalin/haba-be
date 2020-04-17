import pubsub from '../pubSub';
import sequelize from '../../../db/connection';
import Haba from '../../../models/haba.model';
import User from '../../../models/user.model';
import Admin from '../../../models/admin.model';
import UserTransaction from '../../../models/userTransaction.model';
import AdminTransaction from '../../../models/adminTransaction.model';
import { NEW_HABA, TRANSACTION_CHANGE } from '../types';

export default {
  Mutation: {
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
      }: any
    ) {
      // start a transaction
      const t = await sequelize.transaction();
      try {
        // New transaction started from MPESA Success
        const res = await Haba.create(
          {
            userId,
            mpesaCode,
            fromNumber,
            fromName,
            fromMessage,
            fromIsPrivate,
            fromAmount,
          },
          { transaction: t }
        );

        // Don't
        // Touch
        // This
        // Code
        // *********************************************************
        const amountReceived = fromAmount;
        const amountUserReceived = 0.9 * amountReceived;
        const amountCompanyReceived = 0.1 * amountReceived;
        // *********************************************************
        // Don't
        // Touch
        // This
        // Code

        // Sanity check, case the rates are off!
        // Got to add up to amount received
        // TODO: Does the error thrown make sense? Mpesa transaction is already complete,
        // TODO: Write a func to reverse the transaction
        if (amountUserReceived + amountCompanyReceived !== amountReceived) {
          throw 'error';
        }

        const adminOnePhoneNumber = '254715973838';
        const adminTwoPhoneNumber = '254728600789';

        const adminOnceCut = 0.8 * amountCompanyReceived;
        const adminTwoCut = 0.2 * amountCompanyReceived;

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
            amount: amountUserReceived,
            serviceFee: amountCompanyReceived,
            transactionType: 'HABA',
            balance: userBal.balance + amountUserReceived,
          },
          { transaction: t }
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
          ],
          { transaction: t }
        );

        await t.commit();

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
        console.log('Err is: ', err);
        return err;
      }
    },
  },
};
