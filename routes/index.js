// REQUIRES
const express = require('express');
const router  = express.Router();

// include CLOUDINARY:
const uploader = require('../configs/cloudinary-setup');

// MODELS
const User = require('../models/User');
const Experience = require('../models/Experience');
const Education = require('../models/Education');

/* GET home page */
router.get('/', (req, res, next) => {
  res.send('Home');
});

router.get('/profile/experiences', (req, res) => {
  Experience.find({})
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
  const imageUrl = req.body.imageUrl;
  const owner = req.body.id;
  
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
          .json(aNewExperience)
      })
    })
})

router.get('/profile/experiences/delete/:id', (req, res, next) => {
  const experienceId = req.params.id;
  Experience.findByIdAndDelete(experienceId)
    .then(() => {
      User.updateOne({email: req.user.email}, {$pull: { experiences: { $in: [experienceId]} } }, {multi: true})
        .then(() => {
          res
            .status(200)
            .json({})
        })
        .catch((err) =>{
          console.log(err);
          res
            .status(400)
            .json({message: 'Deleting experience went wrong'})
        })
    })
    .catch((err) => {
      console.log(err);
    })
})

router.get('/profile/educations', (req, res) => {
  Education.find({})
    .then((result) => {
      res.send(result);
    })
    .catch((err)=> {
      console.log(err);
    })
})

router.post('/profile/addEducation', (req, res, next) => {

  const centro = req.body.centro;
  const titulo = req.body.titulo;
  const disciplina = req.body.disciplina;
  const ubicacion = req.body.ubicacion;
  const descripcion = req.body.descripcion;
  const imageUrl = req.body.imageUrl;
  const owner = req.user._id;

  if( !centro || !titulo || !disciplina || !ubicacion || !descripcion || !imageUrl) {
    res
      .status(400)
      .json({message: 'Provide centro, titulo, disciplina, ubicacion, descripción & imagen'});
    return;
  }
  const aNewEducation = new Education({
    centro: centro,
    titulo: titulo,
    disciplina: disciplina,
    ubicacion: ubicacion,
    descripcion: descripcion,
    imageUrl: imageUrl,
    owner: owner
  });
  User.updateOne({email: req.user.email}, {$push: {educations: aNewEducation._id}})
    .then(() => {
      aNewEducation.save((err) => {
        if(err) {
          console.log(err);
          res
            .status(400)
            .json({message: 'Saving user to database went wrong.'}
            );
          return;
        }
        res
          .status(200)
          .json(aNewEducation)
      })
    })
})

router.get('/profile/educations/delete/:id', (req, res, next) => {
  const educationId = req.params.id;
  Education.findByIdAndDelete(educationId)
    .then(() => {
      User.updateOne({email: req.user.email}, {$pull: {educations: { $in: [educationId]} } }, {multi: true})
        .then(() => {
          res
            .status(200)
            .json({})
        })
        .catch((err) => {
          console.log(err);
          res
            .status(400)
            .json({message: 'Deleting education went wrong'})
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
