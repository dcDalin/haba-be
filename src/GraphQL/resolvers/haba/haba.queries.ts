import habaModel from '../../../models/haba.model';
import userModel from '../../../models/user.model';

export default {
  Query: {
    async haba_allHabas() {
      // Save to DB
      try {
        const res = await habaModel.findAll();

        return res;
      } catch (err) {
        console.log('Err is: ', err);
        return [];
      }
    },
    async haba_recentHabas() {
      try {
        const res = await habaModel.findAll({
          include: [
            {
              model: userModel,
            },
          ],
          order: [['createdAt', 'DESC']],
          limit: 20,
        });
        return res;
      } catch (err) {
        return [];
      }
    },
  },
};
