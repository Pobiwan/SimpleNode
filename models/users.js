const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
  username:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    unique:true
  },
  password:{
    type: String,
    required: true
  },
  role:{  
    type: String,
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

userSchema.index({
  email: 1
}, {
  unique: true
});

const Users = module.exports = mongoose.model('users',userSchema);
