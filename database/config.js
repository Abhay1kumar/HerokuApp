const mongoose = require('mongoose');
// const DBUlr = 'mongodb://localhost:27017/E-commerce';
const URL = 'mongodb+srv://abhaykumar:abhay1kumar@cluster0.pgmdu.mongodb.net/ecommerce?retryWrites=true&w=majority';


mongoose.connect(process.env.MONGODB_URI || URL);