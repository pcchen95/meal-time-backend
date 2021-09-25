const db = require("../models")

const { Order, Products, OrderItems } = db

const orderController = {
  getAll: async (req, res) => {},
  getBuy: async (req, res) => {
    const clientId = req.params.id
    try {
      const orders = await Order.findAll({
        where: {
          clientId,
        },
        include: [
          {
            model: Vendor,
            attributes: ["vendorName", "avatarUrl", "categoryId"],
          },
          {
            model: OrderItems,
            attributes: [],
          },
        ],
      })
      return res.json({
        ok: 1,
        data: orders,
      })
    } catch (err) {
      return res.send({
        ok: 0,
        message: err.toString(),
      })
    }
  },
  getSell: async (req, res) => {},
  getOne: async (req, res) => {},
  newOrder: async (req, res) => {
    const { oroderProducts, vendorId, clientId, pickupTime, remarks } = req.body
    const totalQuantity = 0
    const totalPrice = 0
    const orderNumber =
      Math.random().toString(36).substr(2, 8) +
      Date.now().toString(36).substr(4, 4)
    //訂單號碼 = 亂數 8 碼 + 時間戳記 4 碼
    try {
      const order = await Order.create({
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
      })

      if (order) {
        oroderProducts.forEach((productItem) => {
          try {
            const orderItem = await Order.create({
              productId: productItem.id,
              orderId: order.id,
              quantity: productItem.quantity,
            })
            if (orderItem) {
              try {
                const product = await Products.findOne({
                  where: {
                    id: product.id,
                  },
                  attributes: ["price"],
                })
                if (product) {
                  totalQuantity += orderItem.quantity
                  totalPrice += product.price
                }
              } catch (err) {
                return res.send({
                  ok: 0,
                  message: err.toString(),
                })
              }
            }
          } catch (err) {
            return res.send({
              ok: 0,
              message: err.toString(),
            })
          }
        })
        order.totalQuantity = totalQuantity
        order.totalPrice = totalPrice
        await order.save()
      }
    } catch (err) {
      return res.send({
        ok: 0,
        message: err.toString(),
      })
    }
  },
}
