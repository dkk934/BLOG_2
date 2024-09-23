import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import Strategy from "passport-local";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;
const salt_round = 10;
const API_URL = process.env.API_URL || "http://localhost:4000";

const db = new pg.Client({
  user: process.env.user,
  host: process.env.host,
  database: process.env.database,
  password: process.env.password,
  port_DB: process.env.port_DB,
});

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Utility function for error handling
const handleError = (res, message = "An error occurred", statusCode = 500) => {
  res.status(statusCode).json({ message });
};

// Authentication Routes
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
    res.render("home.ejs")
});

// app.get("/register", (req, res) => {
//   res.render("register.ejs");
// });

app.get("/blog", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const [postsResponse, tablesResponse] = await Promise.all([
        axios.get(`${API_URL}/posts`),
        axios.get(`${API_URL}/tables/all`)
      ]);
      
      res.render("index.ejs", { posts: postsResponse.data, tables: tablesResponse.data });
    } catch (error) {
      handleError(res, "Error fetching data");
    }
  } else {
    res.redirect("/");
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/blog",
  passport.authenticate("google", {
    successRedirect: "/blog",
    failureRedirect: "/login",
  })
);

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/blog",
    failureRedirect: "/login?error=1",
  })
);

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users_login WHERE email_address = $1", [email]);

    if (checkResult.rows.length > 0) {
      res.redirect("/login");
    } else {
      bcrypt.hash(password, salt_round, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users_login (email_address, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            console.log("Registration successful");
            res.redirect("/blog");
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});


app.get("/new", async (req, res) => {
  try {
    const tablesResponse = await axios.get(`${API_URL}/tables/all`);
    res.render("modify.ejs", { heading: "New Post", submit: "Create Post", tables: tablesResponse.data.rows });
  } catch (error) {
    handleError(res, "Error fetching tables");
  }
});

app.get("/edit/:id", async (req, res) => {
  try {
    const postResponse = await axios.get(`${API_URL}/posts/${req.params.id}`);
    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: postResponse.data,
    });
  } catch (error) {
    handleError(res, "Error fetching post");
  }
});

app.post("/api/table", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/post/${req.body.table}`);
    res.render("index.ejs", { posts: response.data });
  } catch (error) {
    handleError(res, "Error creating topic");
  }
});

app.post("/api/posts", async (req, res) => {
  try {
    await axios.post(`${API_URL}/posts`, req.body);
    res.redirect("/blog");
  } catch (error) {
    handleError(res, "Error creating post");
  }
});

app.post("/api/posts/:id", async (req, res) => {
  try {
    await axios.patch(`${API_URL}/posts/${req.params.id}`, req.body);
    res.redirect("/blog");
  } catch (error) {
    handleError(res, "Error updating post");
  }
});

app.get("/api/posts/delete/:id", async (req, res) => {
  try {
    await axios.delete(`${API_URL}/posts/${req.params.id}`);
    res.redirect("/blog");
  } catch (error) {
    handleError(res, "Error deleting post");
  }
});

// Local authentication strategy
passport.use("local",
  new Strategy(async function verify(username, password, done) {
    try {
      const checkResult = await db.query("SELECT * FROM users_login WHERE email_address = $1", [username]);
      if (checkResult.rows.length > 0) {
        const user = checkResult.rows[0];
        const hash = user.password;
        bcrypt.compare(password, hash, (err, result) => {
          if (err) {
            return done(err, "Error comparing password:");
          } else {
            if (!result) {
              return done(null, false);
            } else {
              return done(false, user);
            }
          }
        });
      } else {
        return done("User not found");
      }
    } catch (error) {
      return done(error);
    }
  })
);

// Google OAuth2 strategy
passport.use(
  "google",
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/blog",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        console.log(profile.email);
        const result = await db.query("SELECT * FROM users_login WHERE email_address = $1", [
          profile.email,
        ]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users_login (email_address, password) VALUES ($1, $2)",
            [profile.email, "google"]
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});