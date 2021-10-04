const db = require('../models');
const jwt = require('jsonwebtoken');
const secretKey = require('../auth/secretKey');

const { Vendor, User, Message, MessageToAdmin, ReportMessage } = db;

const messageController = {
  getClientMessage: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      try {
        const message = await Message.findOne({
          where: {
            clientId: decoded.payload.userId,
            vendorId: req.params.id,
          },
        });

        return res.status(200).json({
          ok: 1,
          data: message,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  getAllClientMessages: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      try {
        const messages = await Message.findAll({
          where: {
            clientId: decoded.payload.userId,
          },
        });

        return res.status(200).json({
          ok: 1,
          data: messages,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  messageToVendor: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      let { content } = req.body;
      if (!content) {
        return res.status(400).json({
          ok: 0,
          message: 'content is required',
        });
      }
      try {
        const message = await Message.findOne({
          where: {
            clientId: decoded.payload.userId,
            vendorId: req.params.id,
          },
        });

        if (!message) {
          try {
            content = [{ client: [content] }];
            const jsonContent = JSON.stringify(content);
            const newMessage = await Message.create({
              clientId: decoded.payload.userId,
              vendorId: req.params.id,
              content: jsonContent,
            });

            if (newMessage) {
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
        } else {
          try {
            const originMessage = JSON.parse(message.content);
            const lastMessage = originMessage[originMessage.length - 1];
            const lastUser = Object.keys(lastMessage)[0];
            if (lastUser === 'client') {
              originMessage[originMessage.length - 1].client.push(content);
            } else {
              originMessage.push({
                client: [content],
              });
            }
            const jsonContent = JSON.stringify(originMessage);
            const newMessage = await message.update({
              content: jsonContent,
            });

            if (newMessage) {
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
        }
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  getVendorMessage: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      try {
        const message = await Message.findOne({
          where: {
            clientId: req.params.id,
            vendorId: decoded.payload.vendorId,
          },
        });

        return res.status(200).json({
          ok: 1,
          data: message,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  getAllVendorMessages: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      try {
        const messages = await Message.findAll({
          where: {
            vendorId: decoded.payload.vendorId,
          },
        });

        return res.status(200).json({
          ok: 1,
          data: messages,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  messageToClient: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      let { content } = req.body;
      if (!content) {
        return res.status(400).json({
          ok: 0,
          message: 'content is required',
        });
      }
      let message;
      try {
        const message = await Message.findOne({
          where: {
            clientId: req.params.id,
            vendorId: decoded.payload.vendorId,
          },
        });
        if (!message) {
          return res.status(500).json({
            ok: 0,
            message: 'no result',
          });
        }
        try {
          const originMessage = JSON.parse(message.content);
          const lastMessage = originMessage[originMessage.length - 1];
          const lastUser = Object.keys(lastMessage)[0];
          if (lastUser === 'vendor') {
            originMessage[originMessage.length - 1].vendor.push(content);
          } else {
            originMessage.push({
              vendor: [content],
            });
          }
          const jsonContent = JSON.stringify(originMessage);
          const newMessage = await message.update({
            content: jsonContent,
          });

          if (newMessage) {
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
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  getMessagesToAdmin: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      try {
        const message = await MessageToAdmin.findOne({
          where: {
            userId: decoded.payload.userId,
          },
        });

        return res.status(200).json({
          ok: 1,
          data: message,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  messageToAdmin: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      let { content } = req.body;
      if (!content) {
        return res.status(400).json({
          ok: 0,
          message: 'content is required',
        });
      }
      try {
        const message = await MessageToAdmin.findOne({
          where: {
            userId: decoded.payload.userId,
          },
        });

        if (!message) {
          try {
            content = [{ user: [content] }];
            const jsonContent = JSON.stringify(content);
            const newMessage = await MessageToAdmin.create({
              userId: decoded.payload.userId,
              content: jsonContent,
            });

            if (newMessage) {
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
        } else {
          try {
            const originMessage = JSON.parse(message.content);
            const lastMessage = originMessage[originMessage.length - 1];
            const lastUser = Object.keys(lastMessage)[0];
            if (lastUser === 'user') {
              originMessage[originMessage.length - 1].user.push(content);
            } else {
              originMessage.push({
                user: [content],
              });
            }
            const jsonContent = JSON.stringify(originMessage);
            const newMessage = await message.update({
              content: jsonContent,
            });

            if (newMessage) {
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
        }
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  getAdminMessage: (req, res) => {
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
        const message = await MessageToAdmin.findOne({
          where: {
            userId: req.params.id,
          },
        });

        return res.status(200).json({
          ok: 1,
          data: message,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  getAllAdminMessages: (req, res) => {
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
        const messages = await MessageToAdmin.findAll();

        return res.status(200).json({
          ok: 1,
          data: messages,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  messageFromAdminToUser: (req, res) => {
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

      let { content } = req.body;
      if (!content) {
        return res.status(400).json({
          ok: 0,
          message: 'content is required',
        });
      }
      try {
        const message = await MessageToAdmin.findOne({
          where: {
            userId: req.params.id,
          },
        });

        if (!message) {
          try {
            content = [{ admin: [content] }];
            const jsonContent = JSON.stringify(content);
            const newMessage = await MessageToAdmin.create({
              userId: req.params.id,
              content: jsonContent,
            });

            if (newMessage) {
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
        } else {
          try {
            const originMessage = JSON.parse(message.content);
            const lastMessage = originMessage[originMessage.length - 1];
            const lastUser = Object.keys(lastMessage)[0];
            if (lastUser === 'admin') {
              originMessage[originMessage.length - 1].admin.push(content);
            } else {
              originMessage.push({
                admin: [content],
              });
            }
            const jsonContent = JSON.stringify(originMessage);
            const newMessage = await message.update({
              content: jsonContent,
            });

            if (newMessage) {
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
        }
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  reportToAdmin: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      let { reportedVendorId, reportedProductId, content } = req.body;
      if (!reportedVendorId || !content) {
        return res.status(400).json({
          ok: 0,
          message: 'reportedVendorId and content are required',
        });
      }
      try {
        const response = await ReportMessage.create({
          userId: decoded.payload.userId,
          reportedVendorId,
          reportedProductId,
          content,
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

  getReportMessage: (req, res) => {
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
        const message = await ReportMessage.findOne({
          where: {
            userId: req.params.id,
          },
        });

        return res.status(200).json({
          ok: 1,
          data: message,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  getAllReportMessages: (req, res) => {
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
        const messages = await ReportMessage.findAll();

        return res.status(200).json({
          ok: 1,
          data: messages,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },
};

module.exports = messageController;
