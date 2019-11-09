const mongoose = require('mongoose');

let companySchema = mongoose.Schema({
  email:{
    type:String,
    required: true
  },
  companyname:{
    type: String,
    required: true
  },
  location:{
    type: String,
    required: true
  },
  postal: {
    type : Date,
    default: Date.now
  },
  foundingdate:{
    type: String,
    required: true
  },
  capital:{
    type: Number,
    require: true
  },
  userposition:{
      type: String,
      require:true
  },
  report:{
      data: Buffer, 
      contentType: String
  },
  createdAt: { 
    type : Date, 
    default: Date.now 
  },
  updatedAt: {
    type : Date,
    default: Date.now
  }
})

const Company = module.exports = mongoose.model('companyinfos',companySchema);