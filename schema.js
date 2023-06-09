const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('xlsx_db', 'xlsx', 'xlsx', {
  host: 'localhost',
  dialect: 'mysql'
});

const Title = sequelize.define('title', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Subtitle = sequelize.define('subtitle', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Item = sequelize.define('item', {
  item_id: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  unit: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quantity: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rate: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  amount: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

Title.hasMany(Subtitle);
Subtitle.belongsTo(Title);

Subtitle.hasMany(Item);
Item.belongsTo(Subtitle);

sequelize.sync();