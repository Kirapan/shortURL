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

app.get("/", (req,res) => {
  res.end("Hello!");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  var title = "Your URLs";
  let templateVars = {
    title: title,
    urls: urlDatabase,
    username : req.cookies['username']
  };
  //console.log(templateVars);
  res.render("urls_index",templateVars);
  console.log(templateVars.username);
});

app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

function generateRandomString() {
   let short = "";
   let set = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQESTUVWXYZ0123456789";
   for( let i=0; i < 6; i++ )
    short += set.charAt(Math.floor(Math.random() * set.length));
    return short;
}
//console.log(generateRandomString('www.example.com/sdfs/sdfsedsf/sdfs'));
app.post("/urls", (req, res) => {
  //console.log(req.body);
  urlDatabase[generateRandomString()] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404)
   .send('Not found');
  } else {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  }
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  let shURL = {shortURL: req.params.id };
  res.render("urls_show", shURL);
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);

  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});