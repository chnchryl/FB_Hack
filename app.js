const express = require('express')
const path = require('path')
const http = require('http')
const app = express()
const plotly = require('plotly')("WenquanZou", "hmjKVkVTlnhDioGsIVkL")

const PORT = process.env.PORT || 5000

const Freq = require('wordfrequenter')

const test = 'this is a cool test string this is cool cool cool'

const wf = new Freq(test.split(' '))

wf.set('string')
console.dir(wf.get('cool'))
console.dir(wf.list())

app.get('/', (req, res) => {
  console.log(__dirname)
  res.sendFile(__dirname + '/index.html')
})

var data = [{x:[0,1,2], y:[3,2,1], type: 'bar'}];
var layout = {fileopt : "overwrite", filename : "simple-node-example"};

plotly.plot(data, layout, function (err, msg) {
	if (err) return console.log(err);
	console.log(msg);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
