const express = require('express');
const PORT = process.env.PORT || 8080;
//const cookieParser = require('cookie-parser');
const app = express();
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
app.set("view engine", "ejs");
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['TiNyUrLpRoJeCt'],
  maxAge: 24 * 60 * 60 * 1000
}));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "db2xVn2": {
    original:"http://www.lighthouselabs.ca",
    userID:"1"},
  "9sm5xK": {
    original:"http://www.google.com",
    userID:"2"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

const urlsForUser = (id) => {
  let list = {};
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      list[key] = urlDatabase[key].original;
    }
  } return list;
};
//root directory
app.get("/", (req,res) => {
  let head = "Hello There!";
  let temVars = {
    head: head,
    user: users[req.session.id]
  };
  if (!req.session.id) {
    res.render('urls_main', temVars);
  } else {
    res.redirect("/urls");
  }
});
//url.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
//main page, render urls_b2xVn2.ejs
app.get("/urls", (req, res) => {
  let title = "Your URLs";
  let templateVars = {
    title: title,
    urls: urlDatabase,
    // username : req.cookies['username'],
    user: users[req.session.id],
    list: urlsForUser(req.session.id)
  };
  //console.log(templateVars);
  //console.log(urlsForUser(req.session.id));
  res.render("urls_index",templateVars);
  // console.log(templateVars.username);
});
//hello page
app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});
//link to urls_new to enter a new URL
app.get('/urls/new', (req, res) => {
  let userName= {
    user: users[req.session.id],
    loggedIn : req.session.email
  };
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
//new shortURL generator
app.post("/urls", (req, res) => {
  //console.log(req.body);
  let key = generateRandomString();
  let holder = {};
  holder['original'] = req.body.longURL;
  holder['userID'] = req.session.id;
  urlDatabase[key] = holder;
  res.redirect('/urls');
});
//page to update a longURL
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404)
   .send('Not found');
  } else {
  let longURL = urlDatabase[req.params.shortURL].original;
  //console.log(req.params);
  res.redirect(longURL);
  }
});
//registration page
app.get('/register', (req, res) => {
  let registration = {user: users[req.session.id]};
  res.render('urls_registration',registration);
});
//link to urls_registration to collect email and password
app.post('/register', (req, res) => {
  for (let key in users) {
    //console.log(users[keys]);
    //console.log(users);
   if (req.body.email === users[key].email) {
     res.status(400).send('Already registered!Please login.');
    }
  }
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Please enter email and password to register!');
  } else {
    let hashedPassword = bcrypt.hashSync(req.body.password,10);
    let random = generateRandomString();
    req.session.id = random;
    req.session.email = req.body.email;
    req.session.password = hashedPassword;
    let holder = {};
    holder['id'] = random;
    holder['email']= req.body.email;
    holder['password'] = hashedPassword;
    users[random] = holder;
  // console.log(holder);
  // console.log(users[random]['id']);
    //console.log(req.body.email);
    //console.log(req.cookies.email);
    //console.log(req.cookies.password);
    res.redirect('/urls');
  }
});
//link to urls_index to delete a existing URL
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
app.post('/urls/:id/update', (req, res) => {
  let urlShortID = req.params.id;
  res.redirect(`/urls/${urlShortID}`);
});
//page about a short URL and possible to update-> link to urls_show
app.get("/urls/:id", (req, res) => {
  let shURL = {
    shortURL: req.params.id,
    UrlID: urlDatabase[req.params.id].userID,
    //username: req.cookies.username,
    user: users[req.session.id]
  };
  // console.log(req.params.id);
  // console.log(users[req.cookies.id].id);
  res.render("urls_show", shURL);
});
//activated when update is submitted
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id]['original'] = req.body.newURL;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  let login = {
    //username: req.cookies.username,
    user: users[req.session.id]
  };
  if (!req.session.id) {
    res.render('urls_login',login);
  } else {
    res.redirect('/urls');
  }
});
//link to _header.ejs to login
app.post('/login', (req, res) => {
  for (let key in users) {
    if(users[key]['email'] === req.body.email) {
      if (bcrypt.compareSync(req.body.password,users[key].password)) {
        req.session.email = req.body.email;
        req.session.password = users[key].password;
        req.session.id = key;
        res.redirect('/urls');
      } else {
        res.status(403).send('Wrong password');
      }
    }
  }
  res.status(403).send('User not found. Please register!');
});
//link to _header.ejs to log out
app.post('/logout', function (req, res) {
  //res.clearCookie('username');
  //res.clearCookie('id');
  //res.clearCookie('email');
  //res.clearCookie('password');
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});