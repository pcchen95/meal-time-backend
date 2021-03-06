const db = require('../models');
const jwt = require('jsonwebtoken');
const secretKey = require('../auth/secretKey');
const { sequelize } = require('../models');
const { Order, Product, OrderItem, Vendor, User } = db;
const { Op } = require('sequelize');

const orderController = {
  getAll: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }
      let { page, limit, sort, order, status } = req.query;
      const _page = Number(page) || 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _offset = (_page - 1) * _limit;
      const _sort = sort || 'id';
      const _order = order || 'DESC';
      const _status = status || 'all';
      if (decoded.payload.role !== 'admin') {
        return res.status(401).json({
          ok: 0,
          message: 'you are not authorized',
        });
      }
      try {
        let orders;
        switch (_status) {
          case 'uncompleted':
            orders = await Order.findAndCountAll({
              limit: _limit,
              offset: _offset,
              order: [[_sort, _order]],
              where: {
                isCompleted: false,
                isCanceledByVendor: false,
                isCanceledByClient: false,
              },
              include: [
                {
                  model: User,
                  attributes: ['id', 'username', 'nickname'],
                },
                {
                  model: Vendor,
                  attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
                },
              ],
            });
            break;
          case 'canceled':
            orders = await Order.findAndCountAll({
              limit: _limit,
              offset: _offset,
              order: [[_sort, _order]],
              where: {
                [Op.not]: [
                  {
                    [Op.and]: [
                      { isCanceledByVendor: false },
                      {
                        isCanceledByClient: false,
                      },
                    ],
                  },
                ],
              },
              include: [
                {
                  model: User,
                  attributes: ['id', 'username', 'nickname'],
                },
                {
                  model: Vendor,
                  attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
                },
              ],
            });
            break;
          case 'completed':
            orders = await Order.findAndCountAll({
              limit: _limit,
              offset: _offset,
              order: [[_sort, _order]],
              where: {
                isCompleted: true,
              },
              include: [
                {
                  model: User,
                  attributes: ['id', 'username', 'nickname'],
                },
                {
                  model: Vendor,
                  attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
                },
              ],
            });
            break;
          default:
            orders = await Order.findAndCountAll({
              limit: _limit,
              offset: _offset,
              order: [[_sort, _order]],
              include: [
                {
                  model: User,
                  attributes: ['id', 'username', 'nickname'],
                },
                {
                  model: Vendor,
                  attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
                },
              ],
            });
            break;
        }

        if (orders) {
          return res.status(200).json({
            ok: 1,
            data: orders,
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
  getOne: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
      const id = req.params.id;
      try {
        const order = await Order.findOne({
          where: {
            id,
          },
          include: [
            {
              model: Vendor,
              attributes: ['id', 'vendorName', 'address'],
            },
          ],
        });
        if (!order) {
          return res.status(500).json({
            ok: 0,
            message: '?????????????????????',
          });
        }
        if (
          order.clientId === decoded.payload.userId ||
          order.vendorId === decoded.payload.vendorId ||
          decoded.payload.role === 'admin'
        ) {
          const orderItems = await OrderItem.findAll({
            where: {
              orderId: id,
            },
            include: [
              {
                model: Product,
              },
            ],
          });
          return res.status(200).json({
            ok: 1,
            data: { order, orderItems },
          });
        }
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },
  getBuy: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
      let { page, limit, sort, order, status } = req.query;
      const _page = Number(page) || 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _offset = (_page - 1) * _limit;
      const _sort = sort || 'id';
      const _order = order || 'DESC';
      const _status = status || 'all';

      const queriedUser = req.query.clientId
        ? req.query.clientId
        : decoded.payload.userId;
      const clientId =
        decoded.payload.role === 'admin' ? queriedUser : decoded.payload.userId;
      try {
        let orders;
        switch (_status) {
          case 'uncompleted':
            orders = await Order.findAndCountAll({
              limit: _limit,
              offset: _offset,
              order: [[_sort, _order]],
              where: {
                isCompleted: false,
                isCanceledByVendor: false,
                isCanceledByClient: false,
                clientId,
              },
              include: [
                {
                  model: User,
                  attributes: ['id', 'username', 'nickname'],
                },
                {
                  model: Vendor,
                  attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
                },
              ],
            });
            break;
          case 'canceled':
            orders = await Order.findAndCountAll({
              limit: _limit,
              offset: _offset,
              order: [[_sort, _order]],
              where: {
                clientId,

                [Op.not]: [
                  {
                    [Op.and]: [
                      { isCanceledByVendor: false },
                      {
                        isCanceledByClient: false,
                      },
                    ],
                  },
                ],
              },
              include: [
                {
                  model: User,
                  attributes: ['id', 'username', 'nickname'],
                },
                {
                  model: Vendor,
                  attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
                },
              ],
            });
            break;
          case 'completed':
            orders = await Order.findAndCountAll({
              limit: _limit,
              offset: _offset,
              order: [[_sort, _order]],
              where: {
                clientId,

                isCompleted: true,
              },
              include: [
                {
                  model: User,
                  attributes: ['id', 'username', 'nickname'],
                },
                {
                  model: Vendor,
                  attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
                },
              ],
            });
            break;
          default:
            orders = await Order.findAndCountAll({
              limit: _limit,
              offset: _offset,
              order: [[_sort, _order]],
              where: {
                clientId,
              },
              include: [
                {
                  model: User,
                  attributes: ['id', 'username', 'nickname'],
                },
                {
                  model: Vendor,
                  attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
                },
              ],
            });
            break;
        }
        return res.status(200).json({
          ok: 1,
          data: orders,
        });
      } catch (err) {
        return res.status(500).send({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },
  getSell: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
      let { page, limit, sort, order, status } = req.query;
      const _page = Number(page) || 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _offset = (_page - 1) * _limit;
      const _sort = sort || 'id';
      const _order = order || 'DESC';
      const _status = status || 'all';

      const queriedUser = req.query.vendorId
        ? req.query.vendorId
        : decoded.payload.userId;
      const vendorId =
        decoded.payload.role === 'admin'
          ? queriedUser
          : decoded.payload.vendorId;
      try {
        let orders;
        switch (_status) {
          case 'uncompleted':
            orders = await Order.findAndCountAll({
              limit: _limit,
              offset: _offset,
              order: [[_sort, _order]],
              where: {
                isCompleted: false,
                isCanceledByVendor: false,
                isCanceledByClient: false,
                vendorId,
              },
              include: [
                {
                  model: User,
                  attributes: ['id', 'username', 'nickname'],
                },
                {
                  model: Vendor,
                  attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
                },
              ],
            });
            break;
          case 'canceled':
            orders = await Order.findAndCountAll({
              limit: _limit,
              offset: _offset,
              order: [[_sort, _order]],
              where: {
                vendorId,
                [Op.not]: [
                  {
                    [Op.and]: [
                      { isCanceledByVendor: false },
                      {
                        isCanceledByClient: false,
                      },
                    ],
                  },
                ],
              },
              include: [
                {
                  model: User,
                  attributes: ['id', 'username', 'nickname'],
                },
                {
                  model: Vendor,
                  attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
                },
              ],
            });
            break;
          case 'completed':
            orders = await Order.findAndCountAll({
              limit: _limit,
              offset: _offset,
              order: [[_sort, _order]],
              where: {
                isCompleted: true,
                vendorId,
              },
              include: [
                {
                  model: User,
                  attributes: ['id', 'username', 'nickname'],
                },
                {
                  model: Vendor,
                  attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
                },
              ],
            });
            break;
          default:
            orders = await Order.findAndCountAll({
              limit: _limit,
              offset: _offset,
              order: [[_sort, _order]],
              where: {
                vendorId,
              },
              include: [
                {
                  model: User,
                  attributes: ['id', 'username', 'nickname'],
                },
                {
                  model: Vendor,
                  attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
                },
              ],
            });
            break;
        }

        return res.status(200).json({
          ok: 1,
          data: orders,
        });
      } catch (err) {
        return res.status(500).send({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },
  addOrder: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
      if (decoded.payload.role === 'admin') {
        return res.status(401).json({
          ok: 0,
          message: 'not allowed',
        });
      }
      const clientId = decoded.payload.userId;
      const { orderProducts, vendorId, pickupTime, remarks } = req.body;
      let totalQuantity = 0;
      let totalPrice = 0;
      const orderNumber =
        Math.random().toString(36).substr(2, 8) +
        Date.now().toString(36).substr(4, 4);
      //???????????? = ?????? 8 ??? + ???????????? 4 ???
      try {
        const result = await sequelize.transaction(async (transaction) => {
          const order = await Order.create(
            {
              orderNumber,
              vendorId,
              clientId,
              totalQuantity,
              totalPrice,
              pickupTime,
              remarks,
              isCompleted: false,
              isCanceledByVendor: false,
              isCanceledByClient: false,
            },
            { transaction }
          );
          for (const productItem of orderProducts) {
            try {
              const orderItem = await OrderItem.create(
                {
                  productId: productItem.id,
                  orderId: order.id,
                  quantity: productItem.quantity,
                },
                { transaction }
              );
              const product = await Product.findOne(
                {
                  where: {
                    id: productItem.id,
                  },
                  attributes: ['id', 'price', 'quantity'],
                },
                { transaction }
              );
              product.quantity -= orderItem.quantity;
              if (product.quantity < 0) {
                throw new Error('??????????????????');
              }
              await product.save({ transaction });
              totalQuantity += orderItem.quantity;
              for (let i = 0; i < productItem.quantity; i++) {
                totalPrice += product.price;
              }
            } catch (err) {
              throw new Error(err.toString());
            }
          }
          order.totalQuantity = totalQuantity;
          order.totalPrice = totalPrice;
          await order.save({ transaction });
          return order;
        });
        return res.status(201).json({
          ok: 1,
          data: result,
        });
      } catch (err) {
        return res.status(500).send({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },
  completeOrder: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
      const id = req.params.id;
      try {
        const order = await Order.findOne({
          where: {
            id,
          },
        });
        if (!order) {
          return res.status(500).json({
            ok: 0,
            message: '?????????????????????',
          });
        }
        if (
          order.clientId === decoded.payload.userId ||
          order.vendorId === decoded.payload.vendorId ||
          decoded.payload.role === 'admin'
        ) {
          if (order.isCompleted) {
            return res.status(400).send({
              ok: 0,
              message: '???????????????',
            });
          }
          if (order) {
            order.isCompleted = true;
            await order.save();
            return res.json({
              ok: 1,
              data: order,
            });
          }
        } else {
          return res.status(401).send({
            ok: 0,
            message: 'Unauthorized',
          });
        }
      } catch (err) {
        return res.status(500).send({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },
  cancelOrder: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
      const id = req.params.id;
      try {
        const result = await sequelize.transaction(async (transaction) => {
          const order = await Order.findOne({
            where: {
              id,
            },
          });
          if (!order) {
            return res.status(500).json({
              ok: 0,
              message: '?????????????????????',
            });
          }
          if (
            order.clientId === decoded.payload.userId ||
            order.vendorId === decoded.payload.vendorId ||
            decoded.payload.role === 'admin'
          ) {
            if (order.isCanceledByVendor || order.isCanceledByClient) {
              return res.status(400).send({
                ok: 0,
                message: '??????????????????',
              });
            }
            const orderItems = await OrderItem.findAll({
              where: {
                orderId: id,
              },
            });
            for (orderItem of orderItems) {
              const product = await Product.findOne({
                where: {
                  id: orderItem.productId,
                },
              });
              product.quantity += orderItem.quantity;
              await product.save({ transaction });
            }
            if (decoded.payload.userId === order.clientId) {
              order.isCanceledByClient = true;
            }
            if (decoded.payload.vendorId === order.vendorId) {
              order.isCanceledByVendor = true;
            }

            await order.save({ transaction });
          } else {
            return res.status(401).send({
              ok: 0,
              message: 'Unauthorized',
            });
          }
          return order;
        });
        return res.status(200).json({
          ok: 1,
          data: result,
        });
      } catch (err) {
        return res.status(500).send({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },
  deleteOrder: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.json({
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
      const id = req.params.id;
      try {
        await Order.destroy({
          where: {
            id,
          },
        });
        await OrderItem.destroy({
          where: {
            orderId: id,
          },
        });
        return res.status(200).json({
          ok: 1,
          message: 'Success',
        });
      } catch (err) {
        return res.send({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },
};

module.exports = orderController;
