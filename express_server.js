const express = require('express');
const PORT = process.env.PORT || 8080;
const cookieParser = require('cookie-parser');
const app = express();
app.set("view engine", "ejs");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};
//root directory
app.get("/", (req,res) => {
  res.end("Hello!");
});
//url.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
//main page, render urls_index.ejs
app.get("/urls", (req, res) => {
  let title = "Your URLs";
  let templateVars = {
    title: title,
    urls: urlDatabase,
    username : req.cookies['username'],
    user_id: users
  };
  //console.log(templateVars);
  res.render("urls_index",templateVars);
  // console.log(templateVars.username);
});
//hello page
app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});
//
app.get('/urls/new', (req, res) => {
  let userName= {username: req.cookies.username};
  res.render('urls_new',userName);
});
//URL generator
function generateRandomString() {
   let short = "";
   let set = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQESTUVWXYZ0123456789";
   for( let i=0; i < 6; i++ )
    short += set.charAt(Math.floor(Math.random() * set.length));
    return short;
}
//console.log(generateRandomString('www.example.com/sdfs/sdfsedsf/sdfs'));
//link to urls_new to enter a new URL
app.post("/urls", (req, res) => {
  //console.log(req.body);
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect('/urls');
});
//page to update a longURL
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404)
   .send('Not found');
  } else {
  let longURL = urlDatabase[req.params.shortURL];
  //console.log(req.params);
  res.redirect(longURL);
  }
});
//email registration page
app.get('/register', (req, res) => {
  let registration = {username: req.cookies.username};
  res.render('urls_registration',registration);
});
//link to urls_registration to collect email and password
app.post('/register', (req, res) => {
  for (let keys in users) {
    console.log(keys.email);
    console.log(users);
  //  if (req.body.email === String(keys.email)) {
    //  res.status(400).send('Already registered!');
    // }
  }
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Please enter email to register!');
  } else {
    res.cookie('email', req.body.email);
    res.cookie('password', req.body.password);
    let random = generateRandomString();
    let holder = {};
    holder['id'] = random;
    holder['email']= req.body.email;
    holder['password'] = req.body.password;
    users[random] = holder;
  // console.log(holder);
  // console.log(users[random]['id']);
    //console.log(req.body.email);
    //console.log(req.cookies.email);
    //console.log(req.cookies.password);
    res.redirect('/urls');
    console.log(users);
  }
});
//link to urls_index to delete a existing URL
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
//page about a short URL and possible to update-> link to urls_show
app.get("/urls/:id", (req, res) => {
  let shURL = {
    shortURL: req.params.id,
    username: req.cookies.username
  };
  res.render("urls_show", shURL);
});
//activated when update is submitted
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect('/urls');
});
app.get('/login', (req, res) => {
  let login = {username: req.cookies.username};
  res.render('urls_login',login);
})
//link to _header.ejs to login
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});
//link to _header.ejs to log out
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});