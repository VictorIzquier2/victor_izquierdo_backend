// REQUIRES
const express    = require('express');
const authRoutes = express.Router();
const passport   = require('passport');
const bcrypt     = require('bcryptjs');

// MODELS
const User = require('../models/User');
const Statistics = require('../models/Statistics');

authRoutes.get('/auth/slack', passport.authenticate('slack'));

authRoutes.get('/auth/slack/callback', 
  passport.authenticate('slack', {
    successRedirect: '/private-page',
    failureRedirect: '/signup'
  }
));

authRoutes.post('/signup', (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  
  if(!username || !email || !password) {
    res
      .status(200)
      .json({message: 'Introduce un correo, usuario y contraseña'});
    return;
  }
  if(password.length < 8) {
    res
      .status(200)
      .json({message: 'Por favor, asegúrate de que la contraseña tenga al menos 8 caracteres.'}
      );
    return;
  }

  User.findOne({ username }, (err, foundUser) => {
    if(err){
      res
        .status(500)
        .json({message: 'Username check went bad.'}
        );
      return;
    }
    if(foundUser){
      res
        .status(200)
        .json({message: 'Este usuario ya está cogido. Elige otro.'}
        );
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    const aNewUser = new User({
      username: username,
      email: email,
      password: hashPass
    });

    aNewUser.save((err) => {
      if(err){
        res
          .status(400)
          .json({message: 'Saving user to database went wrong.'}
          );
        return;
      }
      // Automatically log in user after sign up
      // .login() here is actually predefined passport method
      req.login(aNewUser, (err) => {
        if(err){
          res
            .status(500)
            .json({message: 'Login after signup went bad.'}
            );
          return;
        }
        // Send the user's information to the frontend
        // we can use also: res.status(200).json(req.user);
        res
          .status(200)
          .json(aNewUser);
      });
    });
  });
});

authRoutes.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, theUser, failureDetails) => {
      if (err) {
          res
            .status(500)
            .json({ message: 'Error authenticating user' });
          return;
      }
      if (!theUser) {
          res
            .status(200)
            .json({message: 'El usuario no existe o la contraseña es incorrecta.'})
            //.json(failureDetails);
          return;
      }
      req.login(theUser, (err) => {
        if(err){
          res
            .status(500)
            .json({ message: 'Session save went bad' })
            return;
            
        }else{
          console.log(3);
          res
            .status(200)
            .json(theUser)
        } 
      });
  })(req, res, next)
});

authRoutes.post('/logout', (req, res, next) => {
  const loggins = req.body.loggins;

  const aNewStatistic = new Statistics({
    fecha: Date.now(),
    loggins: loggins
  })
  if(loggins > 0){
    aNewStatistic.save((err) => {
      if(err){
        res
        .status(400)
        .json({message: 'saving statistic to database went wrong.'}
        );
        return;
      }
    })
  }
  // req.logout() is defined by passport
  req.logout();
  res
    .status(200)
    .json({message: `Log out succes ${loggins}!`});
});

authRoutes.get('/loggedin', (req, res, next) => {
  // req.isAuthenticated() is defined by passport
  if(req.isAuthenticated()){
    res
      .status(200)
      .json(req.user);
      return;
  }
  res
    .status(403)
    .json({message: 'Unauthorized'});
});

checkRoles = (role) => {
  return function(req, res, next) {
    if(req.isAuthenticated() && req.user.role === role) {
      return next()
    }else{
      res
        .json({})
    }
  }
}

const checkAdmin = checkRoles('ADMIN');

authRoutes.get('/isadmin', checkAdmin, (req, res) => {
  res
    .status(200)
    .json(req.user)
})

module.exports = authRoutes;