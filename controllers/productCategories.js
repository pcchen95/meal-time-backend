const db = require("../models")

const { ProductCategories } = db

const productCategoriesController = {
  getAll: async (req, res) => {
    try {
      const productCategories = await ProductCategories.findAll()
      return res.json({
        ok: 1,
        data: productCategories,
      })
    } catch (err) {
      return res.send({
        ok: 0,
        message: err.toString(),
      })
    }
  },
  newCategory: async (req, res) => {
    const name = req.body.name
    try {
      const productCategory = await ProductCategories.create({ name })
      return res.json({
        ok: 1,
        data: productCategory,
      })
    } catch (err) {
      return res.send({
        ok: 0,
        message: err.toString(),
      })
    }
  },
  updateCategory: async (req, res) => {
    const id = req.params.id
    const name = req.body.name
    try {
      const productCategory = await ProductCategories.findOne({
        where: {
          id,
        },
      })
      productCategory.name = name
      await productCategory.save()
      return res.json({
        ok: 1,
        data: productCategory,
      })
    } catch (err) {
      return res.send({
        ok: 0,
        message: err.toString(),
      })
    }
  },
  deleteCategory: async (req, res) => {
    const id = req.params.id
    try {
      await ProductCategories.destroy({
        where: {
          id,
        },
      })
      return res.json({
        ok: 1,
        message: "Success",
      })
    } catch (err) {
      return res.send({
        ok: 0,
        message: err.toString(),
      })
    }
  },
}

module.exports = productCategoriesController
