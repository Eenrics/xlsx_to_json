const xlsx = require('node-xlsx');

const worksheets = xlsx.parse(process.argv[2]);

let lastContentId

for (let i = 0; i < worksheets[0].data.length; i++) {
    if (i === 0) console.log('*********THIS IS IGNORED***********')
    else if (i === 1) console.log('*********THIS IS SCHEMA***********')
    else if (worksheets[0].data[i].length === 2 && /[A-Z]\./.test(worksheets[0].data[i][1])) console.log('*********THIS IS TITLE***********')
    else if (worksheets[0].data[i].length === 2 && /\d\./.test(worksheets[0].data[i][1])) console.log('*********THIS IS SUBTITLE***********')
    else if (worksheets[0].data[i].length === 2) {
        if (worksheets[0].data[i][0]) lastContentId = worksheets[0].data[i][0]
        console.log('*********THIS IS DESCRIPTION***********', 'id: ', lastContentId)
    }
    else if (worksheets[0].data[i].length === 6 && /total carried to summary/i.test(worksheets[0].data[i][1])) console.log('*********THIS IS SUMMARY***********')
    else {
        if (worksheets[0].data[i][0]) lastContentId = worksheets[0].data[i][0]
        if (worksheets[0].data[i].length === 1) console.log('*********THIS IS EMPTY CONTENT*********', 'id: ', lastContentId)
        else console.log('*********THIS IS CONTENT*********', 'id: ', lastContentId)
    }
    console.log(worksheets[0].data[i], '\n')
}


// schema
// SCHEMA -- it is the schema .. the name of the columns for the content data // i will not add this to the table
// TITLE  --  id title // the title value worksheets[0].data[i][1]
// SUBTITLE -- title_id id subtitle  // the subtitle value worksheets[0].data[i][1]
// DESCRIPTION -- same as content but all value will be null except the description part // the description value worksheets[0].data[i][1]
// SUMMARY  --  subtitle_id summary // summary value worksheets[0].data[i][6]
// CONTENT -- item_no description unit quantity rate amount subtitle_id // item_no worksheets[0].data[i][0] if null take the previous content item_no, description worksheets[0].data[i][1], unit worksheets[0].data[i][2], quantity worksheets[0].data[i][3], rate worksheets[0].data[i][4], amount worksheets[0].data[i][5]


// console.log(process.argv[2], process.argv[3])