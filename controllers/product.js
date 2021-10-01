const { Op } = require('sequelize')
const db = require('../models')
const { uploadImg, deleteImg } = require('./imgur.js')
const jwt = require('jsonwebtoken')
const secretKey = require('../auth/secretKey')
const { Product, ProductCategory, Vendor } = db
const album = 'gpxFA0k'

const productController = {
  getInfo: async (req, res) => {
    const id = req.params.id
    try {
      const procuct = await Product.findOne({
        where: {
          id,
        },
        include: [
          {
            model: ProductCategory,
          },
          {
            model: Vendor,
            attributes: ['vendorName', 'avatarUrl', 'categoryId'],
          },
        ],
      })
      return res.status(200).json({
        ok: 1,
        data: procuct,
      })
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      })
    }
  },

  getByVendor: async (req, res) => {
    const id = req.params.id
    try {
      const procucts = await Product.findAll({
        where: {
          vendorId: id,
        },
        include: [
          {
            model: ProductCategory,
          },
          {
            model: Vendor,
            attributes: ['vendorName', 'avatarUrl', 'categoryId'],
          },
        ],
      })
      return res.status(200).json({
        ok: 1,
        data: procucts,
      })
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      })
    }
  },

  getByCategory: async (req, res) => {
    const id = req.params.id
    try {
      const procucts = await Product.findAll({
        where: {
          categoryId: id,
        },
        include: [
          {
            model: ProductCategory,
          },
          {
            model: Vendor,
            attributes: ['vendorName', 'avatarUrl', 'categoryId'],
          },
        ],
      })
      return res.status(200).json({
        ok: 1,
        data: procucts,
      })
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      })
    }
  },

  getAllInfo: async (req, res) => {
    try {
      const products = await Product.findAll({
        include: [
          {
            model: ProductCategory,
          },
          {
            model: Vendor,
            attributes: ['vendorName', 'avatarUrl', 'categoryId'],
          },
        ],
      })
      return res.status(200).json({
        ok: 1,
        data: products,
      })
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      })
    }
  },

  searchByKeyword: async (req, res) => {
    const keyword = req.query.keyword
    try {
      const productCategories = await ProductCategory.findAll({
        where: {
          name: {
            [Op.substring]: keyword,
          },
        },
      })
      const productCategoriesList = productCategories.map(
        (category) => category.id
      )
      const products = await Product.findAll({
        where: {
          [Op.or]: [
            {
              name: {
                [Op.substring]: keyword,
              },
            },
            {
              description: {
                [Op.substring]: keyword,
              },
            },
            {
              categoryId: {
                [Op.in]: productCategoriesList,
              },
            },
          ],
          quantity: {
            [Op.gt]: 0,
          },
        },
        include: [
          {
            model: ProductCategory,
          },
          {
            model: Vendor,
            attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
          },
        ],
      })
      if (!products) {
        throw new Error()
      }
      return res.status(200).json({
        ok: 1,
        data: products,
      })
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      })
    }
  },

  addProduct: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
      console.log(decoded.payload)
      const vendorId = decoded.payload.vendorId
      const {
        name,
        categoryId,
        price,
        quantity,
        manufactureDate,
        expiryDate,
        description,
        isAvailable,
      } = req.body
      const picture = req.file
      try {
        if (picture) {
          const encodeImage = picture.buffer.toString('base64')
          uploadImg(encodeImage, album, async (err, link) => {
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
            })
          })
        }
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
    })
  },

  updateProduct: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
      const vendorId = decoded.payload.vendorId
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
      } = req.body
      const picture = req.file
      try {
        const updateProduct = await Product.findOne({
          where: {
            id,
            vendorId,
          },
        })
        if (picture) {
          deleteImg(updateProduct.pictureUrl, (err) => {
            if (err) {
              return res.status(500).json({
                ok: 0,
                message: err.toString(),
              })
            }
          })
          const encodeImage = picture.buffer.toString('base64')
          uploadImg(encodeImage, album, async (err, link) => {
            updateProduct.pictureUrl = link
            if (name) updateProduct.name = name
            if (categoryId) updateProduct.categoryId = categoryId
            if (price) updateProduct.price = price
            if (quantity) updateProduct.quantity = quantity
            if (manufactureDate) updateProduct.manufactureDate = manufactureDate
            if (expiryDate) updateProduct.expiryDate = expiryDate
            if (description) updateProduct.description = description
            if (isAvailable) updateProduct.isAvailable = isAvailable

            await updateProduct.save()
            return res.status(200).json({
              ok: 1,
              message: 'Success',
            })
          })
        } else {
          if (name) updateProduct.name = name
          if (categoryId) updateProduct.categoryId = categoryId
          if (price) updateProduct.price = price
          if (quantity) updateProduct.quantity = quantity
          if (manufactureDate) updateProduct.manufactureDate = manufactureDate
          if (expiryDate) updateProduct.expiryDate = expiryDate
          if (description) updateProduct.description = description
          if (isAvailable) updateProduct.isAvailable = isAvailable
          await updateProduct.save()
          return res.status(200).json({
            ok: 1,
            message: 'Success',
          })
        }
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
    })
  },

  deleteProduct: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
      const vendorId = decoded.payload.vendorId
      const id = req.params.id
      try {
        await Product.destroy({
          where: {
            id,
            vendorId,
          },
        })
        return res.status(200).json({
          ok: 1,
          message: 'Success',
        })
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
    })
  },
}

module.exports = productController
