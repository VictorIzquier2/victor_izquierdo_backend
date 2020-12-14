const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statisticsSchema = new Schema({
  fecha: {type: Date, required: true},
  logins: {type: Number, required: true, default: 0},
  visits: {type: Number}
});

const Statistics = mongoose.model('Statistics', statisticsSchema);

module.exports = Statistics;