# 限時取餐 Meal Time - Backend

## 專案簡介

**限食取餐 meal time** 是因剩食議題而誕生的食物交易贈送平台。現代社會帶給人們資源與便利，但同時也造成了許多食物的浪費。透過**限食取餐 meal time**，可以即時將過剩的食物放上平台，提供給需要的人，讓食物不再有浪費。

這是 **限時取餐 Meal Time** 後端原始碼，採用 Express + Sequelize 開發。

專案前端請參考：[前端原始碼](https://github.com/pcchen95/meal-time)

## 使用技術
### 核心套件
* `express`：後端框架
* `sequelize`：ORM 框架
* `bcrypt`：密碼雜湊加密
* `jsonwebtoken`：身分驗證
* `multer`：上傳圖片
* `node-fetch`：在 Node.js 環境下使用 Fetch API
* `mysql2`：資料庫

### 第三方 API
* Imgur API：上傳圖床
* Google Maps API：地址經緯度定位

## 建置
1. 新增 `config/config.json`，格式為：
```json=
{
  "development": {
    "username": "",
    "password": "",
    "database": "",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "",
    "password": "",
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "",
    "password": "",
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

2. 新增 `auth/secretkey.js`，格式為：
```javascript=
const secretKey = 'your_key'
module.exports = secretKey
```

3. 申請 google map api，啟用 Geocoding API，取得 api key，並新增 `apiKey/key.js`，格式為：
```javascript=
module.exports = { googleApiKey: 'your google map api key' }
```

4. `npm install`

5.  執行 Sequelize migration `npx sequelize-cli db:migrate`

## 開發
```bash
# npm
npm run start
# yarn
yarn start
```

## 部屬
1. `npm run build`

## 相關文件
* [API 文件](https://hackmd.io/@meal-time/rJHnNgGXt)
* [資料庫架構](https://hackmd.io/@meal-time/BJVlZRpMF)

## 專案架構
```bash
├─ auth
│  └─ ensureToken.js
├─ controllers
│  ├─ address.js
│  ├─ faq.js
│  ├─ imgur.js
│  ├─ message.js
│  ├─ order.js
│  ├─ product.js
│  ├─ productCategory.js
│  ├─ user.js
│  ├─ vendor.js
│  └─ vendorCategory.js
├─ migrations
├─ models
│  ├─ faq.js
│  ├─ faqcategory.js
│  ├─ index.js
│  ├─ message.js
│  ├─ messagetoadmin.js
│  ├─ order.js
│  ├─ orderitem.js
│  ├─ product.js
│  ├─ productcategory.js
│  ├─ reportmessage.js
│  ├─ user.js
│  ├─ vendor.js
│  └─ vendorcategory.js
├─ .gitignore
├─ index.js
├─ package-lock.json
└─ package.json

```

## License

[MIT](https://choosealicense.com/licenses/mit/)
