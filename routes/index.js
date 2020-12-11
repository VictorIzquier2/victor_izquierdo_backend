// REQUIRES
const express = require('express');
const router  = express.Router();

// include CLOUDINARY:
const uploader = require('../configs/cloudinary-setup');

// MODELS
const User = require('../models/User');
const Experience = require('../models/Experience')

/* GET home page */
router.get('/', (req, res, next) => {
  res.send('Home');
});

router.get('/profile/experiences', (req, res) => {
  User.findById(req.user._id)
    .then(() => {
      Experience.find({owner: req.user._id})
        .then((result) => {
          res.send(result);
        })
    })
});

router.post('/profile/addExperience', (req, res, next) => {
 
  const cargo = req.body.cargo;
  const empleo = req.body.empleo;
  const empresa = req.body.empresa;
  const ubicacion = req.body.ubicacion;
  const descripcion = req.body.descripcion;
  const imageUrl = req.body.imageUrl;
  const owner = req.user._id;
  
  if(!cargo || !empleo || !empresa || !ubicacion || !descripcion || !imageUrl) {
    res
      .status(400)
      .json({message: 'Provide cargo, empleo, empresa, ubicacion, descripcion & imagen'});
    return;
  }
  const aNewExperience = new Experience({
    cargo: cargo,
    empleo: empleo,
    empresa: empresa,
    ubicacion: ubicacion,
    descripcion: descripcion,
    imageUrl: imageUrl,
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

router.post('/profile/experiences/delete', (req, res, next) => {
  console.log(req.body);
  const experienceId = req.body.id;
  console.log(experienceId);
  Experience.findByIdAndDelete(experienceId)
    .then(() => {
      User.updateOne({email: req.user.email}, {$pull: { experiences: { $in: [experienceId]} } }, {multi: true})
        .then(() => {
          res
            .status(200)
        })
        .catch((err) =>{
          res
            .status(400)
            .json({message: 'Deleting experience went wrong'})
        })
    })
    .catch((err) => {
      console.log(err);
    })
})

router.post('/upload', uploader.single('imageUrl'), (req, res, next) => {
  if(!req.file){
    next(new Error('No file uploaded!'));
    return;
  }
  res.json({secure_url: req.file.path})
})

module.exports = router;
