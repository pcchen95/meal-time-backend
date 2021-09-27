const express = require("express")
const bodyParser = require("body-parser")
const session = require("express-session")
const multer = require("multer")

const app = express()
const port = process.env.PORT || 3001
const userController = require("./controllers/user")
const productController = require("./controllers/product")
const orderController = require("./controllers/order")

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
