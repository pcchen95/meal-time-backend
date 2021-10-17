const { Op } = require('sequelize')
const db = require('../models')
const { uploadImg, deleteImg } = require('./imgur.js')
const jwt = require('jsonwebtoken')
const secretKey = require('../auth/secretKey')
const { Product, ProductCategory, Vendor, VendorCategory } = db
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
            attributes: ['id', 'name'],
          },
          {
            model: Vendor,
            attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
            include: [{ model: VendorCategory, attributes: ['id', 'name'] }],
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
    let { page, limit, sort, order } = req.query
    const _page = Number(page) || 1
    const _limit = limit ? parseInt(limit) : 10
    const _offset = (_page - 1) * _limit
    const _sort = sort || 'id'
    const _order = order || 'DESC'
    try {
      const procucts = await Product.findAndCountAll({
        where: {
          quantity: {
            [Op.gt]: 0,
          },
          isAvailable: true,
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
        limit: _limit,
        offset: _offset,
        order: [[_sort, _order]],
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
    let { page, limit, sort, order } = req.query
    const _page = Number(page) || 1
    const _limit = limit ? parseInt(limit) : 10
    const _offset = (_page - 1) * _limit
    const _sort = sort || 'id'
    const _order = order || 'DESC'
    try {
      const procucts = await Product.findAndCountAll({
        where: {
          quantity: {
            [Op.gt]: 0,
          },
          isAvailable: true,
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
        limit: _limit,
        offset: _offset,
        order: [[_sort, _order]],
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
    let { page, limit, sort, order } = req.query
    const _page = Number(page) || 1
    const _limit = limit ? parseInt(limit) : 10
    const _offset = (_page - 1) * _limit
    const _sort = sort || 'id'
    const _order = order || 'DESC'
    try {
      const products = await Product.findAndCountAll({
        where: {
          quantity: {
            [Op.gt]: 0,
          },
          isAvailable: true,
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
        limit: _limit,
        offset: _offset,
        order: [[_sort, _order]],
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
    let { page, limit, sort, order, keyword } = req.query
    const _page = Number(page) || 1
    const _limit = limit ? parseInt(limit) : 10
    const _offset = (_page - 1) * _limit
    const _sort = sort || 'id'
    const _order = order || 'DESC'
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
      const products = await Product.findAndCountAll({
        where: {
          quantity: {
            [Op.gt]: 0,
          },
          isAvailable: true,
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
        limit: _limit,
        offset: _offset,
        order: [[_sort, _order]],
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
            const product = await Product.create({
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
            return res.status(200).json({
              ok: 1,
              message: 'Success',
              data: {
                productId: product.id,
              },
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
              data: {
                productId: updateProduct.id,
              },
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
