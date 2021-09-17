const express = require('express');
const bodyParser = require('body-parser');
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

app.get('/users/profile/:id', userController.getProfile);
app.get('/users/profiles', userController.getAllProfiles);
app.post(
  '/users/register',
  upload.single('avatar'),
  userController.handleRegister
);
app.post('/users/login', userController.handleLogin);
app.post(
  '/users/profile/:id',
  upload.single('avatar'),
  userController.handleUpdate
);
app.post('/users/auth/:id', userController.handleUpdateRole);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
