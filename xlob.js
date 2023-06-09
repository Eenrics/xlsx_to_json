const xlsx = require('node-xlsx');

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

// sequelize.sync();


let title = ''
let subtitle = ''
let content = []
let data = []

const DB = [
  {
    title: 'A. something', //string
    data: [
        {
          subtitle: "1. something", //string
          content: [
            {
                item_id: 1.1, //float
                description: 'something', //string
                unit: 'something', //string
                quantity: 0, //integer
                rate: 10.00, //float fixed 2
                amount: 1000 // integer
            }
          ]
        }
    ]
  }
]

let GDB = []

const worksheets = xlsx.parse(process.argv[2]);

const convert_to_db = async () => {

  let lastContentId

  for (let i = 0; i < worksheets[0].data.length; i++) {
//   for (let i = 0; i < 25; i++) {

    if (worksheets[0].data[i].length === 0) console.log('*********THIS IS IGNORED***********')

    else if (i === 1) console.log('*********THIS IS SCHEMA***********')

    else if (worksheets[0].data[i].length === 2 && /[A-Z]\./.test(worksheets[0].data[i][1])) {
      console.log('*********THIS IS SECTION TITLE***********')

      if (title !== '') {

        if (subtitle !== '') {
            data.push({subtitle, content})
            console.log("pushed to data", data.length)
          }
          subtitle = ''
          content = []
    

        GDB.push({title, data})
        console.log("pushed to db", GDB.length)
      }
      title = worksheets[0].data[i][1]
      data = []
    }

    else if (worksheets[0].data[i].length === 2 && /\d\./.test(worksheets[0].data[i][1])) {
      console.log('*********THIS IS SUBTITLE***********')

      if (subtitle !== '') {
        data.push({subtitle, content})
        console.log("pushed to data", data.length)
      }
      console.log('subtitle', subtitle)
      console.log('title', title)

      subtitle = worksheets[0].data[i][1]
      content = []

      console.log('subtitle', subtitle)
      console.log('title', title)
    }

    else if (worksheets[0].data[i].length === 2) {
      if (worksheets[0].data[i][0]) lastContentId = worksheets[0].data[i][0]
      console.log('*********THIS IS DESCRIPTION***********', 'id: ', lastContentId)

      content.push( {
        item_id: lastContentId,
        description: worksheets[0].data[i][1],
        unit: null,
        quantity: null,
        rate: null,
        amount: null,
    })
    console.log("pushed to content", content.length)
    }

    else if (worksheets[0].data[i].length === 6 && /total carried to summary/i.test(worksheets[0].data[i][1])) {
      console.log('*********THIS IS SUMMARY***********')
    }

    else {
      if (worksheets[0].data[i][0]) lastContentId = worksheets[0].data[i][0]
      if (worksheets[0].data[i].length === 1) console.log('*********THIS IS EMPTY CONTENT*********', 'id: ', lastContentId)
      else {
        console.log('*********THIS IS CONTENT*********', 'id: ', lastContentId)

        
        content.push( {
            item_id: lastContentId,
            description: worksheets[0].data[i][1],
            unit: worksheets[0].data[i][2],
            quantity: worksheets[0].data[i][3] === '-' ? worksheets[0].data[i][3] : parseFloat(worksheets[0].data[i][3]).toFixed(2),
            rate: parseFloat(worksheets[0].data[i][4]).toFixed(2),
            amount: worksheets[0].data[i][5] !== NaN ? (worksheets[0].data[i][5] === '-' ? worksheets[0].data[i][5] : parseFloat(worksheets[0].data[i][5]).toFixed(2)) : 0,
        })
        console.log("pushed to content", content.length)
      }
    }
  }

  if (content.length !== 0 || subtitle !== '') data.push({subtitle, content}) 
  if (data.length !== 0 || title !== '') GDB.push({title, data}) 

  console.log('*********DATABASE POPULATED***********')
  console.log(JSON.stringify(GDB[0].data.length))
  console.log(GDB.length)
  return GDB
}

convert_to_db();




// (async () => {
//     await sequelize.sync({ force: true }); // to drop and re-create tables
//     for (const title of GDB) {
//       const newTitle = await Title.create({ name: title.title });
//       for (const subtitle of title.data) {
//         const newSubtitle = await Subtitle.create({ name: subtitle.subtitle, titleId: newTitle.id });
//         for (const content of subtitle.content) {
//           await Item.create({
//             item_id: content.item_id,
//             description: content.description,
//             unit: content.unit,
//             quantity: content.quantity,
//             rate: content.rate,
//             amount: content.amount,
//             subtitleId: newSubtitle.id
//           });
//         }
//       }
//     }
//     console.log('Data inserted successfully');
//   })();

//   const DBT = [
//     {
//       title: 'A. something', //string
//       data: [
//           {
//             subtitle: "1. something", //string
//             content: [
//               {
//                   item_id: 1.1, //float
//                   description: 'something', //string
//                   unit: 'something', //string
//                   quantity: 0, //integer
//                   rate: 10.00, //float fixed 2
//                   amount: 1000 // integer
//               }
//             ]
//           }
//       ]
//     }
//   ]

const express = require('express')
const app = express()

app.get('/', (req, res) => res.send(JSON.stringify(GDB)))

app.listen(3000, () => console.log('server is running'))