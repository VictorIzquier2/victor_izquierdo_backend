const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const educationSchema = new Schema({
  centro: {type: String, required: true},
  titulo: {type: String, required: true},
  disciplina: {type: String, required: true},
  ubicacion: {type: String, required: true},
  descripcion: {type: String, required: true},
  imageUrl: {type: String},
  owner: {type: Schema.ObjectId, ref: 'User'}
});

const Education = mongoose.model('Education', educationSchema);

module.exports = Education;