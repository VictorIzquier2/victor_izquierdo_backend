const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  titulo: {type: String, required: true},
  tecnologia: {type: String, required: true},
  descripcion: {type: String, required: true},
  imageUrl: {type: String},
  owner: {type: Schema.ObjectId, ref: 'User'}
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;