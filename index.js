const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const multer = require('multer')
const ensureToken = require('./auth/ensureToken')
const cors = require('cors')
const secretKey = require('./auth/secretKey')

const port = process.env.PORT || 3001

const userController = require('./controllers/user')
const vendorController = require('./controllers/vendor')
const vendorCategoryController = require('./controllers/vendorCategory')
const productController = require('./controllers/product')
const orderController = require('./controllers/order')
const productCategoryController = require('./controllers/productCategory')
const messageController = require('./controllers/message')
const faqController = require('./controllers/faq')
const app = express()

const upload = multer()

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  })
)
app.use(cors())

const vendorImgUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
])
app.options('*', cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/* User */
app.post('/users/register', upload.single('avatar'), userController.register)
app.post('/users/login', userController.login)
app.get('/users/profile', ensureToken, userController.getAllProfiles)
app.get('/users/profile/me', ensureToken, userController.getMe)
app.patch(
  '/users/profile/me',
  ensureToken,
  upload.single('avatar'),
  userController.updateMe
)
app.patch('/users/password', ensureToken, userController.updatePassword)
app.get('/users/profile/:id', ensureToken, userController.getProfileById)

app.patch(
  '/users/profile/:id',
  ensureToken,
  upload.single('avatar'),
  userController.updateById
)

app.patch('/users/auth/:id', ensureToken, userController.updateRole)

/* Vendor */
app.post(
  '/vendors/register',
  ensureToken,
  vendorImgUpload,
  vendorController.register
)
app.get('/vendors/profile/me', ensureToken, vendorController.getVendorMe)
app.patch(
  '/vendors/profile/me',
  ensureToken,
  vendorImgUpload,
  vendorController.updateVendorMe
)

app.get('/vendors/profile/:id', vendorController.getAvailableVendorById)
app.get(
  '/vendors/admin/profile/:id',
  ensureToken,
  vendorController.getVendorById
)
app.get('/vendors/profile', vendorController.getAvailableVendors)
app.get('/vendors/admin/profile', ensureToken, vendorController.getAllVendors)
app.patch(
  '/vendors/profile/:id',
  ensureToken,
  vendorImgUpload,
  vendorController.updateById
)
app.patch('/vendors/set-open', ensureToken, vendorController.setIsOpen)
app.patch('/vendors/auth/:id', ensureToken, vendorController.updateAuth)

/* VendorCategory */
app.get('/vendor-categories', vendorCategoryController.getAllCategories)
app.get(
  '/vendor-categories/:id',
  ensureToken,
  vendorCategoryController.getCategory
)
app.post(
  '/vendor-categories',
  ensureToken,
  vendorCategoryController.addCategory
)
app.patch(
  '/vendor-category/:id',
  ensureToken,
  vendorCategoryController.updateCategory
)
app.delete(
  '/vendor-category/:id',
  ensureToken,
  vendorCategoryController.deleteCategory
)

/* Message */
app.get('/messages', ensureToken, messageController.getAllClientMessages)
app.get('/messages/:id', ensureToken, messageController.getClientMessage)
app.get('/messages/vendor', ensureToken, messageController.getAllVendorMessages)
app.get('/messages/vendor/:id', ensureToken, messageController.getVendorMessage)
app.post('/messages/:id', ensureToken, messageController.messageToVendor)
app.post('/messages/vendor/:id', ensureToken, messageController.messageToClient)
app.get('/messages-to-admin', ensureToken, messageController.getMessagesToAdmin)
app.post('/messages-to-admin', ensureToken, messageController.messageToAdmin)
app.get(
  '/messages-to-admin/admin',
  ensureToken,
  messageController.getAllAdminMessages
)
app.get(
  '/messages-to-admin/admin/:id',
  ensureToken,
  messageController.getAdminMessage
)
app.post(
  '/messages-to-admin/admin/:id',
  ensureToken,
  messageController.messageFromAdminToUser
)
app.post('/report-messages', ensureToken, messageController.reportToAdmin)
app.get(
  '/report-messages/admin',
  ensureToken,
  messageController.getAllReportMessages
)
app.get(
  '/report-messages/admin/:id',
  ensureToken,
  messageController.getReportMessage
)

/* FAQ */
app.get('/faqs', faqController.getAllFaqs)
app.get('/faqs/:id', faqController.getFaq)
app.post('/faqs', ensureToken, faqController.addFaq)
app.patch('/faqs/:id', ensureToken, faqController.updateFaq)
app.delete('/faqs/:id', ensureToken, faqController.deleteFaq)
app.get('/faq-categories', faqController.getAllFaqCategories)
app.get('/faq-categories/:id', ensureToken, faqController.getFaqCategory)
app.post('/faq-categories', ensureToken, faqController.addFaqCategory)
app.patch('/faq-categories/:id', ensureToken, faqController.updateFaqCategory)
app.delete('/faq-categories/:id', ensureToken, faqController.deleteFaqCategory)

app.get('/faq', faqController.getAllFaqs)
app.get('/faq/:id', faqController.getFaq)
app.post('/faq', ensureToken, faqController.addFaq)
app.patch('/faq/:id', ensureToken, faqController.updateFaq)
app.delete('/faq/:id', ensureToken, faqController.deleteFaq)
app.get('/faq-category', faqController.getAllFaqCategories)
app.get('/faq-category/:id', faqController.getFaqCategory)
app.post('/faq-category', ensureToken, faqController.addFaqCategory)
app.patch('/faq-category/:id', ensureToken, faqController.updateFaqCategory)
app.delete('/faq-category/:id', ensureToken, faqController.deleteFaqCategory)

app.get('/products', productController.getAllInfo)
app.get('/products/search', productController.searchByKeyword)
app.get(
  '/products/vendor/manage/:id',
  ensureToken,
  productController.getByVendorManage
)

app.get('/products/vendor/:id', productController.getByVendor)

app.get('/products/category/:id', productController.getByCategory)
app.get('/products/:id', productController.getInfo)
app.post(
  '/products',
  ensureToken,
  upload.single('picture'),
  productController.addProduct
)
app.patch(
  '/products/:id',
  ensureToken,
  upload.single('picture'),
  productController.updateProduct
)
app.delete('/products/:id', ensureToken, productController.deleteProduct)

app.post('/cart', productController.getCartData)

app.get('/products-categories', productCategoryController.getAll)
app.post(
  '/products-categories',
  ensureToken,
  productCategoryController.addCategory
)
app.patch(
  '/products-categories/:id',
  ensureToken,
  productCategoryController.updateCategory
)
app.delete(
  '/products-categories/:id',
  ensureToken,
  productCategoryController.deleteCategory
)

app.get('/orders', ensureToken, orderController.getAll)
app.get('/orders/buy', ensureToken, orderController.getBuy)
app.get('/orders/sell', ensureToken, orderController.getSell)
app.get('/orders/:id', ensureToken, orderController.getOne)
app.post('/orders', ensureToken, orderController.addOrder)
app.patch('/orders/complete/:id', ensureToken, orderController.completeOrder)
app.patch('/orders/cancel/:id', ensureToken, orderController.cancelOrder)
app.delete('/orders/:id', ensureToken, orderController.deleteOrder)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
