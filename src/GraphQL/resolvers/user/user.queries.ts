import Sequelize from 'sequelize';
import { UserInputError } from 'apollo-server-express';
import { Op } from 'sequelize';
import User from '../../../models/user.model';
import Haba from '../../../models/haba.model';
import checkAuth from '../../../utils/checkAuth';

const toCursorHash = (string: string) => Buffer.from(string).toString('base64');

const fromCursorHash = (string: string) =>
  Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
    user_allUsers: () => User.findAll(),
    async user_searchUserName(_: null, { userName }: { userName: string }) {
      // Lowercase username
      const lowercasedUserName = userName.toLowerCase();

      const result = await User.findAll({
        where: {
          [Op.or]: [
            {
              userName: {
                [Op.like]: '%' + lowercasedUserName + '%',
              },
            },
            {
              displayName: {
                [Op.like]: '%' + lowercasedUserName + '%',
              },
            },
          ],
        },
        limit: 10,
      });

      return result;
    },
    async user_userNameExists(_: null, { userName }: any) {
      // Lowercase username
      const lowercasedUserName = userName.toLowerCase();

      const user = await User.findOne({
        where: { userName: lowercasedUserName },
      });
      if (user) {
        return true;
      }
      return false;
    },
    async user_userPhoneNumberExists(_: null, { phoneNumber }: any) {
      const userPhoneNumber = await User.findOne({
        where: { phoneNumber },
      });
      if (userPhoneNumber) {
        return true;
      }
      return false;
    },
    user_me: (_: null, _args: null, context: any) => {
      const me = checkAuth(context);
      return User.findByPk(me.id);
    },
    async user_profile(_: null, { userName, limit = 10, cursor }: any) {
      // Get user
      const user = await User.findOne({
        where: { userName: userName.toLowerCase() },
      });

      if (user) {
        const cursorOptions = cursor
          ? {
              where: {
                userId: user.id,
                createdAt: {
                  [Sequelize.Op.lt]: fromCursorHash(cursor),
                },
              },
            }
          : {};

        // Get user habas
        const habas = await Haba.findAll({
          where: { userId: user.id },
          order: [['createdAt', 'DESC']],
          limit: limit + 1,
          raw: true,
          ...cursorOptions,
        });

        // array does not exist, is not an array, or is empty
        // ⇒ do not attempt to process array
        if (!Array.isArray(habas) || !habas.length) {
          return {
            hasNextPage: null,
            endCursor: null,
            user,
            haba: habas,
          };
        } else {
          const hasNextPage = habas.length > limit;
          const edges = hasNextPage ? habas.slice(0, -1) : habas;

          return {
            hasNextPage,
            endCursor: toCursorHash(
              edges[edges.length - 1].createdAt.toString()
            ),
            user,
            haba: edges,
          };
        }
      }
      throw new UserInputError('User not found', {
        errors: {
          generic: 'User not found',
        },
      });
    },
  },
};
