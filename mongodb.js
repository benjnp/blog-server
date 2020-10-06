const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'blog-test'

MongoClient.connect(connectionURL, {
    useNewUrlParser: true
}, (error, client) => {
    if (error) {
        return console.log("Unable to connect to MongoDB")
    }
    const db = client.db(databaseName)

    db.collection('posts').insertOne({
        body: 'This is a test'
    })
})