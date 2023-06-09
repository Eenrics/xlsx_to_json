const xlsx = require('node-xlsx');
const Sequelize = require('sequelize');

// Define the Sequelize models
const sequelize = new Sequelize('xlsx_db', 'xlsx', 'xlsx', {
  host: 'localhost',
  dialect: 'mysql'
});

const Title = sequelize.define('Title', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const Subtitle = sequelize.define('Subtitle', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subtitle: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const Description = sequelize.define('Description', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const Summary = sequelize.define('Summary', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  total: {
    type: Sequelize.FLOAT,
    allowNull: false
  }
});

const Content = sequelize.define('Content', {
  item_no: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  unit: {
    type: Sequelize.STRING,
    allowNull: false
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  rate: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false
  }
});

Title.hasMany(Subtitle);
Subtitle.belongsTo(Title);
Subtitle.hasMany(Description);
Description.belongsTo(Subtitle);
Subtitle.hasMany(Summary);
Summary.belongsTo(Subtitle);
Description.hasMany(Content);
Content.belongsTo(Description);

// Import data from the Excel file
const worksheets = xlsx.parse(process.argv[2]);

let currentTitle = null;
let currentSubtitle = null;
let currentDescription = null;

const convert_to_db = async () => {

    let lastId;

  for (let i = 0; i < worksheets[0].data.length; i++) {
    if (i === 0) {
      // Ignore the first row
      continue;
    } else if (i === 1) {
      // Skip the schema row
      continue;
    } else if (worksheets[0].data[i].length === 2 && /[A-Z]\./.test(worksheets[0].data[i][1])) {
      // This is a title row
      currentTitle = await Title.create({ title: worksheets[0].data[i][1] });
      currentSubtitle = null;
    } else if (worksheets[0].data[i].length === 2 && /\d\./.test(worksheets[0].data[i][1])) {
      // This is a subtitle row
      currentSubtitle = await Subtitle.create({ subtitle: worksheets[0].data[i][1], titleId: currentTitle.id });
      currentDescription = null;
    } else if (worksheets[0].data[i].length === 2) {
      // This is a description row
      currentDescription = await Description.create({ description: worksheets[0].data[i][1], subtitleId: currentSubtitle.id });
    } else if (worksheets[0].data[i].length === 6 && /total carried to summary/i.test(worksheets[0].data[i][1])) {
      // This is a summary row
      try {

          await Summary.create({ title: worksheets[0].data[i][1], total: worksheets[0].data[i][5], subtitleId: currentSubtitle.id });
      } catch {
          console.log(worksheets[0].data[i], worksheets[0].data[i][5])
          process.exit()
      }
    } else if (worksheets[0].data[i].length === 6) {
      // This is a content row
      if (worksheets[0].data[i][0] && worksheets[0].data[i][0] !== '-') lastId = worksheets[0].data[i][0]
      const itemNo = lastId;
      const quantity = worksheets[0].data[i][3] !== '-' ? parseInt(worksheets[0].data[i][3]) : 0;
      const rate = parseFloat(worksheets[0].data[i][4]);
      const amount = parseFloat(worksheets[0].data[i][5]);
      if (isNaN(rate)) {
        console.log(`Invalid rate value '${worksheets[0].data[i][4]}' at row ${i + 1}`);
      } else if (isNaN(amount)) {
        console.log(`Invalid amount value '${worksheets[0].data[i][5]}' at row ${i + 1}`);
      } else{
        await Content.create({
          item_no: itemNo,
          descriptionId: currentDescription ? currentDescription.id : 0,
          description: worksheets[0].data[i][1],
          unit: worksheets[0].data[i][2],
          quantity: quantity,
          rate: rate,
          amount: amount
        }).catch((error) => {
          if (error.name === 'SequelizeDatabaseError' && error.message.includes('Data truncated')) {
            console.log(`Data truncated error at row ${i + 1}`);
          } else {
            throw error;
          }
        });
      }
    }
  }
};

convert_to_db();