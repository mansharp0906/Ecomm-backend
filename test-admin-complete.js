const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ecomm', {useNewUrlParser:true,useUnifiedTopology:true});
const User = require('./src/models/User');
User.deleteOne({email: 'admin@ecomm.com'}).then(console.log);