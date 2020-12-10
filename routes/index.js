// REQUIRES
const express = require('express');
const router  = express.Router();

// MODELS
const User = require('../models/User');
const Experience = require('../models/Experience')

/* GET home page */
router.get('/', (req, res, next) => {
  res.send('Home');
});

router.get('/profile/experiences', (req, res) => {
  Experience.find()
    .then((result) => {
      res.send(result);
    })
});

router.post('/profile/addExperience', (req, res, next) => {
 
  const cargo = req.body.cargo;
  const empleo = req.body.empleo;
  const empresa = req.body.empresa;
  const ubicacion = req.body.ubicacion;
  const descripcion = req.body.descripcion;
  const owner = req.user._id;
  
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
    owner: owner
  });
  User.updateOne({email: req.user.email}, {$push: {experiences: aNewExperience._id}})
    .then(() => {
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
})
module.exports = router;
