const xlsx = require('node-xlsx');
const uuid = require('uuid');

const { Sequelize, DataTypes, UUIDV4 } = require('sequelize');

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
            data.push({subtitle, content, id: uuid.v4()})
            console.log("pushed to data", data.length)
          }
          subtitle = ''
          content = []
    

        GDB.push({title, data, id: uuid.v4()})
        console.log("pushed to db", GDB.length)
      }
      title = worksheets[0].data[i][1]
      data = []
    }

    else if (worksheets[0].data[i].length === 2 && /\d\./.test(worksheets[0].data[i][1])) {
      console.log('*********THIS IS SUBTITLE***********')

      if (subtitle !== '') {
        data.push({subtitle, content, id: uuid.v4()})
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
        id: uuid.v4(),
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
          id: uuid.v4(),
            item_id: lastContentId,
            description: worksheets[0].data[i][1],
            unit: worksheets[0].data[i][2],
            quantity: parseFloat(worksheets[0].data[i][3]).toFixed(2),
            rate: parseFloat(worksheets[0].data[i][4]).toFixed(2),
            amount: worksheets[0].data[i][5] !== NaN ? parseFloat(worksheets[0].data[i][5]).toFixed(2) : 0,
        })
        console.log("pushed to content", content.length)
      }
    }
  }

  if (content.length !== 0 || subtitle !== '') data.push({subtitle, content, id: uuid.v4()}) 
  if (data.length !== 0 || title !== '') GDB.push({title, data, id: uuid.v4()}) 

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


const findTitle = (id) => {
  GDB.map(t => console.log(t.id))
  const result = GDB.find(t => t.id === id)
  if (result) return result
  return {error: "no data for this id"}
}


const findSubTitle = (id) => {
  // GDB.map(t => console.log(t.id))
  let result
  for (let i = 0; i < GDB.length; i++) {
    const r = GDB[i].data.find(t => t.id === id)
    if (r) result = r
  }
  if (result) return result
  return {error: "no data for this id"}
}

const findContent = (id) => {
  // GDB.map(t => console.log(t.id))
  let result
  for (let i = 0; i < GDB.length; i++) {
    for (let j = 0; j < GDB[i].data.length; j++) {
      const d = GDB[i].data[j].content.find(t => t.id === id)
    if (d) result = d
    }
  }
  if (result) return result
  return {error: "no data for this id"}
}








// const addTitle = (data) => {
//   if (!CharacterData) return {error: "no data for this id"}
//   const newTitle = {title, data, id: uuid.v4()}
//   GDB.push(newTitle)
//   return newTitle
// }


// const addSubTitle = (titleId, data) => {
//   // GDB.map(t => console.log(t.id))
//   let result
//   for (let i = 0; i < GDB.length; i++) {
//     const r = GDB[i].data.find(t => t.id === id)
//     if (r) result = r
//   }
//   if (result) return result
//   return {error: "no data for this id"}
// }

// const addContent = (id) => {
//   // GDB.map(t => console.log(t.id))
//   let result
//   for (let i = 0; i < GDB.length; i++) {
//     for (let j = 0; j < GDB[i].data.length; j++) {
//       const d = GDB[i].data[j].content.find(t => t.id === id)
//     if (d) result = d
//     }
//   }
//   if (result) return result
//   return {error: "no data for this id"}
// }





const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

app.use(express.static('dist'))
const path = require('path')
app.use('/', express.static(path.join(__dirname, 'dist')))

// app.get('/', (req, res) => res.json(GDB))
app.get('/data', (req, res) => res.json(GDB))

app.get('/title/:id', (req, res) => res.json(findTitle(req.params.id)))
app.get('/subtitle/:id', (req, res) => res.json(findSubTitle(req.params.id)))
app.get('/content/:id', (req, res) => res.json(findContent(req.params.id)))

// app.post('/title/:id', (req, res) => res.json(addTitle(req.params.id)))
// app.post('/subtitle/:id', (req, res) => res.json(addSubTitle(req.params.id)))
// app.post('/content/:id', (req, res) => res.json(addContent(req.params.id)))

// app.put('/title/:id', (req, res) => res.json(editTitle(req.params.id)))
// app.put('/subtitle/:id', (req, res) => res.json(editSubTitle(req.params.id)))
// app.put('/content/:id', (req, res) => res.json(editContent(req.params.id)))

// app.delete('/title/:id', (req, res) => res.json(deleteTitle(req.params.id)))
// app.delete('/subtitle/:id', (req, res) => res.json(deleteSubTitle(req.params.id)))
// app.delete('/content/:id', (req, res) => res.json(deleteContent(req.params.id)))

app.get('/count', (req, res) => res.send({title: GDB.length, subtitle: GDB.reduce((s, e) => s + e.data.length), content: GDB.reduce((s, e) => s + e.data.reduce((sm, el) => sm + el.content.length))}))
const port = process.env.PORT || 3000
app.listen(port, () => console.log('server is running on port', port))