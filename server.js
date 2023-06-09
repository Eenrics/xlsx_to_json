const express = require('express')
const convert_to_db = require('./xlob')

const DB = convert_to_db()

const app = express()

app.get('/', (req, res) => res.send(JSON.stringify(DB)))

app.listen(3000, () => console.log('server is running'))