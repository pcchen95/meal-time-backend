const db = require('../models');
const jwt = require('jsonwebtoken');
const { uploadImg, deleteImg, uploadMultipleImg } = require('./imgur.js');
const { addressToLatLng } = require('./address.js');
const secretKey = require('../auth/secretKey');

const saltRounds = 10;
const { Vendor, VendorCategory, User } = db;
const avatarAlbum = 'nujdtHG';
const bannerAlbum = 'd0CNkYE';

const vendorController = {
  getVendorMe: async (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      if (!decoded.payload.vendorId) {
        return res.status(401).json({
          ok: 0,
          message: 'you are not a vendor',
        });
      }

      try {
        const vendor = await Vendor.findOne({
          where: {
            id: decoded.payload.vendorId,
          },
          include: {
            model: VendorCategory,
            attributes: ['name'],
          },
        });
        return res.status(200).json({
          ok: 1,
          data: vendor,
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }
    });
  },

  getVendorById: async (req, res) => {
    try {
      const vendor = await Vendor.findOne({
        where: {
          id: req.params.id,
        },
        include: {
          model: VendorCategory,
          attributes: ['name'],
        },
      });

      return res.status(200).json({
        ok: 1,
        data: vendor,
      });
    } catch (err) {
      return res.status(500).json({
        ok: 0,
        message: err.toString(),
      });
    }
  },

  getAllVendors: async (req, res) => {
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

      let { _page, _limit, _sort, _order, categoryId } = req.query;
      const page = Number(_page) || 1;
      let offset = 0;
      if (page) {
        offset = (page - 1) * (_limit ? parseInt(_limit) : 10);
      }
      const sort = _sort || 'id';
      const order = _order || 'DESC';
      const limit = _limit ? parseInt(_limit) : 10;

      try {
        const vendors = await Vendor.findAll({
          where: categoryId ? { categoryId } : {},
          include: {
            model: VendorCategory,
            attributes: ['name'],
          },
          limit,
          offset,
          order: [[sort, order]],
        });
        return res.status(200).json({
          ok: 1,
          data: vendors,
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
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      if (decoded.payload.vendorId) {
        return res.status(400).json({
          ok: 0,
          message: 'you are already a vendor',
        });
      }
      const {
        vendorName,
        address,
        phone,
        categoryId,
        description,
        openingHour,
      } = req.body;

      if (!vendorName || !address || !phone || !openingHour) {
        return res.status(400).json({
          ok: 0,
          message: 'All fields are required.',
        });
      }

      let params = {
        userId: decoded.payload.userId,
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

      let vendor;
      await addressToLatLng(address, async (err, location) => {
        if (err) {
          return res.status(500).json({
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
            async (err, links) => {
              if (err) {
                return res.status(500).json({
                  ok: 0,
                  message: err.toString(),
                });
              }
              const { avatar, banner } = links;
              params.avatarUrl = avatar;
              params.bannerUrl = banner;

              try {
                vendor = await Vendor.create(params);
              } catch (err) {
                return res.status(500).json({
                  ok: 0,
                  message: err.toString(),
                });
              }
            }
          );
        } else {
          try {
            vendor = await Vendor.create(params);
          } catch (err) {
            return res.status(500).json({
              ok: 0,
              message: err.toString(),
            });
          }
        }

        try {
          const user = await User.findOne({
            where: {
              id: decoded.payload.userId,
            },
          });
          const response = await user.update({
            role: 'vendor',
            vendorId: vendor.id,
          });

          if (response) {
            decoded.payload.vendorId = vendor.id;
            const token = jwt.sign(
              {
                payload: decoded.payload,
                exp: decoded.exp,
              },
              'my_secret_key'
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
    });
  },

  updateAuth: async (req, res, next) => {
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
      let vendor;
      try {
        vendor = await Vendor.findOne({
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

      try {
        await vendor.update({
          isSuspended: !vendor.isSuspended,
          isOpen: vendor.isOpen ? false : vendor.isOpen,
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

  updateVendorMe: async (req, res, next) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      if (!decoded.payload.vendorId) {
        return res.status(401).json({
          ok: 0,
          message: 'you are not a vendor',
        });
      }

      const {
        vendorName,
        address,
        phone,
        categoryId,
        description,
        openingHour,
        isDeleteAvatar,
        isDeleteBanner,
      } = req.body;

      if (!vendorName || !address || !phone || !openingHour) {
        return res.status(400).json({
          ok: 0,
          message: 'All fields are required.',
        });
      }

      const avatar = req.files['avatar'] ? req.files['avatar'][0] : null;
      const banner = req.files['banner'] ? req.files['banner'][0] : null;

      let vendor;
      try {
        vendor = await Vendor.findOne({
          where: {
            id: decoded.payload.vendorId,
          },
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }

      let params = {};
      if (vendorName !== vendor.vendorName) params.vendorName = vendorName;
      if (address !== vendor.address) params.address = address;
      if (phone !== vendor.phone) params.phone = phone;
      if (Number(categoryId) !== vendor.categoryId)
        params.categoryId = categoryId;
      if (description !== vendor.description) params.description = description;
      if (openingHour !== vendor.openingHour) params.openingHour = openingHour;

      if (isDeleteAvatar) {
        deleteImg(vendor.avatarUrl, (err) => {
          if (err) {
            return res.status(500).json({
              ok: 0,
              message: err.toString(),
            });
          }
        });
        params.avatarUrl = null;
      }

      if (isDeleteBanner) {
        deleteImg(vendor.bannerUrl, (err) => {
          if (err) {
            return res.status(500).json({
              ok: 0,
              message: err.toString(),
            });
          }
        });
        params.bannerUrl = null;
      }

      if (avatar || banner) {
        if (avatar && vendor.avatarUrl) {
          deleteImg(vendor.avatarUrl, (err) => {
            if (err) {
              return res.status(500).json({
                ok: 0,
                message: err.toString(),
              });
            }
          });
        }
        if (banner && vendor.bannerUrl) {
          deleteImg(vendor.bannerUrl, (err) => {
            if (err) {
              return res.status(500).json({
                ok: 0,
                message: err.toString(),
              });
            }
          });
        }
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
          async (err, links) => {
            if (err) {
              return res.status(500).json({
                ok: 0,
                message: err.toString(),
              });
            }
            const { avatar, banner } = links;
            console.log(avatar, banner);
            params.avatarUrl = avatar || params.avatarUrl;
            params.bannerUrl = banner || params.bannerUrl;

            if (params.address) {
              await addressToLatLng(address, async (err, location) => {
                if (err) {
                  return res.status(500).json({
                    ok: 0,
                    message: err.toString(),
                  });
                }
                const { lat, lng } = location;
                params.position = { type: 'Point', coordinates: [lat, lng] };
              });
            }

            try {
              const result = await vendor.update(params);
              if (result) {
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
        );
      } else {
        try {
          if (params.address) {
            await addressToLatLng(address, async (err, location) => {
              if (err) {
                return res.status(500).json({
                  ok: 0,
                  message: err.toString(),
                });
              }
              const { lat, lng } = location;
              params.position = { type: 'Point', coordinates: [lat, lng] };
            });
          }
          const result = await vendor.update(params);
          if (result) {
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
    });
  },

  updateById: async (req, res, next) => {
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
      const {
        vendorName,
        address,
        phone,
        categoryId,
        description,
        openingHour,
      } = req.body;

      if (!vendorName || !address || !phone || !openingHour) {
        return res.status(400).json({
          ok: 0,
          message: 'All fields are required.',
        });
      }

      const avatar = req.files['avatar'] ? req.files['avatar'][0] : null;
      const banner = req.files['banner'] ? req.files['banner'][0] : null;

      let vendor;
      try {
        vendor = await Vendor.findOne({
          where: {
            id: req.params.id,
          },
          include: {
            model: VendorCategory,
            attributes: ['name'],
          },
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }

      let params = {};
      if (vendorName !== vendor.vendorName) params.vendorName = vendorName;
      if (address !== vendor.address) params.address = address;
      if (phone !== vendor.phone) params.phone = phone;
      if (Number(categoryId) !== vendor.categoryId)
        params.categoryId = categoryId;
      if (description !== vendor.description) params.description = description;
      if (openingHour !== vendor.openingHour) params.openingHour = openingHour;

      if (isDeleteAvatar) {
        deleteImg(vendor.avatarUrl, (err) => {
          if (err) {
            return res.status(500).json({
              ok: 0,
              message: err.toString(),
            });
          }
        });
        params.avatarUrl = null;
      }

      if (isDeleteBanner) {
        deleteImg(vendor.bannerUrl, (err) => {
          if (err) {
            return res.status(500).json({
              ok: 0,
              message: err.toString(),
            });
          }
        });
        params.bannerUrl = null;
      }

      if (avatar || banner) {
        if (avatar && vendor.avatarUrl) {
          deleteImg(vendor.avatarUrl, (err) => {
            if (err) {
              return res.status(500).json({
                ok: 0,
                message: err.toString(),
              });
            }
          });
        }
        if (banner && vendor.bannerUrl) {
          deleteImg(vendor.bannerUrl, (err) => {
            if (err) {
              return res.status(500).json({
                ok: 0,
                message: err.toString(),
              });
            }
          });
        }
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
          async (err, links) => {
            if (err) {
              return res.status(500).json({
                ok: 0,
                message: err.toString(),
              });
            }
            const { avatar, banner } = links;
            console.log(avatar, banner);
            params.avatarUrl = avatar || params.avatarUrl;
            params.bannerUrl = banner || params.bannerUrl;

            if (params.address) {
              await addressToLatLng(address, async (err, location) => {
                if (err) {
                  return res.status(500).json({
                    ok: 0,
                    message: err.toString(),
                  });
                }
                const { lat, lng } = location;
                params.position = { type: 'Point', coordinates: [lat, lng] };
              });
            }

            try {
              const result = await vendor.update(params);
              if (result) {
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
        );
      } else {
        try {
          if (params.address) {
            await addressToLatLng(address, async (err, location) => {
              if (err) {
                return res.status(500).json({
                  ok: 0,
                  message: err.toString(),
                });
              }
              const { lat, lng } = location;
              params.position = { type: 'Point', coordinates: [lat, lng] };
            });
          }
          const result = await vendor.update(params);
          if (result) {
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
    });
  },

  setIsOpen: (req, res) => {
    jwt.verify(req.token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          ok: 0,
          message: err.toString(),
        });
      }

      if (!decoded.payload.vendorId) {
        return res.status(401).json({
          ok: 0,
          message: 'you are not a vendor',
        });
      }

      let vendor;
      try {
        vendor = await Vendor.findOne({
          where: {
            id: decoded.payload.vendorId,
          },
        });
      } catch (err) {
        return res.status(500).json({
          ok: 0,
          message: err.toString(),
        });
      }

      if (vendor) {
        if (vendor.isSuspended) {
          return res.status(400).json({
            ok: 0,
            message: 'you have been suspended',
          });
        }
        try {
          const response = vendor.update({ isOpen: !vendor.isOpen });
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
      }
    });
  },
};

module.exports = vendorController;
