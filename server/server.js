// initial dependencies
const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
const app = express();
const PORT = process.env.PORT || 3001;

// integrate Apollo server with Express application as middleware
app.use(express.urlencoded({ extended: true })); // does this need to be false?
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

// don't think I need this anymore
// db.once('open', () => {
//   app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
// });

///////////////////
//apollo server///
/////////////////

// import ApolloServer
const { ApolloServer } = require('apollo-server-express');
// import typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
// import authMiddleware
const { authMiddleware } = require('./utils/auth');

// create a new Apollo server and pass in schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

// call startApolloServer() to initialize the app
startApolloServer(typeDefs, resolvers);

