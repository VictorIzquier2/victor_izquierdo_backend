const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statisticsSchema = new Schema({
  fecha: {type: Date, required},
  logins: {type: Number, required},
  visits: {type: Number}
})