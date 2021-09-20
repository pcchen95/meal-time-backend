const bcrypt = require('bcrypt');
const db = require('../models');
const { uploadImg, deleteImg } = require('./imgur.js');

const saltRounds = 10;
const { User, Vendor } = db;
const album = '19dKauX';

const userController = {
  getProfile: async (req, res, next) => {
    let user;
    try {
      user = await User.findOne({
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

      return res.json({
        ok: 1,
        data: user,
      });
    } catch (err) {
      return res.json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  getAllProfiles: async (req, res, next) => {
    let users;
    try {
      users = await User.findAll({
        attributes: [
          'id',
          'nickname',
          'username',
          'phone',
          'email',
          'avatarURL',
          'role',
        ],
      });
      return res.json({
        ok: 1,
        data: users,
      });
    } catch (err) {
      return res.json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  handleRegister: (req, res, next) => {
    const { nickname, username, password, confirmPassword, email, phone } = req.body;
    const avatar = req.file;

    if (!nickname || !username || !password || !confirmPassword || !email || !phone) {
      return res.json({
        ok: 0,
        message: 'nickname, username, password, confirmPassword, email, phone are required',
      });
    }

    if (password !== confirmPassword) {
      return res.json({
        ok: 0,
        message: 'password and confirmPassword are inconsistent',
      });
    }

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        return res.json({
          ok: 0,
          message: err.toString(),
        });
      }

      if (avatar) {
        const encodeImage = avatar.buffer.toString('base64');
        uploadImg(encodeImage, album, async (err, link) => {
          if (err) {
            return res.json({
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
              return res.json({
                ok: 1,
                message: 'Success',
              });
            }
          } catch (err) {
            return res.json({
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
            return res.json({
              ok: 1,
              message: 'Success',
            });
          }
        } catch (err) {
          return res.json({
            ok: 0,
            message: err.toString(),
          });
        }
      }
    });
  },

  handleLogin: async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.json({
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
      return res.json({
        ok: 0,
        message: err.toString(),
      });
    }
    if (!user) {
      return res.json({
        ok: 0,
        message: 'username does not exist',
      });
    }

    bcrypt.compare(password, user.password, (err, isSuccess) => {
      if (err) {
        return res.json({
          ok: 0,
          message: err.toString(),
        });
      }
      if (!isSuccess) {
        return res.json({
          ok: 0,
          message: 'password is wrong',
        });
      }
      return res.json({
        ok: 1,
        message: 'Success',
      });
    });
  },

  handleUpdate: async (req, res, next) => {
    const { nickname, email, phone } = req.body;
    const avatar = req.file;

    if (!nickname || !email || !phone) {
      return res.json({
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
      return res.json({
        ok: 0,
        message: err.toString(),
      });
    }

    const params = {};
    if (nickname !== user.nickname) params.nickname = nickname;
    if (email !== user.email) params.email = email;
    if (phone !== user.phone) params.phone = phone;

    if (avatar) {
      deleteImg(user.avatarURL, (err) => {
        if (err) {
          return res.json({
            ok: 0,
            message: err.toString(),
          });
        }
      });
      const encodeImage = avatar.buffer.toString('base64');
      uploadImg(encodeImage, album, async (err, link) => {
        if (err) {
          return res.json({
            ok: 0,
            message: err.toString(),
          });
        }

        params.avatarURL = link;
        try {
          await user.update(params);
          return res.json({
            ok: 1,
            message: 'Success',
          });
        } catch (err) {
          return res.json({
            ok: 0,
            message: 'Failed',
          });
        }
      });
    } else {
      try {
        await user.update(params);
        return res.json({
          ok: 1,
          message: 'Success',
        });
      } catch (err) {
        return res.json({
          ok: 0,
          message: 'Failed',
        });
      }
    }
  },

  handleUpdateRole: async (req, res, next) => {
    let user;
    try {
      user = await User.findOne({
        where: {
          id: req.params.id,
        },
      });
    } catch (err) {
      return res.json({
        ok: 0,
        message: err.toString(),
      });
    }

    const newRole = user.role === 'suspended' ? 'member' : 'suspended';
    try {
      await user.update({
        role: newRole,
      });
      return res.json({
        ok: 1,
        message: 'Success',
      });
    } catch (err) {
      return res.json({
        ok: 0,
        message: 'Failed',
      });
    }
  },

  handleUpdatePassword: async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.json({
        ok: 0,
        message: 'oldPassword, newPassword, confirmPassword is required',
      });
    }

    if (oldPassword === newPassword) {
      return res.json({
        ok: 0,
        message: 'oldPassword and newPassword are the same.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.json({
        ok: 0,
        message: 'newPassword and confirmPassword are inconsistent.',
      });
    }

    try {
      let user = await User.findOne({
        where: {
          id: req.params.id,
        },
      });

      bcrypt.compare(oldPassword, user.password, (err, isSuccess) => {
        if (err) {
          return res.json({
            ok: 0,
            message: err.toString(),
          });
        }

        if (!isSuccess) {
          return res.json({
            ok: 0,
            message: 'oldPassword is wrong',
          });
        }

        bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
          if (err) {
            return res.json({
              ok: 0,
              message: err.toString(),
            });
          }
          
          try {
            await user.update({
              password: hash,
            });
            return res.json({
              ok: 1,
              message: 'Success',
            });
          } catch (err) {
            return res.json({
              ok: 0,
              message: 'Failed',
            });
          }
        })
      });
    } catch (err) {
      return res.json({
        ok: 0,
        message: err.toString(),
      });
    } 
  },
};

module.exports = userController;
