const db = require('../models');
const jwt = require('jsonwebtoken');
const secretKey = require('../auth/secretKey');

const { VendorCategory } = db;

const VendorCategoryController = {
  getAllCategories: async (req, res) => {
    let { _page, _limit, _sort, _order } = req.query;
    const page = Number(_page) || 1;
    let offset = 0;
    if (page) {
      offset = (page - 1) * (_limit ? parseInt(_limit) : 10);
    }
    const sort = _sort || 'id';
    const order = _order || 'DESC';
    const limit = _limit ? parseInt(_limit) : 10;

    try {
      const categories = await VendorCategory.findAll({
        limit,
        offset,
        order: [[sort, order]],
      });
      return res.status(200).json({
        ok: 1,
        data: categories,
      });
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  getCategory: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }
      if (decoded.payload.role !== 'admin') {
        return res.status(401).json({
          ok: 0,
          message: 'you are not authorized',
        });
      }
      try {
        const category = await VendorCategory.findOne({
          where: {
            id: req.params.id,
          },
        });
        return res.status(200).json({
          ok: 1,
          data: category,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  addCategory: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }
      if (decoded.payload.role !== 'admin') {
        return res.status(401).json({
          ok: 0,
          message: 'you are not authorized',
        });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({
          ok: 0,
          message: 'name is required',
        });
      }

      try {
        const category = await VendorCategory.create({
          name,
        });

        if (category) {
          return res.status(200).json({
            ok: 1,
            message: 'Success',
          });
        }
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  updateCategory: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }
      if (decoded.payload.role !== 'admin') {
        return res.status(401).json({
          ok: 0,
          message: 'you are not authorized',
        });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({
          ok: 0,
          message: 'name is required',
        });
      }

      let item;
      try {
        item = await VendorCategory.findOne({
          where: {
            id: req.params.id,
          },
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }

      try {
        const response = await item.update({
          name,
        });
        if (response) {
          return res.status(200).json({
            ok: 1,
            message: 'Success',
          });
        }
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  deleteCategory: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }
      if (decoded.payload.role !== 'admin') {
        return res.status(401).json({
          ok: 0,
          message: 'you are not authorized',
        });
      }

      let item;
      try {
        item = await VendorCategory.findOne({
          where: {
            id: req.params.id,
          },
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }

      try {
        const response = await item.delete();
        if (response) {
          return res.status(200).json({
            ok: 1,
            message: 'Success',
          });
        }
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },
};
module.exports = VendorCategoryController;
