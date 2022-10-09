const { Sequelize, DataTypes } = require('sequelize')

let bizSequelize

exports.getDB = async function() {
  if (bizSequelize) {
    return bizSequelize
  }
  // dtm_busi中存在 user_account 和 barrier两张表
  // 可替换自己本地db地址
  bizSequelize = new Sequelize('dtm_busi', 'root', '***', {
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
  })

  await bizSequelize.authenticate()

  return bizSequelize
}

let UserAccount
exports.initModel = function(sequelize) {
  UserAccount = sequelize.define('user_account', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT,
    },
    balance: {
      type: DataTypes.NUMBER
    },
    tradingBalance: {
      type: DataTypes.NUMBER
    }
  }, {
    tableName: 'user_account',
    underscored: true,
    createdAt: 'create_time',
    updatedAt: 'update_time',
  })
}

exports.getUserAccount = function() {
  return UserAccount
}