const mongoose = require('mongoose');

let userAccountSchema = mongoose.Schema({
  user: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'users'
      }
  ],
  amount:{
    type:String,
    required: true
  },
  email:{
      type:String,
      required: true
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

const Useraccount = module.exports = mongoose.model('useraccount',userAccountSchema);