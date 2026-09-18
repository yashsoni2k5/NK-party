require('dotenv').config();
const mongoose = require('mongoose');

const mongoURL = process.env.mongoURL || 'mongodb://127.0.0.1:27017/party-store';
const ProductModel = require('./models/product.model.js');

async function checkProducts() {
  try {
    await mongoose.connect(mongoURL);
    const count = await ProductModel.countDocuments();
    const products = await ProductModel.find({});
    console.log(`Total products in DB: ${count}`);
    console.log(JSON.stringify(products, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProducts();
