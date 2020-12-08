//Mongo setup
const MongoClient = require('mongodb').MongoClient
const uri = 'mongodb+srv://Admin:3grEEnp!gs@cluster0.dv95k.mongodb.net/aimdb?retryWrites=true&w=majority'; //Database String
const client = new MongoClient(uri, { 
  useNewUrlParser: true,
  useUnifiedTopology: true
})
client.connect(err => {
  const collection = client.db("p2_final_db").collection("vehicles")
  // perform actions on the collection object
  client.close()
})

//Setup Libraries and Middleware
let express = require('express') //Web Framework
let app = express()
let bodyParser = require('body-parser') //Middleware
let http = require('http').Server(app)

//Middleware Setup
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Setup Pug
app.set('views')
app.set('view engine', 'pug')

//Set public folder
app.use(express.static(__dirname + '/public'));

//Homepage route
app.get('/', function (req, res) {
  res.render('index')
})

//Reference create function
app.post('/create', function (req, res, next) {
  client.connect(err => {
    const vehicles = client.db("aimdb").collection("vehicles")
    
    let vehicle = { manufacturer: req.body.manufacturer, model: req.body.model, year: req.body.year, vin: req.body.vin, price: req.body.price }
    vehicles.insertOne(vehicle, function(err, res) {
      if (err) throw err
      console.log("1 vehicle inserted")
    })
  })
  res.send(`Vehicle ${req.body.vin} Created`)
})

//Find vehicle function
app.get('/update', function (req, res) {
  client.connect(err => {
    client.db("aimdb").collection("vehicles").findOne({vin: req.query.vin}, function(err, result) {
      if (err) throw err;
      res.render('update', { oldmanufacturer: result.manufacturer, oldmodel: result.model, oldyear: result.year, oldvin: result.vin, oldprice: result.price, manufacturer: result.manufacturer, model: result.model, year: result.year, vin: result.vin, price: result.price })
    })
  })
})

//Reference update function
app.post('/update', function(req, res) {
  client.connect(err => {
    if (err) throw err;
    let query = { manufacturer: req.body.oldmanufacturer, model: req.body.oldmodel, year: req.body.oldyear, vin: req.body.oldvin, price: req.body.oldprice };
    let newvalues = { $set: { manufacturer: req.body.manufacturer, model: req.body.model, year: req.body.year, vin: req.body.vin, price: req.body.price } };
    client.db("aimdb").collection("vehicles").updateOne(query, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated")
      })
  })
  res.send(`Vehicle ${req.body.vin} Updated`)
})

//Reference delete function
app.post('/delete', function(req, res) {
  client.connect(err => {
    if (err) throw err;
    let query = { manufacturer: req.body.manufacturer, model: req.body.model ? req.body.model : null, year: req.body.year ? req.body.year : null, vin: req.body.vin ? req.body.vin : null, price: req.body.price ? req.body.price : null }
    client.db("aimdb").collection("vehicles").deleteOne(query, function(err, obj) {
      if (err) throw err
      console.log("1 document deleted")
      res.send(`Vehicle ${req.body.vin} Deleted`)
    })
  })
})

//View webpage on port 5000
app.set('port', process.env.PORT || 5000)
http.listen(app.get('port'), function() {
    console.log('Listening on port', app.get('port'))
})