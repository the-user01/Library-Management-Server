const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config();


const corsOptions = {
    origin: ['http://localhost:5173'],
    credentials: true,
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST')
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    )
    next();
})

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8yiviav.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const bookCollection = client.db('booksDB').collection('books');

        app.get('/all-books', async (req, res) => {
            const result = await bookCollection.find().toArray();
            res.send(result);
        })

        app.get('/all-books/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookCollection.findOne(query);
            res.send(result);
        })

        app.get('/all-books/category/:category', async(req, res)=>{
            const category = req.params.category;
            const cursor = {category: category};
            const options = { upsert: true };
            const result = await bookCollection.find(cursor, options).toArray();

            res.send(result);
        })

        app.post('/all-books', async (req, res) => {
            const newBooks = req.body;
            const result = await bookCollection.insertOne(newBooks);

            res.send(result);
        })

        app.put('/all-books/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };

            const updateBook = req.body;
            const book = {
                $set: {
                    book_name: updateBook.book_name,
                    book_quantity: updateBook.book_quantity,
                    author_name: updateBook.author_name,
                    category: updateBook.category,
                    rating: updateBook.rating,
                    description: updateBook.description,
                    photo: updateBook.photo,
                }
            }

            const result = await bookCollection.updateOne(filter, book, options);
            res.send(result) 
        })



        // Book Category Server

        const categoryCollection = client.db('booksDB').collection('booksCategory');

        app.get('/books-category', async(req, res)=>{
            const bookCategory = req.body;
            const result = await categoryCollection.find(bookCategory).toArray();
            
            res.send(result);
        })


        /* Borrowed books server */

        const borrowedBooksCollection = client.db('booksDB').collection('borrowedBooks');

        app.get('/borrowed-books', async(req, res)=>{
            const borrowedBooks = req.body;
            const result = await borrowedBooksCollection.find(borrowedBooks).toArray();

            res.send(result);
        })

        app.get('/borrowed-books/email/:email', async(req, res)=>{
            const email = req.params.email;
            const cursor = {user_email: email};
            const result = await borrowedBooksCollection.find(cursor).toArray();

            res.send(result);
        })

        app.post('/borrowed-books', async(req, res)=>{
            const newBorrowedBooks = req.body;

            const result = await borrowedBooksCollection.insertOne(newBorrowedBooks);

            res.send(result);
        })


    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send("Library Management Server is running");
})
app.listen(port, () => {
    console.log(`Server running in port: ${port}`);
})