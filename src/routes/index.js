const express = require("express");
const app = express();
// const parseurl = require('parseurl');
const path = require('path');
const hbs = require('hbs');
const Estudiante = require('./../models/estudiantes');
const Curso = require('./../models/cursos');
const bcrypt= require('bcrypt');
const saltRounds = 10;

const dirPartials = path.join(__dirname, '../../template/partials');
const dirViews = path.join(__dirname, '../../template/views');

require('./../helpers/helpers')

//HBS
app.set('view engine', 'hbs')
app.set('views', dirViews)
hbs.registerPartials(dirPartials)

//PAGINAS
app.get('/inicio', (req, res) => {
    res.redirect('/')
});

app.get('/', (req, res) => {
    Curso.find({}, (err, cursos) => {
        if (err) {
            return console.log(err)
        }
        res.render('index', {
            cuenta: "Interesado",
            todosLosCursos: cursos
        })
    })
});

app.post('/', (req, res) => {
    Estudiante.findOne({nombre:req.body.usuario}, (err, estudiante) => {
        texto = "";
        if (err) {
            return console.log(err)
        } else if (estudiante){
            if(bcrypt.compareSync(req.body.contrasena, estudiante.contrasena)){
                req.session.usuario = estudiante._id;
                return res.redirect('estudiante')
            }else {
                texto = `Contraseña incorrecta`
                Curso.find({}, (err, cursos) => {
                    if (err) {
                        return console.log(err)
                    }
                    res.render('index', {
                        cuenta: "Interesado",
                        todosLosCursos: cursos,
                        mostrar:texto                    })
                })
            }
        }else{
            texto = `No se ha encontrado ninguna coincidencia con ese usuario`
            Curso.find({}, (err, cursos) => {
                if (err) {
                    return console.log(err)
                }
                res.render('index', {
                    cuenta: "Interesado",
                    todosLosCursos: cursos,
                    mostrar:texto
                })
            })
        }   
    })
});

app.get('/estudiante', (req, res) => {
    texto="";
    Estudiante.findById({_id:req.session.usuario}).populate('cursos').exec(function(err, estudiante){
        if(err) return handleError(err);
        texto = `<h2 class="text-center">Bienvenido ${estudiante.nombre}</h2>`
        res.render('estudiante', {
            cuenta: "Estudiantes",
            mostrar:texto,
            cursos:estudiante.cursos
        })
    })
});

//Listar todos los cursos
app.get('/cordinador', (req, res) => {
    Curso.find({}, (err, cursos) => {
        if (err) {
            return console.log(err)
        }
        res.render('cordinador', {
            cuenta: "Admin",
            todosLosCursos: cursos
        })
    })
});

//Crear un curso
app.post('/cordinador', (req, res) => {
    id = req.body.id;
    if (id) {
        let curso = new Curso({
            nombre: req.body.nombre,
            id: req.body.id,
            descripcion: req.body.descripcion,
            modalidad: req.body.modalidad,
            costo: req.body.valor,
            estado: "disponible"
        })

        curso.save((err, resultado) => {
            if (err) {
                res.render('cordinador', {
                    mostrar: err
                })
            }
            Curso.find({}, (err, cursos) => {
                if (err) {
                    return console.log(err)
                }
                res.render('cordinador', {
                    cuenta: "Admin",
                    todosLosCursos: cursos,
                    mostrar: `<div class="alert alert-info alert-dismissible fade show" role="alert">
                                El curso se ha creado
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>`
                })
            })
        })
    }
});

app.post('/inscripcion', (req, res) => {
    Estudiante.findOne({cedula:req.body.cedula},(err, matriculado)=>{
        if(err){
            return console.log(err)
        }
        if(matriculado){
            Estudiante.findOneAndUpdate({_id:matriculado._id},{"$push": {cursos : req.body.idCurso}},{new:true},(err, modificado)=>{
                if(err){
                    return console.log(err)
                }
                Curso.find({}, (err, cursos) => {
                    if (err) {
                        return console.log(err)
                    }
                    curso = cursos.find(elemento=>elemento._id==req.body.idCurso)

                    res.render('index', {
                        cuenta: "Interesado",
                        todosLosCursos: cursos,
                        mostrar: `<div class="alert alert-info alert-dismissible fade show" role="alert">
                                     Te has matriculado al curso ${curso.nombre}
                                     <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                 </div>`
                    })
                })
            })
        }else{
            const salt = bcrypt.genSaltSync(saltRounds);
            let estudiante = new Estudiante({
                nombre: req.body.nombre,
                cedula: req.body.cedula,
                correo: req.body.correo,
                contrasena : bcrypt.hashSync(req.body.clave, salt),
                cursos:[]
            })
            estudiante.cursos.push(req.body.idCurso);

            estudiante.save((err, resultado) => {
                if (err) {
                    return console.log(err)
                }
                Curso.find({}, (err, cursos) => {
                    if (err) {
                       return console.log(err)
                    }
                    curso = cursos.find(elemento=>elemento._id==req.body.idCurso)
                    res.render('index', {
                        cuenta: "Interesado",
                        todosLosCursos: cursos,
                        mostrar: `<div class="alert alert-info alert-dismissible fade show" role="alert">
                                     Te has matriculado al curso ${curso.nombre}
                                     <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                 </div>`
                    })
                })
            })
        }
    })
});

