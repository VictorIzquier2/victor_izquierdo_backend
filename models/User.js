const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true, minlength: 8},
  imageUrl: {type: String},
  experiences: [{type: Schema.ObjectId, ref: 'Experience'}],
  educations: [{type: Schema.ObjectId, ref: 'Education'}],
  projects: [{type: Schema.ObjectId, ref: 'Project'}],
  role: {type: String, enum: ['GUEST', 'ADMIN'], default: 'GUEST'},
  slackID: {type: String},
  googleID: {type: String}
});

const User = mongoose.model('User', userSchema);

module.exports = User;