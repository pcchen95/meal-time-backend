const bcrypt = require('bcrypt');
const db = require('../models');
const { uploadImg, deleteImg } = require('./imgur.js');

const saltRounds = 10;
const { User } = db;
const album = '19dKauX';

const userController = {
  register: (req, res) => {
    res.render('user/register');
  },

  handleRegister: (req, res, next) => {
    const { nickname, username, password, email, phone } = req.body;
    const avatar = req.file;

    if (!nickname || !username || !password || !email || !phone) {
      req.flash('errMessage', '請填入完整資料');
      return next();
    }

    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        req.flash('errMessage', err.toString());
        return next();
      }

      if (avatar) {
        const encodeImage = avatar.buffer.toString('base64');
        uploadImg(encodeImage, album, (err, link) => {
          if (err) {
            req.flash('errMessage', err.toString());
            return next();
          }
          User.create({
            nickname,
            username,
            password: hash,
            email,
            phone,
            avatarURL: link,
          })
            .then((user) => {
              req.session.username = username;
              return res.redirect('/');
            })
            .catch((err) => {
              req.flash('errMessage', err.toString());
              return next();
            });
        });
      } else {
        User.create({
          nickname,
          username,
          password: hash,
          email,
          phone,
        })
          .then((user) => {
            req.session.username = username;
            return res.redirect('/');
          })
          .catch((err) => {
            req.flash('errMessage', err.toString());
            return next();
          });
      }
    });
  },

  login: (req, res) => {
    res.render('user/login');
  },

  handleLogin: async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      req.flash('errMessage', '請填入完整資料');
      return next();
    }
    let user;
    try {
      user = await User.findOne({
        where: {
          username,
        },
      });
    } catch (err) {
      req.flash('errMessage', err.toString());
      return next();
    }
    if (!user) {
      req.flash('errMessage', '帳號錯誤');
      return next();
    }

    bcrypt.compare(password, user.password, (err, isSuccess) => {
      if (!isSuccess || err) {
        req.flash('errMessage', '密碼錯誤');
        return next();
      }
      req.session.username = user.username;
      res.redirect('/');
    });
  },

  logout: (req, res) => {
    req.session.username = null;
    res.redirect('/');
  },

  update: (req, res) => {
    res.render('user/profile');
  },

  handleUpdate: async (req, res, next) => {
    const { nickname, email, phone } = req.body;
    const avatar = req.file;

    if (!nickname || !email || !phone) {
      req.flash('errMessage', '請填入完整資料');
      return next();
    }

    let user;
    try {
      user = await User.findOne({
        where: {
          id: req.params.id,
        },
      });
    } catch (err) {
      req.flash('errMessage', err.toString());
      return res.send('error 1: ' + err.toString());
      return next();
    }

    if (avatar) {
      deleteImg(user.avatarURL, (err) => {
        if (err) {
          req.flash('errMessage', err.toString());
          return res.send('error 3: ' + err.toString());
          return next();
        }
      });
      const encodeImage = avatar.buffer.toString('base64');
      uploadImg(encodeImage, album, (err, link) => {
        if (err) {
          req.flash('errMessage', err.toString());
          return res.send('error 4: ' + err.toString());
          return next();
        }
        user
          .update({
            nickname,
            email,
            phone,
            avatarURL: link,
          })
          .then(() => {
            res.redirect('/user/profile');
          });
      });
    } else {
      user
        .update({
          nickname,
          email,
          phone,
        })
        .then(() => {
          res.redirect('/user/profile');
        });
    }
  },
};

module.exports = userController;
