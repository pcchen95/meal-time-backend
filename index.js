const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const ensureToken = require('./auth/ensureToken');
const secretKey = require('./auth/secretKey');

const app = express();
const port = process.env.PORT || 3001;
const userController = require('./controllers/user');
const vendorController = require('./controllers/vendor');
const vendorCategoryController = require('./controllers/vendorCategory');
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
);
app.use(cors());

const vendorImgUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);
app.options('*', cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/* User */
app.post('/users/register', upload.single('avatar'), userController.register);
app.post('/users/login', userController.login);
app.get('/users/profile/me', ensureToken, userController.getMe);
app.patch(
  '/users/profile/me',
  ensureToken,
  upload.single('avatar'),
  userController.updateMe
);
app.patch('/users/password', ensureToken, userController.updatePassword);
app.get('/users/profile/:id', ensureToken, userController.getProfileById);
app.patch(
  '/users/profile/:id',
  ensureToken,
  upload.single('avatar'),
  userController.updateById
);
app.get('/users/profile', ensureToken, userController.getAllProfiles);
app.patch('/users/auth/:id', ensureToken, userController.updateRole);

/* Vendor */
app.post(
  '/vendors/register',
  ensureToken,
  vendorImgUpload,
  vendorController.register
);
app.get('/vendors/profile/me', ensureToken, vendorController.getVendorMe);
app.patch(
  '/vendors/profile/me',
  ensureToken,
  vendorImgUpload,
  vendorController.updateVendorMe
);
app.get('/vendors/profile/:id', ensureToken, vendorController.getVendorById);
app.get('/vendors/profile', ensureToken, vendorController.getAllVendors);
app.patch(
  '/vendors/profile/:id',
  ensureToken,
  vendorImgUpload,
  vendorController.updateById
);
app.patch('/vendors/set-open', ensureToken, vendorController.setIsOpen);
app.patch('/vendors/auth/:id', ensureToken, vendorController.updateAuth);

/* VendorCategory */
app.get('/vendor-categories', vendorCategoryController.getAllCategories);
app.get(
  '/vendor-categories/:id',
  ensureToken,
  vendorCategoryController.getCategory
);
app.post(
  '/vendor-categories',
  ensureToken,
  vendorCategoryController.addCategory
);
app.patch(
  '/vendor-category/:id',
  ensureToken,
  vendorCategoryController.updateCategory
);
app.delete(
  '/vendor-category/:id',
  ensureToken,
  vendorCategoryController.deleteCategory
);

/* Message */
app.get('/messages', ensureToken, messageController.getAllClientMessages);
app.get('/messages/:id', ensureToken, messageController.getClientMessage);
app.get(
  '/messages/vendor',
  ensureToken,
  messageController.getAllVendorMessages
);
app.get(
  '/messages/vendor/:id',
  ensureToken,
  messageController.getVendorMessage
);
app.post('/messages/:id', ensureToken, messageController.messageToVendor);
app.post(
  '/messages/vendor/:id',
  ensureToken,
  messageController.messageToClient
);
app.get(
  '/messages-to-admin',
  ensureToken,
  messageController.getMessagesToAdmin
);
app.post('/messages-to-admin', ensureToken, messageController.messageToAdmin);
app.get(
  '/messages-to-admin/admin',
  ensureToken,
  messageController.getAllAdminMessages
);
app.get(
  '/messages-to-admin/admin/:id',
  ensureToken,
  messageController.getAdminMessage
);
app.post(
  '/messages-to-admin/admin/:id',
  ensureToken,
  messageController.messageFromAdminToUser
);
app.post('/report-messages', ensureToken, messageController.reportToAdmin);
app.get(
  '/report-messages/admin',
  ensureToken,
  messageController.getAllReportMessages
);
app.get(
  '/report-messages/admin/:id',
  ensureToken,
  messageController.getReportMessage
);

/* FAQ */
app.get('/faqs', faqController.getAllFaqs);
app.get('/faqs/:id', faqController.getFaq);
app.post('/faqs', ensureToken, faqController.addFaq);
app.patch('/faqs/:id', ensureToken, faqController.updateFaq);
app.delete('/faqs/:id', ensureToken, faqController.deleteFaq);
app.get('/faq-categories', faqController.getAllFaqCategories);
app.get('/faq-categories/:id', ensureToken, faqController.getFaqCategory);
app.post('/faq-categories', ensureToken, faqController.addFaqCategory);
app.patch('/faq-categories/:id', ensureToken, faqController.updateFaqCategory);
app.delete('/faq-categories/:id', ensureToken, faqController.deleteFaqCategory);

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
