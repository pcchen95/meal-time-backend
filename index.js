const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3001;
const userController = require('./controllers/user');
const vendorController = require('./controllers/vendor');

const upload = multer();

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/users/:id', userController.getProfile);
app.get('/users', userController.getAllProfiles);
app.post(
  '/users/register',
  upload.single('avatar'),
  userController.handleRegister
);
app.post('/users/login', userController.handleLogin);
app.patch('/users/:id', upload.single('avatar'), userController.handleUpdate);
app.patch('/users/auth/:id', userController.handleUpdateRole);
app.patch('/users/password/:id', userController.handleUpdatePassword);

app.get('/vendors/:id', vendorController.getVendor);
app.get('/vendors', vendorController.getAllVendors);
const vendorImgUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);
app.post(
  '/vendors/register/:id',
  vendorImgUpload,
  vendorController.handleRegister
);
app.patch('/vendors/:id', vendorImgUpload, vendorController.handleUpdate);
app.patch('/vendors/auth/:id', vendorController.handleUpdateAuth);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
