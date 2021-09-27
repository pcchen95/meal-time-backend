const db = require("../models")

const { VendorCategories } = db

const vendorCategoriesController = {
  getAll: async (req, res) => {
    try {
      const vendorCategories = await VendorCategories.findAll()
      return res.json({
        ok: 1,
        data: vendorCategories,
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
      const vendorCategory = await VendorCategories.create({ name })
      return res.json({
        ok: 1,
        data: vendorCategory,
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
      const vendorCategory = await VendorCategories.findOne({
        where: {
          id,
        },
      })
      vendorCategory.name = name
      await vendorCategory.save()
      return res.json({
        ok: 1,
        data: vendorCategory,
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
      await VendorCategories.destroy({
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

module.exports = vendorCategoriesController
