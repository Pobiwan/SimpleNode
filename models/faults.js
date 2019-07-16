const mongoose = require('mongoose');

let faultSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  location:{
    type: String,
    required: true
  },
  img: {
    data: Buffer,
    contentType: String,
    name:String
  },
  time: {
    type : Date,
    default: Date.now
  },
  raiseby:{
    type: String,
    required: true
  }
})

const Faults = module.exports = mongoose.model('faults',faultSchema);
