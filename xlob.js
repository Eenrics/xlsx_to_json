const xlsx = require('node-xlsx');

const express = require('express')
const app = express()

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
        GDB.push({title, data})
        console.log("pushed to db", GDB.length)
      }
      title = worksheets[0].data[i][1]
      data = []
      
    //   await Content.create({
    //     section_title: worksheets[0].data[i][1],
    //     content_type: 'section_title'
    //   })
    }

    else if (worksheets[0].data[i].length === 2 && /\d\./.test(worksheets[0].data[i][1])) {
      console.log('*********THIS IS SUBTITLE***********')

      if (subtitle !== '') {
        data.push({subtitle, content})
        console.log("pushed to data", data.length)
      } 
      subtitle = worksheets[0].data[i][1]
      content = []
      
    //   await Content.create({
    //     subtitle: worksheets[0].data[i][1],
    //     content_type: 'subtitle'
    //   });
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
      
    //   await Content.create({
    //     description: worksheets[0].data[i][1],
    //     item_no: lastContentId,
    //     content_type: 'description'
    //   });
    }

    // else if (worksheets[0].data[i].length === 6 && /total carried to summary/i.test(worksheets[0].data[i][1])) {
    //   console.log('*********THIS IS SUMMARY***********')
    //   await Content.create({
    //     summary: worksheets[0].data[i][1],
    //     total: worksheets[0].data[i][5],
    //     content_type: 'summary'
    //   });
    // }

    else {
      if (worksheets[0].data[i][0]) lastContentId = worksheets[0].data[i][0]
      if (worksheets[0].data[i].length === 1) console.log('*********THIS IS EMPTY CONTENT*********', 'id: ', lastContentId)
      else {
        console.log('*********THIS IS CONTENT*********', 'id: ', lastContentId)

        
        content.push( {
            item_id: lastContentId,
            description: worksheets[0].data[i][1],
            unit: worksheets[0].data[i][2],
            quantity: worksheets[0].data[i][3],
            rate: parseFloat(worksheets[0].data[i][4]),
            amount: worksheets[0].data[i][5] !== NaN ? parseFloat(worksheets[0].data[i][5]) : 0,
        })
        console.log("pushed to content", content.length)
        // await Content.create({
        //   item_no: lastContentId,
        //   description: worksheets[0].data[i][1],
        //   unit: worksheets[0].data[i][2],
        //   quantity: worksheets[0].data[i][3] !== '-' ? parseInt(worksheets[0].data[i][3]) : 0,
        //   rate: parseFloat(worksheets[0].data[i][4]),
        //   amount: worksheets[0].data[i][5] !== NaN ? parseFloat(worksheets[0].data[i][5]) : 0,
        //   content_type: 'content'
        // });
      }
    }
  }

  if (content.length !== 0 || subtitle !== '') data.push({subtitle, content}) 
  if (data.length !== 0 || title !== '') GDB.push({title, data}) 

  console.log('*********DATABASE POPULATED***********')
  console.log(JSON.stringify(GDB))
  console.log(GDB.length)
  return GDB
//   process.exit()
}

convert_to_db();

app.get('/', (req, res) => res.send(JSON.stringify(GDB)))

const port = process.env.PORT || 3000

app.listen(port, () => console.log('server is running', port))
