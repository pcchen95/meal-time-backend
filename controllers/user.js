const bcrypt = require('bcrypt');
const db = require('../models');
const jwt = require('jsonwebtoken');
const secretKey = require('../auth/secretKey');

const { uploadImg, deleteImg } = require('./imgur.js');

const saltRounds = 10;
const { User, Vendor, Message, MessageToAdmin } = db;
const album = '19dKauX';

const userController = {
  getMe: (req, res, next) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        if (err.toString().includes('expired')) {
          return res.status(200).json({
            ok: 0,
            message: 'non-login',
          });
        }
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }
      let user;
      try {
        user = await User.findOne({
          where: {
            id: decoded.payload.userId,
          },
          attributes: [
            'id',
            'nickname',
            'username',
            'phone',
            'email',
            'avatarURL',
            'role',
            'vendorId',
          ],
        });

        return res.status(200).json({
          ok: 1,
          data: user,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  getProfileById: async (req, res, next) => {
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
        let user = await User.findOne({
          where: {
            id: req.params.id,
          },
          attributes: [
            'nickname',
            'username',
            'phone',
            'email',
            'avatarURL',
            'role',
          ],
        });

        return res.status(200).json({
          ok: 1,
          data: user,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  getAllProfiles: async (req, res, next) => {
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

      let { _page, _limit, _sort, _order, role } = req.query;
      const page = Number(_page) || 1;
      let offset = 0;
      if (page) {
        offset = (page - 1) * (_limit ? parseInt(_limit) : 10);
      }
      const sort = _sort || 'id';
      const order = _order || 'DESC';
      const limit = _limit ? parseInt(limit) : null;

      try {
        let users = await User.findAndCountAll({
          where: role ? { role } : {},
          attributes: [
            'id',
            'nickname',
            'username',
            'phone',
            'email',
            'avatarURL',
            'role',
          ],
          ...(_limit && { limit: _limit }),
          offset,
          order: [[sort, order]],
        });
        return res.status(200).json({
          ok: 1,
          data: users,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  register: async (req, res, next) => {
    const { nickname, username, password, email, phone } = req.body;
    const avatar = req.file;

    if (!nickname || !username || !password || !email || !phone) {
      return res.status(400).json({
        ok: 0,
        message: 'nickname, username, password, email, phone are required',
      });
    }

    try {
      let user = await User.findOne({
        where: {
          username,
        },
      });
      if (user) {
        return res.status(400).json({
          ok: 0,
          message: 'username is duplicated',
        });
      }
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      });
    }

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }

      if (avatar) {
        const encodeImage = avatar.buffer.toString('base64');
        uploadImg(encodeImage, album, async (err, link) => {
          if (err) {
            return res.status(500).json({
              ok: 0,
              message: err.toString(),
            });
          }

          try {
            const user = await User.create({
              nickname,
              username,
              password: hash,
              email,
              phone,
              avatarURL: link,
            });

            if (user) {
              const payload = {
                userId: user.id,
                username: user.username,
                role: 'member',
                vendorId: null,
              };

              const token = jwt.sign(
                {
                  payload,
                  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
                },
                secretKey
              );

              return res.status(200).json({
                ok: 1,
                token,
              });
            }
          } catch (err) {
            return res.status(500).json({
              ok: 0,
              message: err.toString(),
            });
          }
        });
      } else {
        try {
          const user = await User.create({
            nickname,
            username,
            password: hash,
            email,
            phone,
          });

          if (user) {
            const payload = {
              userId: user.id,
              username: user.username,
              role: 'member',
              vendorId: null,
            };

            const token = jwt.sign(
              {
                payload,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
              },
              secretKey
            );

            return res.status(200).json({
              ok: 1,
              token,
            });
          }
        } catch (err) {
          return res.status(500).json({
            ok: 0,
            message: err.toString(),
          });
        }
      }
    });
  },

  login: async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        ok: 0,
        message: 'username and password are required',
      });
    }
    let user;
    try {
      user = await User.findOne({
        where: {
          username,
        },
      });
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      });
    }
    if (!user) {
      return res.status(400).json({
        ok: 0,
        message: 'username does not exist',
      });
    }

    bcrypt.compare(password, user.password, (err, isSuccess) => {
      if (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
      if (!isSuccess) {
        return res.status(400).json({
          ok: 0,
          message: 'password is wrong',
        });
      }
      const payload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        vendorId: user.vendorId,
      };

      const token = jwt.sign(
        {
          payload,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        },
        secretKey
      );

      return res.status(200).json({
        ok: 1,
        token: token,
      });
    });
  },

  updateMe: (req, res, next) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }
      const { nickname, email, phone, isDeleteAvatar } = req.body;
      const avatar = req.file;

      if (!nickname || !email || !phone) {
        return res.status(400).json({
          ok: 0,
          message: 'nickname, email, phone are required',
        });
      }

      let user;
      try {
        user = await User.findOne({
          where: {
            id: decoded.payload.userId,
          },
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }

      const params = {};
      if (nickname !== user.nickname) params.nickname = nickname;
      if (email !== user.email) params.email = email;
      if (phone !== user.phone) params.phone = phone;

      if (avatar) {
        if (user.avatarURL) {
          deleteImg(user.avatarURL, (err) => {
            if (err) {
              return res.status(500).json({
                ok: 0,
                message: err.toString(),
              });
            }
          });
        }
        const encodeImage = avatar.buffer.toString('base64');
        uploadImg(encodeImage, album, async (err, link) => {
          if (err) {
            return res.status(500).json({
              ok: 0,
              message: err.toString(),
            });
          }

          params.avatarURL = link;
          try {
            await user.update(params);
            return res.status(200).json({
              ok: 1,
              message: 'Success',
            });
          } catch (err) {
            return res.status(500).json({
              ok: 0,
              message: err.toString(),
            });
          }
        });
      } else {
        if (isDeleteAvatar) {
          console.log(typeof isDeleteAvatar);
          deleteImg(user.avatarURL, (err) => {
            if (err) {
              return res.status(500).json({
                ok: 0,
                message: err.toString(),
              });
            }
          });
          params.avatarURL = null;
        }
        console.log(2);
        try {
          await user.update(params);
          return res.status(200).json({
            ok: 1,
            message: 'Success',
          });
        } catch (err) {
          return res.status(500).json({
            ok: 0,
            message: err.toString(),
          });
        }
      }
    });
  },

  updateById: (req, res, next) => {
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
      const { nickname, email, phone } = req.body;
      const avatar = req.file;

      if (!nickname || !email || !phone) {
        return res.status(400).json({
          ok: 0,
          message: 'nickname, email, phone are required',
        });
      }

      let user;
      try {
        user = await User.findOne({
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

      const params = {};
      if (nickname !== user.nickname) params.nickname = nickname;
      if (email !== user.email) params.email = email;
      if (phone !== user.phone) params.phone = phone;

      if (avatar) {
        if (user.avatarURL) {
          deleteImg(user.avatarURL, (err) => {
            if (err) {
              return res.status(500).json({
                ok: 0,
                message: err.toString(),
              });
            }
          });
        }
        const encodeImage = avatar.buffer.toString('base64');
        uploadImg(encodeImage, album, async (err, link) => {
          if (err) {
            return res.status(500).json({
              ok: 0,
              message: err.toString(),
            });
          }

          params.avatarURL = link;
          try {
            await user.update(params);
            return res.status(200).json({
              ok: 1,
              message: 'Success',
            });
          } catch (err) {
            return res.status(500).json({
              ok: 0,
              message: err.toString(),
            });
          }
        });
      } else {
        try {
          await user.update(params);
          return res.status(200).json({
            ok: 1,
            message: 'Success',
          });
        } catch (err) {
          return res.status(500).json({
            ok: 0,
            message: err.toString(),
          });
        }
      }
    });
  },

  updateRole: async (req, res, next) => {
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
      let user;
      try {
        user = await User.findOne({
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

      if (user.role === 'admin') {
        return res.status(500).json({
          ok: 0,
          message: 'Cannot suspend administrator',
        });
      }

      let newRole;
      if (user.role === 'suspended') {
        newRole = user.vendorId ? 'vendor' : 'member';
      } else {
        newRole = 'suspended';
      }

      try {
        await user.update({
          role: newRole,
        });
        return res.status(200).json({
          ok: 1,
          message: 'Success',
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  updatePassword: async (req, res, next) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      const { oldPassword, newPassword, confirmPassword } = req.body;
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          ok: 0,
          message: 'oldPassword, newPassword, confirmPassword is required',
        });
      }

      if (oldPassword === newPassword) {
        return res.status(400).json({
          ok: 0,
          message: 'oldPassword and newPassword are the same.',
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          ok: 0,
          message: 'newPassword and confirmPassword are inconsistent.',
        });
      }

      try {
        let user = await User.findOne({
          where: {
            id: decoded.payload.userId,
          },
        });

        bcrypt.compare(oldPassword, user.password, (err, isSuccess) => {
          if (err) {
            return res.status(500).json({
              ok: 0,
              message: err.toString(),
            });
          }

          if (!isSuccess) {
            return res.status(400).json({
              ok: 0,
              message: 'oldPassword is wrong',
            });
          }

          bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
            if (err) {
              return res.status(500).json({
                ok: 0,
                message: err.toString(),
              });
            }

            try {
              await user.update({
                password: hash,
              });
              return res.status(200).json({
                ok: 1,
                message: 'Success',
              });
            } catch (err) {
              return res.status(500).json({
                ok: 0,
                message: err.toString(),
              });
            }
          });
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

module.exports = userController;
