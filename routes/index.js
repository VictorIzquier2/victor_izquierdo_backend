// REQUIRES
const express = require('express');
const router  = express.Router();

// include CLOUDINARY:
const uploader = require('../configs/cloudinary-setup');

// MODELS
const User = require('../models/User');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Project = require('../models/Project');

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
  //console.log(owner);
  
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
  User.updateOne({email: req.body.email}, {$push: {experiences: aNewExperience._id}})
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
      User.updateOne({email: req.body.email}, {$pull: { experiences: { $in: [experienceId]} } }, {multi: true})
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
  const owner = req.body.id;

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
  User.updateOne({email: req.body.email}, {$push: {educations: aNewEducation._id}})
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
      User.updateOne({email: req.body.email}, {$pull: {educations: { $in: [educationId]} } }, {multi: true})
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

router.get('/gallery/projects', (req, res) => {
  Project.find({})
    .then((result) => {
      res.send(result);
    })
});

router.post('/gallery/addProject', (req, res, next) => {
  
  const titulo = req.body.titulo;
  const tecnologia = req.body.tecnologia;
  const descripcion = req.body.descripcion;
  const imageUrl = req.body.imageUrl;
  const owner = req.body.id;

  if(!titulo ||!tecnologia || !descripcion || !imageUrl){
    res
      .status(400)
      .json({message: 'Provide titulo, tecnologia, descripcion & imagen'}
      );
    return;
  }
  const aNewProject = new Project({
    titulo: titulo,
    tecnologia: tecnologia,
    descripcion: descripcion,
    imageUrl: imageUrl,
    owner: owner
  });
  User.updateOne({email: req.body.email}, {$push: {projects: aNewProject._id}
  })
    .then(() => {
      aNewProject.save((err) => {
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
          .json(aNewProject)
      })
    })
})

router.get('/gallery/projects/delete/:id', (req, res, next) => {
  const projectId = req.params.id;
  Project.findByIdAndDelete(projectId)
    .then(() => {
      User.updateOne({email: req.body.email}, {$pull: {projects: {$in: [projectId]} } }, {multi: true})
        .then(() => {
          res
            .status(200)
            .json({})
        })
        .catch((err) => {
          console.log(err);
          res
            .status(400)
            .json({message: 'Deleting Project went wrong'})
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
