import 'dotenv/config';
import { createServer } from 'http';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cloudinary from 'cloudinary';

import sequelize from './db/connection';
import typeDefs from './GraphQL/typeDefs';
import resolvers from './GraphQL/resolvers';
import accessEnv from './helpers/accessEnv';
import mpesaRouter from './routes/mpesa';
const PORT = accessEnv('PORT');
const CLOUDINARY_APP_NAME = accessEnv('CLOUDINARY_APP_NAME');
const CLOUDINARY_API_KEY = accessEnv('CLOUDINARY_API_KEY');
const CLOUDINARY_API_SECRET = accessEnv('CLOUDINARY_API_SECRET');

(async () => {
  try {
    const app = express();

    app.disable('x-powered-by');

    app.use(
      cors({
        credentials: true,
        origin: '*',
      })
    );

    cloudinary.v2.config({
      cloud_name: CLOUDINARY_APP_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });

    app.use(bodyParser.json());

    app.use('/pay', mpesaRouter);

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({ req, res, connection }) => {
        if (connection) {
          // check connection for metadata
          console.log(
            'Connection is: ',
            connection.context.req.headers.authorization
          );
          console.log('Active Subscription is: ', connection.operationName);
          return connection.context;
        } else {
          return { req, res };
        }
      },
      // context: ({ req, res }) => ({ req, res }),
      introspection: true,
      playground: true,
    });

    server.applyMiddleware({ app, cors: false });

    const httpServer = createServer(app);

    server.installSubscriptionHandlers(httpServer);

    await sequelize.authenticate();

    httpServer.listen({ port: PORT }, () =>
      console.log(
        `
        ################################################

        🚀 Server ready at http://localhost:${PORT}${server.graphqlPath} 🚀

        ################################################
        `
      )
    );
  } catch (e) {
    console.error(e);
  }
})();
