const bcrypt = require("bcrypt")
const db = require("../models")
const { uploadImg, deleteImg } = require("./imgur.js")

const saltRounds = 10
const { Product } = db
const album = "gpxFA0k"

const productController = {
  getProdoctInfo: async (req, res) => {
    const id = req.params.id
    try {
      const procuct = await Product.findOne({
        where: {
          id,
        },
      })
      return res.json({
        ok: 1,
        data: procuct
      })
    } catch (err) {
      return res.send({
        ok: 0,
        message:err.toString()
      })
    }
  },

  getAllProdoctsInfo: async (req, res) => {
    try {
      const products = await Product.findAll()
      return res.json({
        ok: 1,
        data: products})
    } catch (err) {
      return res.send({
        ok: 0,
        message:err.toString()
      })
    }
  },

  handleAdd: async (req, res) => {
    const {
      vendorId,
      name,
      categoryId,
      price,
      quantity,
      manufactureDate,
      expiryDate,
      description,
      isAvailable,
    } = req.body.productData
    const picture = req.file
    try {
      if (picture) {
        const encodeImage = avatar.buffer.toString("base64")
        uploadImg(encodeImage, album, (err, link) => {
          await Product.create({
            vendorId,
            name,
            categoryId,
            pictureUrl: link,
            price,
            quantity,
            manufactureDate,
            expiryDate,
            description,
            isAvailable,
          })
          return res.json({
            ok: 1,
            message: 'Success',
          });
        })
      }
    } catch (err) {
      return res.json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  handleUpdate: async (req, res) => {
    const id = req.params.id
    const {
      name,
      categoryId,
      price,
      quantity,
      manufactureDate,
      expiryDate,
      description,
      isAvailable,
    } = req.body.productData
    const picture = req.file
    try {
      if (picture) {
        const encodeImage = avatar.buffer.toString("base64")
        uploadImg(encodeImage, album, (err, link) => {
      const updateProduct = await Product.findOne({
        where: {
          id,
        },
      })
      if (name) updateProduct.name = name
      if (categoryId) updateProduct.categoryId = categoryId
      if (pictureUrl) updateProduct.pictureUrl = pictureUrl
      if (price) updateProduct.price = price
      if (quantity) updateProduct.quantity = quantity
      if (manufactureDate) updateProduct.manufactureDate = manufactureDate
      if (expiryDate) updateProduct.expiryDate = expiryDate
      if (description) updateProduct.description = description
      if (isAvailable) updateProduct.isAvailable = isAvailable

      await updateProduct.save()
      return res.json({
        ok: 1,
        message: 'Success',
      });
        })
      }
    } catch (err) {
      return res.json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  handleDelete: async (req, res) => {
    const id = req.params.id
    try {
      await Product.destroy({
        where: {
          id,
        },
      })
      return res.json({
        ok: 1,
        message: 'Success',
      });
    } catch (err) {
      return res.json({
        ok: 0,
        message: err.toString(),
      });
    }
  },
}

module.exports = productController