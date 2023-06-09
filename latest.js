const xlsx = require('node-xlsx');

let title = ''
let subtitle = ''
let content = []
let data = []

const DB = [
  {
    title: 'A. something',
    data: [
        {
          subtitle: "1. something",
          content: [
            {
                item_id: 1.1,
                description: 'something',
                unit: 'something',
                quantity: 0,
                rate: 10.00,
                amount: 1000
            }
          ]
        }
    ]
  }
]

const Content = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  item_no: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true
  },
  subtitle: {
    type: Sequelize.STRING,
    allowNull: true
  },
  unit: {
    type: Sequelize.STRING,
    allowNull: true
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  rate: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  amount: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  section_title: {
    type: Sequelize.STRING,
    allowNull: true
  },
  summary: {
    type: Sequelize.STRING,
    allowNull: true
  },
  total: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  content_type: {
    type: Sequelize.STRING,
    allowNull: false
  }
}


const worksheets = xlsx.parse(process.argv[2]);

const convert_to_db = async () => {

  let lastContentId

  for (let i = 0; i < worksheets[0].data.length; i++) {

    if (worksheets[0].data[i].length === 0) console.log('*********THIS IS IGNORED***********')

    else if (i === 1) console.log('*********THIS IS SCHEMA***********')

    else if (worksheets[0].data[i].length === 2 && /[A-Z]\./.test(worksheets[0].data[i][1])) {
      console.log('*********THIS IS SECTION TITLE***********')
      await Content.create({
        section_title: worksheets[0].data[i][1],
        content_type: 'section_title'
      })
    }

    else if (worksheets[0].data[i].length === 2 && /\d\./.test(worksheets[0].data[i][1])) {
      console.log('*********THIS IS SUBTITLE***********')
      await Content.create({
        subtitle: worksheets[0].data[i][1],
        content_type: 'subtitle'
      });
    }

    else if (worksheets[0].data[i].length === 2) {
      if (worksheets[0].data[i][0]) lastContentId = worksheets[0].data[i][0]
      console.log('*********THIS IS DESCRIPTION***********', 'id: ', lastContentId)
      await Content.create({
        description: worksheets[0].data[i][1],
        item_no: lastContentId,
        content_type: 'description'
      });
    }

    else if (worksheets[0].data[i].length === 6 && /total carried to summary/i.test(worksheets[0].data[i][1])) {
      console.log('*********THIS IS SUMMARY***********')
      await Content.create({
        summary: worksheets[0].data[i][1],
        total: worksheets[0].data[i][5],
        content_type: 'summary'
      });
    }

    else {
      if (worksheets[0].data[i][0]) lastContentId = worksheets[0].data[i][0]
      if (worksheets[0].data[i].length === 1) console.log('*********THIS IS EMPTY CONTENT*********', 'id: ', lastContentId)
      else {
        console.log('*********THIS IS CONTENT*********', 'id: ', lastContentId)
        // if 
        // let amount = 
        await Content.create({
          item_no: lastContentId,
          description: worksheets[0].data[i][1],
          unit: worksheets[0].data[i][2],
          quantity: worksheets[0].data[i][3] !== '-' ? parseInt(worksheets[0].data[i][3]) : 0,
          rate: parseFloat(worksheets[0].data[i][4]),
          amount: worksheets[0].data[i][5] !== NaN ? parseFloat(worksheets[0].data[i][5]) : 0,
          content_type: 'content'
        });
      }
    }
  }

  console.log('*********DATABASE POPULATED***********')
  process.exit()
}

convert_to_db();