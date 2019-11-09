const mongoose = require('mongoose');

let oppSchema = mongoose.Schema({
  smeuser: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
  ],
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
  duration: {
    type : Date,
    default: Date.now
  },
  raiseby:{
    type: String,
    required: true
  },
  totalamount:{
    type: Number,
    require: true
  },
  partition:{
    type: Number,
    require:true
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

const Opportunity = module.exports = mongoose.model('opportunity',oppSchema);
