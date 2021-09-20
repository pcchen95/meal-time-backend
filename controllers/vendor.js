const db = require('../models');
const { uploadImg, deleteImg, uploadMultipleImg } = require('./imgur.js');
const { addressToLatLng } = require('./address.js');

const saltRounds = 10;
const { Vendor, User } = db;
const avatarAlbum = 'nujdtHG';
const bannerAlbum = 'd0CNkYE';

const vendorController = {
  getVendor: async (req, res, next) => {
    let vendor;
    try {
      vendor = await Vendor.findOne({
        where: {
          id: req.params.id,
        },
      });

      return res.json({
        ok: 1,
        data: vendor,
      });
    } catch (err) {
      return res.json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  getAllVendors: async (req, res, next) => {
    try {
      const vendors = await Vendor.findAll();
      return res.json({
        ok: 1,
        data: vendors,
      });
    } catch (err) {
      return res.json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  handleRegister: async (req, res, next) => {
    const {
      vendorName,
      address,
      phone,
      avatarUrl,
      bannerUrl,
      categoryId,
      description,
      openingHour,
    } = req.body;

    if (!vendorName || !address || !phone || !openingHour) {
      return res.json({
        ok: 0,
        message: 'All fields are required.',
      });
    }

    try {
      const user = await User.findOne({
        where: {
          id: req.params.id,
        },
      });
      await user.update({
        role: 'vendor',
      });
    } catch (err) {
      return res.json({
        ok: 0,
        message: err.toString(),
      });
    }

    let params = {
      userId: req.params.id,
      vendorName,
      address,
      phone,
      position: null,
      avatarUrl: null,
      bannerUrl: null,
      categoryId,
      description,
      openingHour,
    };
    const avatar = req.files['avatar'] ? req.files['avatar'][0] : null;
    const banner = req.files['banner'] ? req.files['banner'][0] : null;

    await addressToLatLng(address, (err, location) => {
      if (err) {
        return res.json({
          ok: 0,
          message: err.toString(),
        });
      }
      const { lat, lng } = location;
      params.position = { type: 'Point', coordinates: [lat, lng] };
      if (avatar || banner) {
        const encodeAvatar = avatar ? avatar.buffer.toString('base64') : '';
        const encodeBanner = banner ? banner.buffer.toString('base64') : '';
        uploadMultipleImg(
          {
            avatar: {
              encodeImage: encodeAvatar,
              album: avatarAlbum,
            },
            banner: {
              encodeImage: encodeBanner,
              album: bannerAlbum,
            },
          },
          (err, links) => {
            if (err) {
              return res.json({
                ok: 0,
                message: err.toString(),
              });
            }
            const { avatar, banner } = links;
            params.avatarUrl = avatar;
            params.bannerUrl = banner;

            try {
              const vendor = Vendor.create(params);
              if (vendor) {
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
        );
      } else {
        try {
          const vendor = Vendor.create(params);
          if (vendor) {
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

  handleUpdateAuth: async (req, res, next) => {
    let vendor;
    try {
      vendor = await Vendor.findOne({
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
      await vendor.update({
        isSuspended: !vendor.isSuspended,
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

  handleUpdate: async (req, res, next) => {
    const {
      vendorName,
      address,
      phone,
      avatarUrl,
      bannerUrl,
      categoryId,
      description,
      openingHour,
    } = req.body;

    if (!vendorName || !address || !phone || !openingHour) {
      return res.json({
        ok: 0,
        message: 'All fields are required.',
      });
    }
    let vendor;
    try {
      vendor = await Vendor.findOne({
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

    let params = {};
    if (vendorName !== vendor.vendorName) params.vendorName = vendorName;
    if (address !== vendor.address) params.address = address;
    if (phone !== vendor.phone) params.phone = phone;
    if (categoryId !== vendor.categoryId) params.categoryId = categoryId;
    if (description !== vendor.description) params.description = description;
    if (openingHour !== vendor.openingHour) params.openingHour = openingHour;

    const avatar = req.files['avatar'] ? req.files['avatar'][0] : null;
    const banner = req.files['banner'] ? req.files['banner'][0] : null;

    await addressToLatLng(address, (err, location) => {
      if (err) {
        return res.json({
          ok: 0,
          message: err.toString(),
        });
      }
      const { lat, lng } = location;
      params.position = { type: 'Point', coordinates: [lat, lng] };
      if (avatar || banner) {
        deleteImg(vendor.avatarUrl, (err) => {
          if (err) {
            return res.json({
              ok: 0,
              message: err.toString(),
            });
          }
        });
        deleteImg(vendor.bannerUrl, (err) => {
          if (err) {
            return res.json({
              ok: 0,
              message: err.toString(),
            });
          }
        });
        const encodeAvatar = avatar ? avatar.buffer.toString('base64') : '';
        const encodeBanner = banner ? banner.buffer.toString('base64') : '';
        uploadMultipleImg(
          {
            avatar: {
              encodeImage: encodeAvatar,
              album: avatarAlbum,
            },
            banner: {
              encodeImage: encodeBanner,
              album: bannerAlbum,
            },
          },
          (err, links) => {
            if (err) {
              return res.json({
                ok: 0,
                message: err.toString(),
              });
            }
            const { avatar, banner } = links;
            params.avatarUrl = avatar;
            params.bannerUrl = banner;

            try {
              const result = vendor.update(params);
              if (result) {
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
        );
      } else {
        try {
          const result = vendor.update(params);
          if (result) {
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
};

module.exports = vendorController;
