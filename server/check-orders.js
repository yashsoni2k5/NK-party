require('dotenv').config();
const mongoose = require('mongoose');

const mongoURL = process.env.mongoURL || 'mongodb://127.0.0.1:27017/party-store';
const OrderModel = require('./models/orders.model.js');
const UserModel = require('./models/user.model.js');

async function checkOrders() {
  try {
    await mongoose.connect(mongoURL);
    const orders = await OrderModel.find({});
    console.log(`Total orders in DB: ${orders.length}`);
    orders.forEach(o => console.log(`Order ID: ${o._id}, User: ${o.user}`));
    
    const users = await UserModel.find({});
    console.log(`\nTotal users in DB: ${users.length}`);
    users.forEach(u => console.log(`User ID: ${u._id}, Mobile: ${u.mobile}, Role: ${u.role}`));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkOrders();
