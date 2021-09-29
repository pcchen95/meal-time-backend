const request = require('request');

const token = 'c314952f033e6c738916f4bd5c73e1d4936f9457';
const apiUrl = 'https://api.imgur.com/3/image';

function uploadImg(encodeImage, album, cb) {
  const option = {
    url: apiUrl,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    formData: {
      image: encodeImage,
      album: album,
    },
  };

  request.post(option, (err, res, body) => {
    if (err) cb(err);
    try {
      const json = JSON.parse(body);
      cb(null, json.data.link);
    } catch (err) {
      cb(err);
    }
  });
}

function uploadMultipleImg(imgInfos, cb) {
  let links = [];
  let count = Object.keys(imgInfos).length;
  Object.entries(imgInfos).forEach(([key, value]) => {
    const { encodeImage, album } = value;
    const option = {
      url: apiUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      formData: {
        image: encodeImage,
        album,
      },
    };
    return request.post(option, (err, res, body) => {
      if (err) cb(err);
      try {
        const json = JSON.parse(body);
        addToLinkArray(key, json.data.link);
      } catch (err) {
        cb(err);
      }
    });
  });

  function addToLinkArray(name, link) {
    links[name] = link;

    if (Object.keys(links).length === count) {
      cb(null, links);
    }
  }
}

function deleteImg(url, cb) {
  const end = url.lastIndexOf('.');
  const start = url.lastIndexOf('/') + 1;
  const imageHash = url.slice(start, end);
  const option = {
    url: `${apiUrl}/${imageHash}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  request.delete(option, (err, res, body) => cb(err));
}

module.exports = {
  token,
  apiUrl,
  uploadImg,
  uploadMultipleImg,
  deleteImg,
};
