const db = require('../models')
const jwt = require('jsonwebtoken')
const secretKey = require('../auth/secretKey')
const { sequelize } = require('../models')
const { Order, Product, OrderItem, Vendor } = db

const orderController = {
  getAll: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        })
      }
      let { page, limit, sort, order } = req.query
      const _page = Number(page) || 1
      const _limit = limit ? parseInt(limit) : 20
      const _offset = (_page - 1) * _limit
      const _sort = sort || 'id'
      const _order = order || 'DESC'
      if (decoded.payload.role !== 'admin') {
        return res.status(401).json({
          ok: 0,
          message: 'you are not authorized',
        })
      }
      try {
        const orders = await Order.findAndCountAll({
          limit: _limit,
          offset: _offset,
          order: [[_sort, _order]],
        })
        if (orders) {
          return res.status(200).json({
            ok: 1,
            data: orders,
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
  getOne: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
      const id = req.params.id
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
        })
        if (!order) {
          return res.status(500).json({
            ok: 0,
            message: '找不到這筆訂單',
          })
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
          })
          return res.status(200).json({
            ok: 1,
            data: { order, orderItems },
          })
        }
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        })
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
    })
  },
  getBuy: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
      let { page, limit, sort, order } = req.query
      const _page = Number(page) || 1
      const _limit = limit ? parseInt(limit) : 20
      const _offset = (_page - 1) * _limit
      const _sort = sort || 'id'
      const _order = order || 'DESC'
      const queriedUser = req.query.clientId
        ? req.query.clientId
        : decoded.payload.userId
      const clientId =
        decoded.payload.role === 'admin' ? queriedUser : decoded.payload.userId
      try {
        const orders = await Order.findAndCountAll({
          where: {
            clientId,
          },
          include: [
            {
              model: Vendor,
              attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
            },
          ],
          limit: _limit,
          offset: _offset,
          order: [[_sort, _order]],
        })
        return res.status(200).json({
          ok: 1,
          data: orders,
        })
      } catch (err) {
        return res.status(500).send({
          ok: 0,
          message: err.toString(),
        })
      }
    })
  },
  getSell: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
      let { page, limit, sort, order } = req.query
      const _page = Number(page) || 1
      const _limit = limit ? parseInt(limit) : 20
      const _offset = (_page - 1) * _limit
      const _sort = sort || 'id'
      const _order = order || 'DESC'
      const queriedUser = req.query.vendorId
        ? req.query.vendorId
        : decoded.payload.userId
      const vendorId =
        decoded.payload.role === 'admin'
          ? queriedUser
          : decoded.payload.vendorId
      try {
        const orders = await Order.findAndCountAll({
          where: {
            vendorId,
          },
          include: [
            {
              model: Vendor,
              attributes: ['id', 'vendorName', 'avatarUrl', 'categoryId'],
            },
          ],
          limit: _limit,
          offset: _offset,
          order: [[_sort, _order]],
        })
        return res.status(200).json({
          ok: 1,
          data: orders,
        })
      } catch (err) {
        return res.status(500).send({
          ok: 0,
          message: err.toString(),
        })
      }
    })
  },
  addOrder: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
      const clientId = decoded.payload.userId
      const { orderProducts, vendorId, pickupTime, remarks } = req.body
      let totalQuantity = 0
      let totalPrice = 0
      const orderNumber =
        Math.random().toString(36).substr(2, 8) +
        Date.now().toString(36).substr(4, 4)
      //訂單號碼 = 亂數 8 碼 + 時間戳記 4 碼
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
          )
          for (const productItem of orderProducts) {
            try {
              const orderItem = await OrderItem.create(
                {
                  productId: productItem.id,
                  orderId: order.id,
                  quantity: productItem.quantity,
                },
                { transaction }
              )
              const product = await Product.findOne(
                {
                  where: {
                    id: productItem.id,
                  },
                  attributes: ['id', 'price', 'quantity'],
                },
                { transaction }
              )
              product.quantity -= orderItem.quantity
              if (product.quantity < 0) {
                throw new Error('商品數量不足')
              }
              await product.save({ transaction })
              totalQuantity += orderItem.quantity
              totalPrice += product.price
            } catch (err) {
              throw new Error(err.toString())
            }
          }
          order.totalQuantity = totalQuantity
          order.totalPrice = totalPrice
          await order.save({ transaction })
          return order
        })
        return res.status(201).json({
          ok: 1,
          data: result,
        })
      } catch (err) {
        return res.status(500).send({
          ok: 0,
          message: err.toString(),
        })
      }
    })
  },
  completeOrder: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
      const id = req.params.id
      try {
        const order = await Order.findOne({
          where: {
            id,
          },
        })
        if (!order) {
          return res.status(500).json({
            ok: 0,
            message: '找不到這筆訂單',
          })
        }
        if (
          order.clientId === decoded.payload.userId ||
          order.vendorId === decoded.payload.vendorId ||
          decoded.payload.role === 'admin'
        ) {
          if (order.isCompleted) {
            return res.status(400).send({
              ok: 0,
              message: '訂單已完成',
            })
          }
          if (order) {
            order.isCompleted = true
            await order.save()
            return res.json({
              ok: 1,
              data: order,
            })
          }
        } else {
          return res.status(401).send({
            ok: 0,
            message: 'Unauthorized',
          })
        }
      } catch (err) {
        return res.status(500).send({
          ok: 0,
          message: err.toString(),
        })
      }
    })
  },
  cancelOrder: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        })
      }
      const id = req.params.id
      try {
        const result = await sequelize.transaction(async (transaction) => {
          const order = await Order.findOne({
            where: {
              id,
            },
          })
          if (!order) {
            return res.status(500).json({
              ok: 0,
              message: '找不到這筆訂單',
            })
          }
          if (
            order.clientId === decoded.payload.userId ||
            order.vendorId === decoded.payload.vendorId ||
            decoded.payload.role === 'admin'
          ) {
            if (order.isCanceledByVendor || order.isCanceledByClient) {
              return res.status(400).send({
                ok: 0,
                message: '訂單已被取消',
              })
            }
            const orderItems = await OrderItem.findAll({
              where: {
                orderId: id,
              },
            })
            for (orderItem of orderItems) {
              const product = await Product.findOne({
                where: {
                  id: orderItem.productId,
                },
              })
              product.quantity += orderItem.quantity
              await product.save({ transaction })
            }
            if (decoded.payload.userId === order.clientId) {
              order.isCanceledByClient = true
            }
            if (decoded.payload.vendorId === order.vendorId) {
              order.isCanceledByVendor = true
            }

            await order.save({ transaction })
          } else {
            return res.status(401).send({
              ok: 0,
              message: 'Unauthorized',
            })
          }
          return order
        })
        return res.status(200).json({
          ok: 1,
          data: result,
        })
      } catch (err) {
        return res.status(500).send({
          ok: 0,
          message: err.toString(),
        })
      }
    })
  },
  deleteOrder: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.json({
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
        await Order.destroy({
          where: {
            id,
          },
        })
        await OrderItem.destroy({
          where: {
            orderId: id,
          },
        })
        return res.status(200).json({
          ok: 1,
          message: 'Success',
        })
      } catch (err) {
        return res.send({
          ok: 0,
          message: err.toString(),
        })
      }
    })
  },
}

module.exports = orderController
