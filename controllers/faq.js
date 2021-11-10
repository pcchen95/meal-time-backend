const db = require('../models');
const jwt = require('jsonwebtoken');
const secretKey = require('../auth/secretKey');

const { Faq, FaqCategory } = db;

const faqController = {
  getAllFaqs: async (req, res) => {
    let { _page, _limit, _sort, _order, categoryId } = req.query;
    const page = Number(_page) || 1;
    let offset = 0;
    if (page) {
      offset = (page - 1) * (_limit ? parseInt(_limit) : 10);
    }
    const sort = _sort || 'id';
    const order = _order || 'DESC';
    const limit = _limit ? parseInt(limit) : null;

    try {
      const faqs = await Faq.findAll({
        where: categoryId ? { categoryId } : {},
        include: {
          model: FaqCategory,
          attributes: ['name'],
        },
        attributes: ['id', 'question', 'categoryId', 'answer'],
        ...(_limit && { limit: _limit }),
        offset,
        order: [[sort, order]],
      });

      return res.status(200).json({
        ok: 1,
        data: faqs,
      });
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  getFaq: async (req, res) => {
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
        const faq = await Faq.findOne({
          where: {
            id: req.params.id,
          },
          include: {
            model: FaqCategory,
            attributes: ['name'],
          },
          attributes: ['question', 'categoryId', 'answer'],
        });

        return res.status(200).json({
          ok: 1,
          data: faq,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  addFaq: (req, res) => {
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

      const { question, categoryId, answer } = req.body;
      if (!question || !categoryId || !answer) {
        return res.status(400).json({
          ok: 0,
          message: 'question, categoryId, answer are required',
        });
      }

      try {
        const faq = await Faq.create({
          question,
          categoryId,
          answer,
        });

        if (faq) {
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

  updateFaq: (req, res) => {
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

      const { question, categoryId, answer } = req.body;
      if (!question || !categoryId || !answer) {
        return res.status(400).json({
          ok: 0,
          message: 'question, categoryId, answer are required',
        });
      }

      let params = {};
      let item;
      try {
        item = await Faq.findOne({
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

      if (question !== item.question) params.question = question;
      if (categoryId !== item.categoryId) params.categoryId = categoryId;
      if (answer !== item.answer) params.answer = answer;

      try {
        const faq = await item.update(params);
        if (faq) {
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

  deleteFaq: (req, res) => {
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
        item = await Faq.findOne({
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
        const result = await item.delete();
        if (result) {
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

  getAllFaqCategories: async (req, res) => {
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
      const categories = await FaqCategory.findAll({
        attributes: ['id', 'name'],
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

  getFaqCategory: async (req, res) => {
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
        const category = await FaqCategory.findOne({
          where: {
            id: req.params.id,
          },
          attributes: ['name'],
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

  addFaqCategory: (req, res) => {
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
        const category = await FaqCategory.create({
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

  updateFaqCategory: (req, res) => {
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
        item = await FaqCategory.findOne({
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
        const faq = await item.update({
          name,
        });
        if (faq) {
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

  deleteFaqCategory: (req, res) => {
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
        item = await FaqCategory.findOne({
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
        const result = await item.delete();
        if (result) {
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

module.exports = faqController;
