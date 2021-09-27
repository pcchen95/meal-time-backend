const express = require("express")
const bodyParser = require("body-parser")
const session = require("express-session")
const multer = require("multer")

const app = express()
const port = process.env.PORT || 3001
const userController = require("./controllers/user")
const productCategoriesController = require("./controllers/productCategories")
const vendorCategoriesController = require("./controllers/vendorCategories")

const upload = multer()

app.set("view engine", "ejs")
app.use(express.static("public"))

app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/users/profile/:id", userController.getProfile)
app.get("/users/profiles", userController.getAllProfiles)
app.post(
  "/users/register",
  upload.single("avatar"),
  userController.handleRegister
)
app.post("/users/login", userController.handleLogin)
app.post(
  "/users/profile/:id",
  upload.single("avatar"),
  userController.handleUpdate
)
app.post("/users/auth/:id", userController.handleUpdateRole)

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

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
