module.exports = function(app){
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();
const passport = require('passport');
const LocalStrategy =  require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
/*const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://admin123:admin123@cluster0-jnljp.mongodb.net/test?retryWrites=true&w=majority";
MongoClient.connect(url, { useNewUrlParser: true },(err,client) => {;
  assert.equal(null,err);
  console.log("Connected successfully to server");
  const db = client.db('Testing');
client.close();
});*/
mongoose.connect('mongodb+srv://admin123:admin123@cluster0-jqggg.mongodb.net/Testing?retryWrites=true&w=majority',{useNewUrlParser: true});
var db = mongoose.connection;

db.once('open',function(){
  console.log('DB connected');
})

db.on('error',function(err){
  console.log("err occured when connecting to db " + err);
})

let User = require('../models/users');
let Fault = require('../models/users');
app.use(express.bodyParser());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, {message: 'No user found!'});
        console.log('here1')
      }
      bcrypt.compare(password,user.password, function(err, isMatch){
        console.log('here2')
        if (err){
          throw err
        }
        if (isMatch){
          return done(null,user);
        }else{
          return done(null,false,{message: "Wrong Password"});
        }
    });
  })}
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// routes
app.get('/',(req,res)=>
  {
    res.render('login');
  }
)

app.post('/loginCheck',urlencodedParser,(req,res)=>
 {
   console.log('inside '+ req.body.username);
   passport.authenticate('local',{
     successRedirect:'/logissue'+req.body.username,
     failureRedirect:'/'
   });
})

app.post('/submitNewUser',urlencodedParser,(req,res)=>{
  let newUser = new User({
    username:req.body.un,
    email:req.body.email,
    password:req.body.pw,
    role:'user'
  });

  bcrypt.genSalt(10,function(err,salt){
    bcrypt.hash(newUser.password,salt,function (err,hash){
      if(err){
        console.log(err);
      }
      newUser.password = hash;
      newUser.save(function(err){
        if(err){
          if(err.errmsg.includes('duplicate')){
            res.send('Username taken, please choose another one');
          }else{
            res.send(err.errmsg);
          }
        }else {
          res.send('User created successfully, you can log in now');
        }
      })
    })
  })

}
)


app.get('/logissue',(req,res)=>
  {
    res.render('logissue');
  }
)
}
