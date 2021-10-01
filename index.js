const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const multer = require('multer')
const ensureToken = require('./auth/ensureToken')

const port = process.env.PORT || 3001
const userController = require('./controllers/user')
const vendorController = require('./controllers/vendor')
const productController = require('./controllers/product')
const orderController = require('./controllers/order')
const productCategoryController = require('./controllers/productCategory')
const vendorCategoryController = require('./controllers/vendorCategory')
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

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/users/me', ensureToken, userController.getMe)
app.get('/users/:id', ensureToken, userController.getProfileById)
app.get('/users', ensureToken, userController.getAllProfiles)
app.post('/users/register', upload.single('avatar'), userController.register)
app.post('/users/login', userController.login)
app.patch(
  '/users/me',
  ensureToken,
  upload.single('avatar'),
  userController.updateMe
)
app.patch(
  '/users/:id',
  ensureToken,
  upload.single('avatar'),
  userController.updateById
)
app.patch('/users/auth/:id', ensureToken, userController.updateRole)
app.patch('/users/password', ensureToken, userController.updatePassword)

app.get('/vendors/me', ensureToken, vendorController.getVendorMe)
app.get('/vendors/:id', ensureToken, vendorController.getVendorById)
app.get('/vendors', ensureToken, vendorController.getAllVendors)
const vendorImgUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
])
app.post(
  '/vendors/register',
  ensureToken,
  vendorImgUpload,
  vendorController.register
)
app.patch(
  '/vendors/me',
  ensureToken,
  vendorImgUpload,
  vendorController.updateVendorMe
)
app.patch(
  '/vendors/:id',
  ensureToken,
  vendorImgUpload,
  vendorController.updateById
)
app.patch('/vendors/auth/:id', ensureToken, vendorController.updateAuth)

app.get('/messages/me', ensureToken, messageController.getAllClientMessages)
app.get('/messages/:id', ensureToken, messageController.getClientMessage)
app.post('/messages/:id', ensureToken, messageController.messageToVendor)
app.get(
  '/messages/vendor/me',
  ensureToken,
  messageController.getAllVendorMessages
)
app.get('/messages/vendor/:id', ensureToken, messageController.getVendorMessage)
app.post('/messages/vendor/:id', ensureToken, messageController.messageToClient)
app.get(
  '/message-to-admin/me',
  ensureToken,
  messageController.getMessagesToAdmin
)
app.post('/message-to-admin', ensureToken, messageController.messageToAdmin)
app.get('/admin/messages/:id', ensureToken, messageController.getAdminMessage)
app.get('/admin/messages', ensureToken, messageController.getAllAdminMessages)
app.post(
  '/admin/messages/:id',
  ensureToken,
  messageController.messageFromAdminToUser
)

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
app.get('/products/info/:id', productController.getInfo)
app.get('/products/search', productController.searchByKeyword)
app.get('/products/vendor/:id', productController.getByVendor)
app.get('/products/category/:id', productController.getByCategory)
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
  '/vendor-categories/:id',
  ensureToken,
  vendorCategoryController.updateCategory
)
app.delete(
  '/vendor-categories/:id',
  ensureToken,
  vendorCategoryController.deleteCategory
)

app.get('/orders', ensureToken, orderController.getAll)
app.get('/orders/info/:id', ensureToken, orderController.getOne)
app.get('/orders/buy', ensureToken, orderController.getBuy)
app.get('/orders/sell', ensureToken, orderController.getSell)
app.post('/orders', ensureToken, orderController.addOrder)
app.patch('/orders/complete/:id', ensureToken, orderController.completeOrder)
app.patch('/orders/cancel/:id', ensureToken, orderController.cancelOrder)
app.delete('/orders/:id', ensureToken, orderController.deleteOrder)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