//Cambiar estado a un curso
app.post('/interruptor',(req,res)=>{
    idCamb=req.body.idCamb;
    if (idCamb) {
        Curso.findOne({_id:idCamb},(err, curso)=>{ 
            if(curso.estado=="disponible"){
                Curso.findOneAndUpdate({_id:idCamb},{estado:"no disponible"},(err, actualizado)=>{
                    if (err) return (err);
                    res.render('cordinador',{
                        cuenta:"Admin",
                        idCamb:req.body.idCamb,
                        idDelete:req.body.idDelete,
                        idMostrar:req.body.idMostrar,
                        idEst:req.body.idEst,
                        DeleteEst:req.body.DeleteEst,
                        idCurso:req.body.idCurso,
                        respuesta:`<div class="alert alert-success alert-dismissible fade show" role="alert">
                        El curso ${curso.nombre} ya no está disponible.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`
                    });
                })
            }else{
                Curso.findOneAndUpdate({_id:idCamb},{estado:"disponible"},(err, actualizado)=>{
                    if (err) return (err);
                    res.render('cordinador',{
                        cuenta:"Admin",
                        idCamb:req.body.idCamb,
                        idDelete:req.body.idDelete,
                        idMostrar:req.body.idMostrar,
                        idEst:req.body.idEst,
                        DeleteEst:req.body.DeleteEst,
                        idCurso:req.body.idCurso,
                        respuesta : `<div class="alert alert-success alert-dismissible fade show" role="alert">
                        El curso ${curso.nombre} ahora está disponible.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`
                    });  
                })
            }
        })
    }
    idDelete=req.body.idDelete
    if(idDelete){
        Curso.findOneAndDelete({_id:idDelete},(err, curso)=>{
            if(err) return (err);
            res.render('cordinador',{
                cuenta:"Admin",
                idCamb:req.body.idCamb,
                idEst:req.body.idEst,
                DeleteEst:req.body.DeleteEst,
                idCurso:req.body.idCurso,
                respuesta:`<div class="alert alert-success alert-dismissible fade show" role="alert">
                El curso ${curso.nombre} ha sido eliminado.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
            });
        })  
    }
    idMostrar=req.body.idMostrar
    if(idMostrar){
        Curso.findOne({_id:idMostrar},(err, curso)=>{
            Estudiante.find({cursos:idMostrar},(err, alumnos)=>{
                var texto=` <h3 class='text-center'>Curso de ${curso.nombre}</h3><br><div class="table-responsive"><table class="table table-hover"><thead class="table-warnig"><th>NOMBRE</th><th>CEDULA</th><th>CORREO</th><th>ELIMINAR</th></thead><tbody>`
                alumnos.forEach(elemento=>{
                    texto = texto + `<tr><td>${elemento.nombre}</td><td>${elemento.cedula}</td><td>${elemento.correo}</td><td><button type="submit" value="${elemento._id}" name="DeleteEst" class="btn btn-outline-dark btn-sm"><i class="fas fa-trash-alt"></i></button></td></tr>`
                })
                texto = texto + `</tbody></table></div><input name="idCurso" value="${curso._id}" class="d-none"></input>`
                res.render('cordinador',{
                    cuenta:"Admin",
                    idCamb:req.body.idCamb,
                    idEst:req.body.idEst,
                    DeleteEst:req.body.DeleteEst,
                    idCurso:req.body.idCurso,
                    respuesta:texto
                });
            })
        })
    }

});

app.post('/eliminarEstudiante', (req, res) => {
    if(req.body.DeleteEst){
        Estudiante.findOneAndUpdate({_id:req.body.DeleteEst},{"$pull": {cursos:req.body.idCurso}},{new:true},(err, resultado)=>{
            if (err) return (err)
            console.log(resultado)
            res.render('cordinador',{
                            cuenta:"Admin",
                            respuesta:`<div class="alert alert-success alert-dismissible fade show" role="alert">
                            El estudiante ${resultado.nombre} ha sido eliminado.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>`
                        });
        });
    }	
})

app.post('/salir', (req, res) => {
	req.session.destroy((err) => {
  		if (err) return console.log(err) 	
	})	
	res.redirect('/')	
})

//ERROR 404
app.get('*', function (req, res) {
    res.render('error');
})

module.exports = app
