const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true, minlength: 8},
  imageUrl: {type: String},
  experiences: [{type: Schema.ObjectId, ref: 'Experience'}]
});

const User = mongoose.model('User', userSchema);

module.exports = User;