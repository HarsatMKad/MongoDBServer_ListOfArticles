const bodyParser = require('body-parser');
const express = require('express');
const app = express()

app.set('view engine', 'ejs')
app.set('views', './templates')

app.use(bodyParser.urlencoded({ extended: true }));

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
const mongoClient = new MongoClient(url);

var dataList = []
async function find(findName, author, startDate, endDate) {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("BaseForNode");
    const collection = db.collection("BaseForNode");

    if (startDate < endDate && author != "null") {
      var cursor = await collection.find({
        name: new RegExp(findName),
        author: author,
        posting_date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }).toArray();
      await mongoClient.close();
      return await cursor

    } else if (startDate < endDate && author == "null") {
      var cursor = await collection.find({
        name: new RegExp(findName),
        posting_date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }).toArray();
      await mongoClient.close();
      return await cursor

    } else if (startDate >= endDate && author != "null") {
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

async function findByID(id) {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("BaseForNode");
    const collection = db.collection("BaseForNode");

    mongo = require("mongodb")
    var cursor = await collection.find({ _id: new mongo.ObjectId(id) }).toArray();
    await mongoClient.close();
    return await cursor

  } catch (err) {
    console.log(err);
  } finally {
    await mongoClient.close();
  }
}

async function findTop() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("BaseForNode");
    const collection = db.collection("BaseForNode");

    mongo = require("mongodb")
    var cursor = await collection.aggregate([
      {
        $project: {
          name: 1,
          author: 1,
          posting_date: 1,
          reviews: 1,
          avgGrade: { $avg: "$reviews.grade" }
        }
      },
      {
        $sort: { avgGrade: -1 }
      }
    ]).toArray();
    await mongoClient.close();
    return await cursor

  } catch (err) {
    console.log(err);
  } finally {
    await mongoClient.close();
  }
}

async function insert(data) {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("BaseForNode");
    const collection = db.collection("BaseForNode");
    await collection.insertOne(data);
  } catch (err) {
    console.log(err);
  } finally {
    await mongoClient.close();
  }
}

async function del(id) {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("BaseForNode");
    const collection = db.collection("BaseForNode");
    const result = await collection.deleteOne({ _id: new mongo.ObjectId(id) });

  } catch (err) {
    console.log(err);
  } finally {
    await mongoClient.close();
  }
}

app.get('/', (req, res) => {
  res.render('page', { data: []})
})

const urlencodedParser = express.urlencoded({ extended: false });

app.get('/create', (req, res) => {
  res.render('create')
})

app.post('/created', function (req, res) {

  const articleName = req.body.articleName;
  const articleAuthor = req.body.articleAuthor;
  const currentDate = new Date();
  const articleMainText = req.body.articleContent;
  const articleTags = req.body.articleTags;

  const article = {
    name: articleName,
    author: articleAuthor,
    posting_date: currentDate,
    content: articleMainText,
    tags: articleTags,
    reviews: []
  };

  (async () => {
    const pageData = await insert(article)
    res.render('created')
    })();
})

app.post('/article', (req, res) => {
  const id = req.query.id;
  (async () => {
    const pageData = await findByID(id)
    res.render('article', { data: pageData, deleted: false })
  })();
})

app.post('/article/deleted', (req, res) => {
  const id = req.query.id;
  (async () => {
    const pageData = await findByID(id)
    res.render('article', { data: pageData, deleted: true })
  })();

  del(id);
})

app.post("/list", function (req, res) {
  const search = req.body.Search;
  const author = req.body.selectpicker;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  (async () => {
    dataList = await find(search, author, startDate, endDate)
    res.render("page", { data: dataList, Search: search, Author: author });
  })()
})

app.get("/topArticle", function (req, res) {
  (async () => {
    dataList = await findTop()
    res.render("topGrade", {data: dataList})
  })()
})

const PORT = 3000
app.listen(PORT, () => {
  console.log('server is run at http://localhost:3000/')
})
