const bcrypt = require('bcrypt');
const db = require('../models');
const { uploadImg, deleteImg } = require('./imgur.js');

const saltRounds = 10;
const { User } = db;
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
    const { nickname, username, password, email, phone } = req.body;
    const avatar = req.file;

    if (!nickname || !username || !password || !email || !phone) {
      return res.json({
        ok: 0,
        message: '請填入所有必填欄位',
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
        message: '請輸入帳號及密碼',
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
        message: '此帳號不存在',
      });
    }

    bcrypt.compare(password, user.password, (err, isSuccess) => {
      if (!isSuccess || err) {
        return res.json({
          ok: 0,
          message: '密碼錯誤',
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
        message: '必填欄位不得為空',
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

        try {
          await user.update({
            nickname,
            email,
            phone,
            avatarURL: link,
          });
          return res.json({
            ok: 1,
            message: 'Success',
          });
        } catch (err) {
          return res.json({
            ok: 0,
            message: '更新失敗',
          });
        }
      });
    } else {
      try {
        await user.update({
          nickname,
          email,
          phone,
        });
        return res.json({
          ok: 1,
          message: 'Success',
        });
      } catch (err) {
        return res.json({
          ok: 0,
          message: '更新失敗',
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
        message: '更新失敗',
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

    if (!oldPassword !== !newPassword) {
      return res.json({
        ok: 0,
        message: 'oldPassword and newPassword are the same.',
      });
    }

    if (!newPassword !== !confirmPassword) {
      return res.json({
        ok: 0,
        message: 'newPassword and confirmPassword are inconsistent.',
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

    try {
      await user.update({
        password: newPassword,
      });
      return res.json({
        ok: 1,
        message: 'Success',
      });
    } catch (err) {
      return res.json({
        ok: 0,
        message: '更新失敗',
      });
    }
  },
};

module.exports = userController;
