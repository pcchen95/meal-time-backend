const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3001;
const userController = require('./controllers/user');

const upload = multer();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(flash());
app.use((req, res, next) => {
  res.locals.username = req.session.username;
  res.locals.errMessage = req.flash('errMessage');
  next();
});

function redirectBack(req, res) {
  res.redirect('back');
}

app.get('/register', userController.register);
app.post(
  '/register',
  upload.single('avatar'),
  userController.handleRegister,
  redirectBack
);
app.get('/login', userController.login);
app.post('/login', userController.handleLogin, redirectBack);
app.get('/logout', userController.logout);

app.get('/user/profile', userController.update);
app.post('/user/profile/:id', userController.handleUpdate, redirectBack);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
