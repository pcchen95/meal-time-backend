const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const ensureToken = require('./auth/ensureToken');

const app = express();
const port = process.env.PORT || 3001;
const userController = require('./controllers/user');
const vendorController = require('./controllers/vendor');


const upload = multer()

app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/users/me', ensureToken, userController.getMe);
app.get('/users/:id', ensureToken, userController.getProfileById);
app.get('/users', ensureToken, userController.getAllProfiles);
app.post('/users/register', upload.single('avatar'), userController.register);
app.post('/users/login', userController.login);
app.patch(
  '/users/me',
  ensureToken,
  upload.single('avatar'),
  userController.updateMe
);
app.patch(
  '/users/:id',
  ensureToken,
  upload.single('avatar'),
  userController.updateById
);
app.patch('/users/auth/:id', ensureToken, userController.updateRole);
app.patch('/users/password/:id', ensureToken, userController.updatePassword);
app.patch('/users/password/:id', ensureToken, userController.updatePassword);
app.post('/users/message/:id', ensureToken, userController.messageToVendor);

app.get('/vendors/me', ensureToken, vendorController.getVendorMe);
app.get('/vendors/:id', ensureToken, vendorController.getVendorById);
app.get('/vendors', ensureToken, vendorController.getAllVendors);
const vendorImgUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);
app.post(
  '/vendors/register/:id',
  ensureToken,
  vendorImgUpload,
  vendorController.register
);
app.patch(
  '/vendors/me',
  ensureToken,
  vendorImgUpload,
  vendorController.updateVendorMe
);
app.patch(
  '/vendors/:id',
  ensureToken,
  vendorImgUpload,
  vendorController.updateById
);
app.patch('/vendors/auth/:id', ensureToken, vendorController.updateAuth);

app.get("/products/:id", productController.getInfo)
app.get("/products", productController.getAllInfo)
app.get("/products/vendor/:id", productController.searchByVendor)
app.get("/products/categories/:id", productController.searchByCategory)
app.get("/products/search/:keyword", productController.searchByKeyword)
app.post("/products/new", productController.handleAdd)
app.patch("/products/:id", productController.handleUpdate)
app.delete("/products/:id", productController.handleDelete)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
