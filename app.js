// REQUIRES

require('dotenv').config();

const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const express       = require('express');
const favicon       = require('serve-favicon');
const hbs           = require('hbs');
const mongoose      = require('mongoose');
const logger        = require('morgan');
const path          = require('path');
const session       = require('express-session');
const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt        = require('bcryptjs');
const cors          = require('cors');
const flash         = require('connect-flash');
const cookieSession = require('cookie-session');
const SlackStrategy = require('passport-slack').Strategy;

// MODELS
const User = require('./models/User');

// mongoose CONFIG
mongoose
  .connect('mongodb+srv://VictorIzquier2:1234@cluster0.5j2lv.mongodb.net/victor-izquierdo?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));

/*
// CORS middleware
app.use((req,res,next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');

  next();
});
*/

app.use(cors({
  credentials: true,
  origin:["http://localhost:3001", "https://victor-izquierdo-site.netlify.app", "https://ironhackremotewebft.slack.com/oauth?client_id=1400992106598.1608255544897&scope=identity.basic+identity.email+identity.avatar+identity.team&user_scope=&redirect_uri=https%3A%2F%2Fvictor-izquierdo-site.herokuapp.com%2Fauth%2Fslack%2Fcallback&state=&granular_bot_scope=0&single_channel=0&install_redirect=&tracked=1&response_type=code&team=y"]
}));

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
})

// Middleware de cookieSession
app.set('trust proxy', 1)
app.use(cookieSession({
    name:'session',
    keys: ['key1', 'key2'],
    sameSite: 'none',
    secure: true
}))

// Middleware de Session
app.use(session({
  secret: 'ourPassword', 
  resave: true, 
  saveUninitialized: true,
  cookie: {
    sameSite: 'none',
    secure: true
  }
}));

// Middleware para serializar al usuario
passport.serializeUser((user, callback) => {
  callback(null, user._id);
});

// Middleware para des-serializar al usuario
passport.deserializeUser((id, callback) => {
  User.findById(id)
  .then((user) => {
    callback(null, user);
  })
  .catch((err) => {
    callback(err);
  })
})

// Middleware del Strategy
passport.use(
  new LocalStrategy({ passReqToCallback: true}, (req, username, password, next) => {
    User.findOne({ username })
    .then((user) => {
      if(!user) {
        return next(null, false, {message: 'Incorrect username'});
      }
      if(!bcrypt.compareSync(password, user.password)){
        return next(null, false, {message: 'Incorrect password'});
      }
      return next(null, user);
    })
    .catch((err) => next(err));
  })
);

// Middleware de Slack
passport.use(
  new SlackStrategy(
    {
      clientID: '1400992106598.1608255544897',
      clientSecret: '900723c9daa9e3a20798f646e5514962',
      callbackURL: '/auth/slack/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      console.log('Slack account details:', profile);
      User.findOne({slackID: profile.id})
        then(user => {
          if(user) {
            done(null, user);
            return;
          }
          User.create({slackID: profile.id})
            .then(newUser => {
              done(null, newUser);
            })
            .catch(err => done(err));
        })
        .catch(err => done(err));
    }
  )
);

// Middleware de passport
app.use(passport.initialize());
app.use(passport.session());

// HBS CONFIG
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(flash());

// default value for title local
app.locals.title = 'Express - Generated by Victor Izquierdo';

// ROUTES
const index = require('./routes/index');
app.use('/', index);

const authRoutes = require('./routes/auth-routes');
app.use('/', authRoutes);

module.exports = app;
