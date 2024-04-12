
const express = require('express');
const app = express();
const path = require("path");
let port = process.env.PORT ?? 4500

app.use(express.json());
app.use(function (request, response,next) {
    console.log("In comes a "+request.method+" to "+request.url);
    next();
})
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")

    next();
})

app.use('/public', express.static('public'))


const MongoClient = require('mongodb').MongoClient;
let db;

let lessonsCollection
let ordersCollection

MongoClient.connect('mongodb+srv://andrewokwudili599:pqFFwDToeCNY7akg@cluster0.mf7sol6.mongodb.net/', (err, client) => {
    db = client.db('coursework')
    lessonsCollection = db.collection('lessons');
    ordersCollection = db.collection('orders');
    console.log("connected to mongodb");
});

app.get('/lessons', (req, res, next) => {
    lessonsCollection.find({}).toArray((e, results) => {
            if (e) return next(e)
            res.send(results)
        }
    )
})
const ObjectID = require('mongodb').ObjectID;
app.put('/lesson', (req, res, next) => {
    let lessonId = req.body.lessonId;
    if (lessonId != null) {
        lessonsCollection.update(
            {
                _id: ObjectID(lessonId)
            },
            {
                $inc: {
                    spaces: 1
                }
            },
            {
                // tells mongodb to wait before callback function to process only 1 item
                safe: true, multi: false
            },
            (e, result) => {
                if (e) return next(e)
                res.send((result.result.n === 1) ? {msg: 'Successful'} : {msg: 'An error occurred.'})
            }
        )
    }
    else{
        res.status(400);
        res.send({error: "Invalid lessonId."});
    }
})

app.post('/order', (req, res, next) => {
    if (req.body.name != null && req.body.phone != null){
        ordersCollection.insert(req.body, (e, results) => {
                if (e) return next(e)
                res.send(results.ops)
            }
        )
    }
    else{
        res.status(400);
        res.send("Error, kindly pass all required parameters.");
    }

})
app.post('/lessons', (req, res, next) => {
    lessonsCollection.insert(req.body, (e, results) => {
            if (e) return next(e)
            res.send(results.ops)
        }
    )
})

app.listen(port, () => {
    console.log('express ' + port)
})

