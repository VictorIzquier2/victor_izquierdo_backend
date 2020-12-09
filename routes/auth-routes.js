// REQUIRES
const express    = require('express');
const authRoutes = express.Router();
const passport   = require('passport');
const bcrypt     = require('bcryptjs');

// MODELS
const User = require('../models/User');
const Experience = require('../models/Experience');

authRoutes.post('/signup', (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  
  if(!username || !email || !password) {
    res
      .status(400)
      .json({message: 'Provide username, email and password'});
    return;
  }
  if(password.length < 8) {
    res
      .status(400)
      .json({message: 'Please make your password at least 8 characters long for security purposes.'}
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
        .status(400)
        .json({message: 'Username taken. Choose another one.'}
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
        console.log(err);
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
          res.status(500).json({ message: 'Error authenticating user' });
          return;
      }
      if (!theUser) {
          res.status(401).json(failureDetails);
          return;
      }
      req.login(theUser, err => err ? res.status(500).json({ message: 'Session error' }) : res.status(200).json(theUser))
  })(req, res, next)
});

authRoutes.post('/logout', (req, res, next) => {
  // req.logout() is defined by passport
  req.logout();
  res
    .status(200)
    .json({message: 'Log out success!'});
});

authRoutes.get('/loggedin', (req, res) => req.isAuthenticated() ? res.status(200).json(req.user) : res.status(403).json({ message: 'Unauthorized' }));
module.exports = authRoutes;

authRoutes.post('/profile/newExperience', (req, res, next) => {
  const cargo = req.body.cargo;
  const empleo = req.body.empleo;
  const empresa = req.body.empresa;
  const ubicacion = req.body.ubicacion;
  const descripcion = req.body.ubicacion;
  
  if(!cargo || !empleo || !empresa || !ubicacion || !descripcion) {
    res
      .status(400)
      .json({message: 'Provide cargo, empleo, empresa, ubicacion & descripcion'});
    return;
  }


  const aNewExperience = new Experience({
    cargo: cargo,
    empleo: empleo,
    empresa: empresa,
    ubicacion: ubicacion,
    descripcion: descripcion,
  });

  aNewExperience.save((err) => {
    if(err){
      console.log(err);
      res
        .status(400)
        .json({message: 'Saving user to database went wrong.'}
        );
      return;
    }
    res
      .status(200)
      .json(aNewExperience);
  })

})