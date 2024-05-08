const bodyParser = require('body-parser');
const express = require('express');
const app = express()

app.set('view engine', 'ejs')
app.set('views', './templates')

app.use(bodyParser.urlencoded({ extended: true }))

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
const mongoClient = new MongoClient(url);

var dataList = []

async function run(findName, author) {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("BaseForNode");
    const collection = db.collection("BaseForNode");

    if (author != "null") {
      var cursor = await collection.find({ name: new RegExp(findName), author: author }).toArray();
      await mongoClient.close();
      return await cursor
    } else {
      var cursor = await collection.find({ name: new RegExp(findName) }).toArray();
      await mongoClient.close();
      return await cursor
    }


  } catch (err) {
    console.log(err);
  } finally {
    await mongoClient.close();
  }
}

app.get('/', (req, res) => {
  res.render('page', { data: [], showButton: true })
})

app.post("/list", function (req, res) {
  const search = req.body["Search"];
  const author = req.body["selectpicker"];

  (async () => {
    dataList = await run(search, author)
    res.render("page", { data: dataList, Search: search, Author: author });
  })()
})

const PORT = 3000
app.listen(PORT, () => {
  console.log('server is run at http://localhost:3000/')
})
