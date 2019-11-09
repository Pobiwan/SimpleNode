const express = require('express');
const path = require('path');
const app = express();
//var controller = require('./controllers/webappcontroller');
const port = process.env.PORT || 4500;
const http = require('http').createServer(app); 
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const passport = require('passport');
const LocalStrategy =  require('passport-local').Strategy;
const session = require('express-session');
const mongoStore  = require('connect-mongo')(session);
const bcrypt = require('bcryptjs');
const multer = require('multer');

const fs = require('fs');
var io = require('socket.io')(http); 
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.static('./public'));

//storage engine for multer
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
/*
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://admin123:admin123@cluster0-jnljp.mongodb.net/test?retryWrites=true&w=majority";
MongoClient.connect(url, { useNewUrlParser: true },(err,client) => {;
  assert.equal(null,err);
  console.log("Connected successfully to server");
  const db = client.db('Testing');
client.close();
});
*/

mongoose.connect('mongodb+srv://admin123:admin123@cluster0-jqggg.mongodb.net/Fintech?retryWrites=true&w=majority',{useNewUrlParser: true});
var db = mongoose.connection;

db.once('open',function(){
  console.log('DB connected');
})

db.on('error',function(err){
  console.log("err occured when connecting to db " + err);
})


// data models area
let User = require('./models/users');
let Opportunity = require('./models/opportunity');
let Company = require('./models/companyinfo');
let UserAccount = require('./models/useraccount');
// data models area

// middleware area
app.use(session(
  { 
  secret: 'keyboard cat', 
  resave: true, 
  saveUninitialized: true,
  cookie:{
    secure:false,
    maxAge: 1000 * 60 * 60 * 24 * 7  // 1 week
  },
   store : new mongoStore(
  { 
       mongooseConnection: db 
     })
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session({
})); // to use passport persistent session

// configuring localstrategy, find user with username
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ email: username }, function (err, user) { // user object from database
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
  console.log('serializing');
  console.log('serializing user', user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) { // subsequent requests
  console.log('deseializing');
  User.findById(id, function (err, user) {
    console.log('deseializing user', user);
    done(err, user); // store to req.user
  });
});


// routes
app.get('*', (req,res,next)=>{
  console.log('hitted');
  console.log('user is ', req.user);
  console.log('req.user serialP', req.session);
  //res.locals.user = req.user || null;
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

// this is for login passport authentication
app.get('/loginCheck/:username/:password', function(req, res, next) {
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
      // req.user object will be populated
      console.log(req.user.username + ' is logged in');
      //req.session.user =  req.user;
      return res.send({message:'User Authenticated',username:req.user.username,userrole:req.user.role});
    });
  })(req, res, next)
});

// this is for sme sign up
app.get('/smeForm/:username/:email',urlencodedParser,(req,res)=>{
  let params =  req.params;
  res.set('Content-Type','text/html');
  res.render('smeregistration',{username:params.username,email:params.email});
  
});

// this is for registering new user
app.post('/submitNewUser',urlencodedParser, (req,res)=>{
  let newUser = new User({
    username:req.body.un,
    email:req.body.email,
    role:req.body.role,
    password:req.body.pw
  });

  bcrypt.genSalt(10,function(err,salt){
    bcrypt.hash(newUser.password,salt,function (err,hash){
      if(err){
        console.log(err);
      }
      newUser.password = hash;
        newUser.save(function(error,record){
          if(error){
            console.log(error);
            // can send back data and status
            res.send(400,error);
          }else{
            console.log(record);
            res.send(200,record);
            //res.status(200).send(`User ${record.username} created successfully, you can log in now`);
          }
    })
  })
})
});

// this is for sme page
app.get('/smePage',urlencodedParser,(req,res)=>{
  console.log('smePage')
  // getting data from database
  res.render('smesummarypage');
});

app.get('/userPage',isAuthenticated,urlencodedParser, async (req,res)=>{
  console.log('user page');
  let useraccountinfo = await UserAccount.findOne({
    email: req.user.email}).
    populate('user');
      console.log('Account info',useraccountinfo);
      // get old opportunities
    let oldOpportunities = await Opportunity.find({

    })
      // get new opportunities
    let newOpportunities = await Opportunity.find({

    })
    console.log(opportunities)
  });
   

  
// this is for logging out
app.post('/logout',(req,res)=>{
  res.redirect('/');
}
)

app.get('/logout',(req,res)=>{
  res.redirect('/');
}
)

app.post('/uploadForm',urlencodedParser,(req,res)=>
  {
    upload(req,res,(err)=>{
      if (err){
        console.log( err);
      }else{
        console.log(req.body.companyname)
        var newCompany = new Company({
          email: req.body.email,
          companyname: req.body.companyname,
          location:req.body.location,
          location:req.body.location,
          postal:req.body.postal,
          foundingdate:req.body.foundingdate,
          capital:req.body.capital,
          userposition:req.body.userposition
        })
          //img.data = fs.readFileSync
          newCompany.report.data = fs.readFileSync(req.file.path);
          newCompany.report.contentType='image/png';
          newCompany.report.name=req.file.originalname;
          newCompany.save(function(err){
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
        /*
        if(err){
          if(err.errmsg.includes('duplicate')){
              res.send('Username taken, please choose another one');
          // }else{
            console.log(err);
            res.send('error occured', err);
          // }
        }else {
          res.status(200).send(`User ${userName} created successfully, you can log in now`);
        }
      })
    })
  })
}
)

app.get('/adminPage',function(req,res){
  //var data = [{title:"lala",location:"lala2",description:"lala3",timestamp:"lala4",image:"image"},{title:"lala5",location:"lala6",description:"lala7",timestamp:"lala8",image:"image2"}]
  if (res.locals.user){
    if(res.locals.user.role == 'admin'){
      oo.find({},function(err,docs){
        if(err){
          console.log(err);
        }else{
          console.log('docs are' + docs);
          //res.contentType(docs[0].img.contentType);
          //render the adminPage, with data
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
*/

http.listen(port,()=> console.log('Listening on port 4500'));

// helper function 
function isAuthenticated(req,res,next){
  console.log('inside auth');
  if(req.user){
    console.log('user authed');
    next();
  }else{
    console.log('user not authed');
    res.redirect('/');
  }
}

function roleGuard(role){
 console.log('inside role');
 return (req,res,next)=>{
  if(req.user.role != role){
    res.end('You are not authorized to view this page!');
  }else{
    next();
  }
}
}