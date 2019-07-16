const express = require('express');
const path = require('path');
const app = express();
var controller = require('./controllers/webappcontroller');
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();
const passport = require('passport');
const LocalStrategy =  require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.static('./public'));
// storage engine
const storage = multer.diskStorage({
  destination:'./public/uploads/',
  filename:function(req,file,cb){
    cb(null, file.originalname); //fieldname = name of the formData field
  }
})
// init upload
const upload = multer({
  storage: storage
}).single('myimage');
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

let User = require('./models/users');
let Fault = require('./models/faults');
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(require('flash')());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, {message: 'No user found!'});
      }
      bcrypt.compare(password,user.password, function(err, isMatch){
        if (err){
          throw err
        }
        if (isMatch){
          console.log('Authed');
          return done(null,user,true);
        }else{
          let isMatch = false
          return done(null,true,isMatch);
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
app.get('*', (req,res,next)=>{
  res.locals.user = req.user || null;
  next();
})

app.get('/',(req,res)=>
  {
    res.redirect('/login');
  }
)

app.get('/login',(req,res)=>
  {
    console.log('user is at login is ' + req.user);
    res.render('login');
  }
)

app.post('/uploadFault',urlencodedParser,(req,res)=>
  {
    console.log('username 1 is ' + JSON.stringify(req.session));
    upload(req,res,(err)=>{
      if (err){
        console.log( err);
      }else{
        console.log('file is ' + JSON.stringify(req.file));
        var newFault = new Fault({
          title: req.body.title,
          time: req.body.timestamp,
          location:req.body.location,
          description:req.body.description,
          raiseby:req.user.username
        })
          //img.data = fs.readFileSync
          newFault.img.data = fs.readFileSync(req.file.path);
          newFault.img.contentType='image/png';
          newFault.img.name=req.file.originalname;
          newFault.save(function(err){
            if(err){
              console.log(err);
            }else{
              console.log('success')
              res.send('Thank you for uploading, logging out now');
            }
          });
      }
    })
  }
)

app.get('/loginCheck', function(req, res, next) {
  passport.authenticate('local', function(err, user, isMatch) {
    if (err) { return next(err); }
    if (!user) {
       return res.send({message:"No such user"});
    }
    if (!isMatch){
      return res.send({message:"Wrong Password"})}
    req.logIn(user, function(err) {
      if (err) {
        return next(err)
      }
      console.log(req.user.username + ' is logged in');
      //req.session.user =  req.user;
      return res.send({message:'User Authenticated',username:req.user.username,userrole:req.user.role});
    });
  })(req, res, next)
});

app.get('/adminPage',function(req,res){
  //var data = [{title:"lala",location:"lala2",description:"lala3",timestamp:"lala4",image:"image"},{title:"lala5",location:"lala6",description:"lala7",timestamp:"lala8",image:"image2"}]
  if (res.locals.user){
    if(res.locals.user.role == 'admin'){
      Fault.find({},function(err,docs){
        if(err){
          console.log(err);
        }else{
          console.log('docs are' + docs);
          //res.contentType(docs[0].img.contentType);
          res.render('adminPage',{data:docs});
        }
      })

    }else{
      res.render('unauth2');
    }
  }else{
    res.render('unauth');
  }
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
    if(res.locals.user){
      res.render('logissue',{username:res.locals.user.username})
    }else{
      res.render('unauth');
    }
  }
)

app.get('/getImage/:_id',(req,res)=>{
  res.render('imagePresenter',{id:req.params._id});
})

app.get('/image/:_id',(req,res)=>{
  var docId = req.params._id;
  Fault.findById(docId, function(err,doc){
    if(err){
      console.log(err);
    }else{
      //res.contentType(doc.img.contentType);
      //res.render('imagePresenter',{image:doc.img.data})
      res.contentType(doc.img.contentType);
      res.send(doc.img.data);
    }
  })
})

app.get('/logout',(req,res)=>{
  req.logout();
  res.redirect('/');
}
)

app.post('/logout',(req,res)=>{
  req.logout();
  res.redirect('/');
}
)

//Monitor db for changes
//const faultcollection = db.collection('faults').watch();
//const changeStreamIterator = faultcollection.watch();



app.listen(port,()=> console.log('Listening on port 3000'));
