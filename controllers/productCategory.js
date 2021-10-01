const db = require('../models')
const secretKey = require('../auth/secretKey')
const jwt = require('jsonwebtoken')
const { ProductCategory } = db

const productCategoryController = {
  getAll: async (req, res) => {
    try {
      const productCategories = await ProductCategory.findAll()
      return res.json({
        ok: 1,
        data: productCategories,
      })
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      })
    }
  },
  addCategory: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
      if (decoded.payload.role !== 'admin') {
        return res.status(401).json({
          ok: 0,
          message: 'you are not authorized',
        })
      }
      const name = req.body.name
      try {
        const productCategory = await ProductCategory.create({ name })
        return res.status(200).json({
          ok: 1,
          data: productCategory,
        })
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
    })
  },
  updateCategory: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
      if (decoded.payload.role !== 'admin') {
        return res.status(401).json({
          ok: 0,
          message: 'you are not authorized',
        })
      }
      const id = req.params.id
      const name = req.body.name
      try {
        const productCategory = await ProductCategory.findOne({
          where: {
            id,
          },
        })
        productCategory.name = name
        await productCategory.save()
        return res.status(200).json({
          ok: 1,
          data: productCategory,
        })
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
    })
  },
  deleteCategory: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
      if (decoded.payload.role !== 'admin') {
        return res.status(401).json({
          ok: 0,
          message: 'you are not authorized',
        })
      }
      const id = req.params.id
      try {
        await ProductCategory.destroy({
          where: {
            id,
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

module.exports = productCategoryController
