//Dependency declaration
const express = require('express')
const path = require('path')
const http = require('http')
const app = express()
const fileSystem = require('fs')

const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
  console.log(__dirname)
  res.sendFile(__dirname + '/index.html')
})

var file = 'text.txt'

//Create the word table
var words = []
var freq = []

var data = fileSystem.readFileSync(file, 'utf8')

var wordsArray = split(data)
var wordsMap = createWordMap(wordsArray)
var finalWordsArray = sortByCount(wordsMap)

for (var i = 0; i < finalWordsArray.length - 1; i++) {
  words.push(finalWordsArray[i].name)
  freq.push(finalWordsArray[i].total)
}

console.log(words)
console.log(freq)

//Plot the graph
const plotly = require('plotly')("WenquanZou", "hmjKVkVTlnhDioGsIVkL")

var data = [{x:words, y:freq, type: "bar"}];
var layout = {fileopt : "overwrite", filename : "simple-node"};

plotly.plot(data, layout, function (err, msg) {
  if (err) return console.log(err);
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

function split(texts) {
  // split string by spaces (including spaces, tabs, and newlines)
  var wordsArray = texts.split(/\s+/)
  return wordsArray
}

function createWordMap (wordsArray) {

  // create map for word counts
  var wordsMap = {}

  wordsArray.forEach(function (key) {
    if (wordsMap.hasOwnProperty(key)) {
      wordsMap[key]++
    } else {
      wordsMap[key] = 1
    }
  })

  return wordsMap
}

function sortByCount (wordsMap) {

  // sort by count in descending order
  var finalWordsArray = [];
  finalWordsArray = Object.keys(wordsMap).map(function(key) {
    return {
      name: key,
      total: wordsMap[key]
    }
  })

  return finalWordsArray

}
