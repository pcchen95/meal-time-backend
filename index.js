const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const ensureToken = require('./auth/ensureToken');
const secretKey = require('./auth/secretKey');

const app = express();
const port = process.env.PORT || 3001;
const userController = require('./controllers/user');
const vendorController = require('./controllers/vendor');
const productController = require('./controllers/product')
const orderController = require('./controllers/order')
const faqController = require('./controllers/faq');
const messageController = require('./controllers/message');

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
app.patch('/users/password', ensureToken, userController.updatePassword);

app.get('/vendors/me', ensureToken, vendorController.getVendorMe);
app.get('/vendors/:id', ensureToken, vendorController.getVendorById);
app.get('/vendors', ensureToken, vendorController.getAllVendors);
const vendorImgUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);
app.post(
  '/vendors/register',
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

app.get('/messages/me', ensureToken, messageController.getAllClientMessages);
app.get('/messages/:id', ensureToken, messageController.getClientMessage);
app.post('/messages/:id', ensureToken, messageController.messageToVendor);
app.get(
  '/messages/vendor/me',
  ensureToken,
  messageController.getAllVendorMessages
);
app.get(
  '/messages/vendor/:id',
  ensureToken,
  messageController.getVendorMessage
);
app.post(
  '/messages/vendor/:id',
  ensureToken,
  messageController.messageToClient
);
app.get(
  '/message-to-admin/me',
  ensureToken,
  messageController.getMessagesToAdmin
);
app.post('/message-to-admin', ensureToken, messageController.messageToAdmin);
app.get('/admin/messages/:id', ensureToken, messageController.getAdminMessage);
app.get('/admin/messages', ensureToken, messageController.getAllAdminMessages);
app.post(
  '/admin/messages/:id',
  ensureToken,
  messageController.messageFromAdminToUser
);

app.get('/faq', faqController.getAllFaqs);
app.get('/faq/:id', faqController.getFaq);
app.post('/faq', ensureToken, faqController.addFaq);
app.patch('/faq/:id', ensureToken, faqController.updateFaq);
app.delete('/faq/:id', ensureToken, faqController.deleteFaq);
app.get('/faq-category', faqController.getAllFaqCategories);
app.get('/faq-category/:id', faqController.getFaqCategory);
app.post('/faq-category', ensureToken, faqController.addFaqCategory);
app.patch('/faq-category/:id', ensureToken, faqController.updateFaqCategory);
app.delete('/faq-category/:id', ensureToken, faqController.deleteFaqCategory);

app.get("/products/:id", productController.getInfo)
app.get("/products", productController.getAllInfo)
app.get("/products/vendor/:id", productController.searchByVendor)
app.get("/products/categories/:id", productController.searchByCategory)
app.get("/products/search/:keyword", productController.searchByKeyword)
app.post("/products/new", productController.handleAdd)
app.patch("/products/:id", productController.handleUpdate)
app.delete("/products/:id", productController.handleDelete)


app.get("/products-categories", productCategoriesController.getAll)
app.post("/products-categories", productCategoriesController.newCategory)
app.patch(
  "/products-categories/:id",
  productCategoriesController.updateCategory
)
app.delete(
  "/products-categories/:id",
  productCategoriesController.deleteCategory
)

app.get("/products-categories", vendorCategoriesController.getAll)
app.post("/products-categories", vendorCategoriesController.newCategory)
app.patch("/products-categories/:id", vendorCategoriesController.updateCategory)
app.delete(
  "/products-categories/:id",
  vendorCategoriesController.deleteCategory
)

app.get("/orders", orderController.getAll)
app.get("/orders/:id", orderController.getOne)
app.get("/orders/buy/:id", orderController.getBuy)
app.get("/orders/sell/:id", orderController.getSell)
app.post("orders/new", orderController.newOrder)
app.patch("/orders/:id/complete", orderController.completeOrder)
app.patch("/orders/:id/pay", orderController.payOrder)
app.patch("/orders/:id/cancel", orderController.cancelOrder)
app.delete("/orders/:id", orderController.deleteOrder)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
