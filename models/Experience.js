const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const experienceSchema = new Schema({
  cargo: {type: String, required: true},
  empleo: {type: String, required: true},
  empresa: {type: String, required: true},
  ubicacion: {type: String, required: true},
  descripcion: {type: String, required: true},
  owner: {type: Schema.ObjectId, ref: 'User'}
});

const Experience = mongoose.model('Experience', experienceSchema);

module.exports = Experience;