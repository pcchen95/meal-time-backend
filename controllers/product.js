const { Op } = require("sequelize");
const db = require("../models");
const { uploadImg, deleteImg } = require("./imgur.js");
const jwt = require("jsonwebtoken");
const secretKey = require("../auth/secretKey");
const { Product, ProductCategory, Vendor, VendorCategory } = db;
const album = "gpxFA0k";

const productController = {
  getInfo: async (req, res) => {
    const id = req.params.id;
    try {
      const procuct = await Product.findOne({
        where: {
          id,
        },
        include: [
          {
            model: ProductCategory,
            attributes: ["id", "name"],
          },
          {
            model: Vendor,
            attributes: ["id", "vendorName", "avatarUrl", "categoryId"],
            include: [{ model: VendorCategory, attributes: ["id", "name"] }],
          },
        ],
      });
      return res.status(200).json({
        ok: 1,
        data: procuct,
      });
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  getByVendorManage: async (req, res) => {
    const id = Number(req.params.id);
    let {
      page,
      limit,
      sort,
      order,
      category,
      isAvailable,
      hideExpiry,
      hideSoldOut,
    } = req.query;
    const _page = Number(page) || 1;
    const _limit = limit ? parseInt(limit) : null;
    const _offset = (_page - 1) * _limit;
    const _sort = sort || "id";
    const _order = order || "DESC";
    const _category = category || null;
    let _isAvailable = isAvailable || "all";
    const _hideExpiry = Boolean(hideExpiry) || false;
    const _hideSoldOut = Boolean(hideSoldOut) || false;
    const now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    const today = now.getTime();

    if (isAvailable === "true") _isAvailable = true;

    if (isAvailable === "false") _isAvailable = false;

    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
      if (decoded.payload.vendorId !== id) {
        return res.status(401).json({
          ok: 0,
          message: "you are not authorized",
        });
      }
      try {
        const procucts = await Product.findAndCountAll({
          where: {
            ...(_isAvailable !== "all" &&
              (_isAvailable ? { isAvailable: true } : { isAvailable: false })),
            vendorId: id,
            ...(_category && { categoryId: _category }),
            ...(_hideSoldOut && { quantity: { [Op.gt]: 0 } }),
            ...(_hideExpiry && {
              expiryDate: { [Op.gte]: new Date(today) },
            }),
          },
          include: [
            {
              model: ProductCategory,
            },
            {
              model: Vendor,
              attributes: ["vendorName", "avatarUrl", "categoryId"],
            },
          ],
          ...(_limit && { limit: _limit }),
          offset: _offset,
          order: [[_sort, _order]],
        });

        return res.status(200).json({
          ok: 1,
          data: procucts,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  getByVendor: async (req, res) => {
    const id = req.params.id;
    let { page, limit, sort, order, category, notSupplied } = req.query;
    const _page = Number(page) || 1;
    const _limit = limit ? parseInt(limit) : null;
    const _offset = (_page - 1) * _limit;
    const _sort = sort || "id";
    const _order = order || "DESC";
    const _category = category || null;
    const _notSupplied = Boolean(notSupplied) || false;
    const now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    const today = now.getTime();
    try {
      const procucts = await Product.findAndCountAll({
        where: {
          isAvailable: true,
          vendorId: id,
          ...(_category && { categoryId: _category }),
          ...(!_notSupplied && { quantity: { [Op.gt]: 0 } }),
          ...(!_notSupplied && {
            expiryDate: { [Op.gte]: new Date(today) },
          }),
        },
        include: [
          {
            model: ProductCategory,
          },
          {
            model: Vendor,
            attributes: ["vendorName", "avatarUrl", "categoryId"],
          },
        ],
        ...(_limit && { limit: _limit }),
        offset: _offset,
        order: [[_sort, _order]],
      });

      return res.status(200).json({
        ok: 1,
        data: procucts,
      });
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  getByCategory: async (req, res) => {
    const id = req.params.id;
    let { page, limit, sort, order, notSupplied } = req.query;
    const _page = Number(page) || 1;
    const _limit = limit ? parseInt(limit) : 10;
    const _offset = (_page - 1) * _limit;
    const _sort = sort || "id";
    const _order = order || "DESC";
    const _notSupplied = Boolean(notSupplied) || false;
    const now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    const today = now.getTime();
    try {
      const procucts = await Product.findAndCountAll({
        where: {
          isAvailable: true,
          categoryId: id,
          ...(!_notSupplied && { quantity: { [Op.gt]: 0 } }),
          ...(!_notSupplied && {
            expiryDate: { [Op.gte]: new Date(today) },
          }),
        },
        include: [
          {
            model: ProductCategory,
          },
          {
            model: Vendor,
            attributes: ["vendorName", "avatarUrl", "categoryId"],
          },
        ],
        limit: _limit,
        offset: _offset,
        order: [[_sort, _order]],
      });
      return res.status(200).json({
        ok: 1,
        data: procucts,
      });
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  getAllInfo: async (req, res) => {
    let { page, limit, sort, order, notSupplied } = req.query;
    const _page = Number(page) || 1;
    const _limit = limit ? parseInt(limit) : 10;
    const _offset = (_page - 1) * _limit;
    const _sort = sort || "id";
    const _order = order || "DESC";
    const _notSupplied = Boolean(notSupplied) || false;
    const now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    const today = now.getTime();
    try {
      const products = await Product.findAndCountAll({
        where: {
          isAvailable: true,
          ...(!_notSupplied && { quantity: { [Op.gt]: 0 } }),
          ...(!_notSupplied && {
            expiryDate: { [Op.gte]: new Date(today) },
          }),
        },
        include: [
          {
            model: ProductCategory,
          },
          {
            model: Vendor,
            attributes: ["vendorName", "avatarUrl", "categoryId"],
          },
        ],
        limit: _limit,
        offset: _offset,
        order: [[_sort, _order]],
      });
      return res.status(200).json({
        ok: 1,
        data: products,
      });
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  searchByKeyword: async (req, res) => {
    let { page, limit, sort, order, keyword, notSupplied } = req.query;
    const _page = Number(page) || 1;
    const _limit = limit ? parseInt(limit) : 10;
    const _offset = (_page - 1) * _limit;
    const _sort = sort || "id";
    const _order = order || "DESC";
    const _notSupplied = Boolean(notSupplied) || false;
    const now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    const today = now.getTime();
    try {
      const productCategories = await ProductCategory.findAll({
        where: {
          name: {
            [Op.substring]: keyword,
          },
        },
      });
      const productCategoriesList = productCategories.map(
        (category) => category.id
      );
      const products = await Product.findAndCountAll({
        where: {
          isAvailable: true,
          ...(!_notSupplied && { quantity: { [Op.gt]: 0 } }),
          ...(!_notSupplied && {
            expiryDate: { [Op.gte]: new Date(today) },
          }),
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
            attributes: ["id", "vendorName", "avatarUrl", "categoryId"],
          },
        ],
        limit: _limit,
        offset: _offset,
        order: [[_sort, _order]],
      });
      if (!products) {
        throw new Error();
      }
      return res.status(200).json({
        ok: 1,
        data: products,
      });
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  addProduct: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
      const vendorId = decoded.payload.vendorId;
      const {
        name,
        categoryId,
        price,
        quantity,
        manufactureDate,
        expiryDate,
        description,
        isAvailable,
      } = req.body;
      const picture = req.file;
      try {
        if (picture) {
          const encodeImage = picture.buffer.toString("base64");
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
            });
            return res.status(200).json({
              ok: 1,
              message: "Success",
              data: {
                productId: product.id,
              },
            });
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

  updateProduct: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
      const vendorId = decoded.payload.vendorId;
      const id = req.params.id;
      const {
        name,
        categoryId,
        price,
        quantity,
        manufactureDate,
        expiryDate,
        description,
        isAvailable,
      } = req.body;
      const picture = req.file;
      try {
        const updateProduct = await Product.findOne({
          where: {
            id,
            vendorId,
          },
        });
        if (picture) {
          deleteImg(updateProduct.pictureUrl, (err) => {
            if (err) {
              return res.status(500).json({
                ok: 0,
                message: err.toString(),
              });
            }
          });
          const encodeImage = picture.buffer.toString("base64");
          uploadImg(encodeImage, album, async (err, link) => {
            updateProduct.pictureUrl = link;
            if (name) updateProduct.name = name;
            if (categoryId) updateProduct.categoryId = categoryId;
            if (price) updateProduct.price = price;
            if (quantity) updateProduct.quantity = quantity;
            if (manufactureDate)
              updateProduct.manufactureDate = manufactureDate;
            if (expiryDate) updateProduct.expiryDate = expiryDate;
            if (description) updateProduct.description = description;
            if (isAvailable) updateProduct.isAvailable = isAvailable;

            await updateProduct.save();
            return res.status(200).json({
              ok: 1,
              message: "Success",
              data: {
                productId: updateProduct.id,
              },
            });
          });
        } else {
          if (name) updateProduct.name = name;
          if (categoryId) updateProduct.categoryId = categoryId;
          if (price) updateProduct.price = price;
          if (quantity) updateProduct.quantity = quantity;
          if (manufactureDate) updateProduct.manufactureDate = manufactureDate;
          if (expiryDate) updateProduct.expiryDate = expiryDate;
          if (description) updateProduct.description = description;
          if (isAvailable) updateProduct.isAvailable = isAvailable;
          await updateProduct.save();
          return res.status(200).json({
            ok: 1,
            message: "Success",
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

  deleteProduct: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
      const vendorId = decoded.payload.vendorId;
      const id = req.params.id;
      try {
        await Product.destroy({
          where: {
            id,
            vendorId,
          },
        });
        return res.status(200).json({
          ok: 1,
          message: "Success",
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  getCartData: async (req, res) => {
    try {
      const cart = req.body.cart;
      const cartProductsId = [];
      cart.forEach((item) => {
        cartProductsId.push(item.id);
      });

      const groupByVendor = (data) => {
        const groupedData = data.reduce((groups, product) => {
          for (let i = 0; i < cart.length; i++) {
            if (product.id === cart[i].id) {
              product.dataValues["cartQuantity"] = cart[i].quantity;
            }
          }
          groups[product.vendorId] = groups[product.vendorId] || [];
          groups[product.vendorId].push(product);
          return groups;
        }, {});
        return groupedData;
      };
      const rawCartData = await Product.findAll({
        where: {
          id: cartProductsId,
        },
        include: [
          {
            model: ProductCategory,
            attributes: ["id", "name"],
          },
          {
            model: Vendor,
            attributes: ["id", "vendorName", "avatarUrl", "categoryId"],
          },
        ],
      });
      const cartData = groupByVendor(rawCartData);

      return res.status(200).json({
        ok: 1,
        data: cartData,
      });
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      });
    }
  },
};

module.exports = productController;
