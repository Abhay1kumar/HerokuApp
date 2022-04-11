const express = require('express');
const cors = require('cors')
require('./database/config');
const User = require('./database/user')
const Product = require('./database/Product')
const PORT = process.env.PORT || 5000


const Jwt = require('jsonwebtoken');
const { dirname } = require('path');
const jwtKey = "e-comm";
const app = express();

app.use(express.json());
app.use(cors());

const verifyToken =  (req, res, next) => {
    let token =  req.headers['authorization'];
    if (token) { 
        token = token.split(' ')[1];
     Jwt.verify(token, jwtKey, (err, valid) => {
            if (err) {
                res.status(401).send({ result: "Please provide valid token" })
            } else {
             next();
            }
        })
    } else {
        res.status(403).send({ result: "Please add token with header" })
    }
}


app.post('/register', async (req, res) => {
    const data = new User(req.body);
    let result = await data.save();
    result = result.toObject();
    delete result.password

    Jwt.sign({ result }, jwtKey, { expiresIn: "2hr" }, (err, token) => {
        if (err) {
            res.send({ result: 'Some went wrong , Please try agian after sometime' })
        }
        res.send({ result, auth: token })
    })
})


app.post('/login', async (req, res) => {
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select('-password');
        if (user) {
            Jwt.sign({ user }, jwtKey, { expiresIn: "2hr" }, (err, token) => {
                if (err) {
                    res.send({ result: 'Some went wrong , Please try agian after sometime' })
                }
                res.send({ user, auth: token })
            })
        } else {
            res.send({ result: 'No User Found' })
        }
    } else {
        res.send({ result: 'No User Found' })
    }
})

app.post('/addProduct',verifyToken, async (req, res) => {
    let data = new Product(req.body);
    let result = await data.save();
    res.send(result)
})

app.get('/products',verifyToken, async (req, res) => {
    let data = await Product.find();
    if (data.length > 0) {
        res.send(data)
    } else {
        res.send({ result: "No Products Found" })
    }
})

app.delete('/product/:id', async (req, res) => {

    // res.sed(req.params)
    const result = await Product.deleteOne({ _id: req.params.id })
    res.send(result)
})

app.get('/product/:id',verifyToken, async (req, res) => {
    const result = await Product.findOne({ _id: req.params.id })
    if (result) {
        res.send(result)
    } else {
        res.send({ result: "No Product Found" })
    }
})

app.put('/update/:id',verifyToken, async (req, res) => {
    let result = await Product.updateOne({ _id: req.params.id }, { $set: req.body })
    res.send(result)
})


app.get('/search/:key',verifyToken, async (req, res) => {

    let data = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { price: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { category: { $regex: req.params.key } }
        ]
    })
    res.send(data)
})


if(process.env.NODE_ENV ==='production'){
    app.use(express.static('client/build'));

    app.get('*', (res, req)=>{
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));

    });
}

app.listen(PORT, ()=>{
    console.log(`Server is runing at port number ${PORT}`);
})