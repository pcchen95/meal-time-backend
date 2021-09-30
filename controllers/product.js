const { Op } = require('sequelize')
const db = require('../models')
const { uploadImg, deleteImg } = require('./imgur.js')
const jwt = require('jsonwebtoken')

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
      return res.json({
        ok: 1,
        data: procuct,
      })
    } catch (err) {
      return res.send({
        ok: 0,
        message: err.toString(),
      })
    }
  },

  searchByVendor: async (req, res) => {
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
      return res.json({
        ok: 1,
        data: procucts,
      })
    } catch (err) {
      return res.send({
        ok: 0,
        message: err.toString(),
      })
    }
  },

  searchByCategory: async (req, res) => {
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
      return res.json({
        ok: 1,
        data: procucts,
      })
    } catch (err) {
      return res.send({
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
      return res.json({
        ok: 1,
        data: products,
      })
    } catch (err) {
      return res.send({
        ok: 0,
        message: err.toString(),
      })
    }
  },

  searchByKeyword: async (req, res) => {
    const keyword = req.query.keyword
    let productCategories = {}
    try {
      productCategories = await ProductCategory.findAll({
        where: {
          name: {
            [Op.substring]: keyword,
          },
        },
      })
    } catch (err) {
      return res.send({
        ok: 0,
        message: err.toString(),
      })
    }

    try {
      const procucts = await Product.findAll({
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
                [Op.in]: productCategories.map((category) => category.id),
              },
            },
          ],
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
      return res.json({
        ok: 1,
        data: procucts,
      })
    } catch (err) {
      return res.send({
        ok: 0,
        message: err.toString(),
      })
    }
  },

  handleAdd: async (req, res) => {
    jwt.verify(req.token, 'my_secret_key', async (err, decoded) => {
      if (err) {
        return res.json({
          ok: 0,
          message: err.toString(),
        })
      }
      const userId = decoded.payload.userId
      try {
        const vendor = await Vendor.findOne({
          where: {
            userId,
          },
        })
        const vendorId = vendor.id
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
          return res.json({
            ok: 0,
            message: err.toString(),
          })
        }
      } catch (err) {
        return res.json({
          ok: 0,
          message: err.toString(),
        })
      }
    })
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
    } = req.body
    const picture = req.file
    try {
      if (picture) {
        const encodeImage = avatar.buffer.toString('base64')
        uploadImg(encodeImage, album, async (err, link) => {
          const updateProduct = await Product.findOne({
            where: {
              id,
            },
          })
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
          return res.json({
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
        return res.json({
          ok: 1,
          message: 'Success',
        })
      }
    } catch (err) {
      return res.json({
        ok: 0,
        message: err.toString(),
      })
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
      })
    } catch (err) {
      return res.json({
        ok: 0,
        message: err.toString(),
      })
    }
  },
}

module.exports = productController
