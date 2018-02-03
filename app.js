const express = require('express')
const path = require('path')
const http = require('http')
const app = express()

const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
  console.log(__dirname)
  res.sendFile(__dirname + '/index.html')
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
