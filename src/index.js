const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 8080;

// CS5356 TODO #2
const firebaseConfig = {
  apiKey: "AIzaSyCkgDsAgcpN5sRZzwsHfmjg-C5REC1NeEg",
  authDomain: "cs5356-milestone-1-b7072.firebaseapp.com",
  projectId: "cs5356-milestone-1-b7072",
  storageBucket: "cs5356-milestone-1-b7072.appspot.com",
  messagingSenderId: "573209954693",
  appId: "1:573209954693:web:6fcae74e00e123d3bd5cec",
  measurementId: "G-CPJDK3F4XS"
};
// Uncomment this next line after you've created
// serviceAccountKey.json
const serviceAccount = require("./../config/serviceAccountKey.json");
const userFeed = require("./app/user-feed");
const authMiddleware = require("./app/auth-middleware");

// CS5356 TODO #2
// Uncomment this next block after you've created serviceAccountKey.json
admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
});

// use cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/static", express.static("static/"));

app.get('/style.css', function(req, res) {
  res.sendFile(__dirname + "/css/style.css");
});

// use res.render to load up an ejs view file
// index page
app.get("/", function (req, res) {
  res.render("pages/index");
});

app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
  res.render("pages/sign-up");
});

app.get("/dashboard", authMiddleware, async function (req, res) {
  const feed = await userFeed.get();
  res.render("pages/dashboard", { user: req.user, feed });
});

app.post("/sessionLogin", async (req, res) => {
  // CS5356 TODO #4
  // Get the ID token from the request body
  // Create a session cookie using the Firebase Admin SDK
  // Set that cookie with the name 'session'
  // And then return a 200 status code instead of a 501
  const idToken = req.body.idToken.toString();
  
  const expiresIn = 60 * 60 * 24 * 7 * 1000;
  admin.auth().createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        // Set cookie policy for session cookie.
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        res.cookie('session', sessionCookie, options);
        res.status(200).send();
      },
      (error) => {
        res.status(401).send('UNAUTHORIZED REQUEST!'); 
      }
    );
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/sign-in");
});

app.post("/dog-messages", authMiddleware, async (req, res) => {
  // CS5356 TODO #5
  // Get the message that was submitted from the request body
  // Get the user object from the request body
  // Add the message to the userFeed so its associated with the user
  try {
    const message = req.body;
    userFeed.add(req.user, message.message)
      .then(() => {
        res.redirect('/dashboard');
      })
  } catch (error){
    res.status(500).send({message: error}); 
  };
});

app.listen(port);
console.log("Server started at http://localhost:" + port);
