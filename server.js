require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const { ApolloServer, gql } = require("apollo-server-express");
const Realm = require("realm");

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const User = require("./models/User");
const Book = require("./models/Book");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "library_secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "login")));

const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");

app.use("/auth", authRoutes);
app.use("/books", bookRoutes);

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    status: String!
    rating: Int
  }

  type Query {
    users: [User]
    books: [Book]
  }
`;

const resolvers = {
  Query: {
    users: async () => await User.find({}),
    books: async () => await Book.find({}),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.start().then(() => {
  server.applyMiddleware({ app });
});

app.get("/", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    res.sendFile(path.join(__dirname, "login", "login.html"));
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
