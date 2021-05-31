const hbs = require('hbs');
const fs = require('fs');
const Curso = require('../models/cursos');
const Estudiante = require('../models/estudiantes');

hbs.registerHelper("listarCursos", (cursos) => {
    if (cursos) {
        let texto = `<div class="table-responsive"><table class="table table-hover"><thead class="table-dark"><th>CURSO</th><th>ID</th><th>VALOR</th><th>MODALIDAD</th><th>MATRICULADOS</th> <th>ESTADO</th><th>ELIMINAR</th></thead><tbody>`
        cursos.forEach(curso => {
            if (curso.estado != "disponible") {
                texto = texto + `<tr><td>${curso.nombre}</td><td>${curso.id}</td><td>${curso.costo}</td><td>${curso.modalidad}</td><td>Ver&nbsp;<button type="submit" name="idMostrar" value="${curso._id}" class="btn btn-sm"><i class="fas fa-eye"></i></button></td><td><button type="submit" value="${curso._id}" name="idCamb" class="btn btn-secondary btn-sm"><i class="fas fa-toggle-off"></i></button>&nbsp;${curso.estado}</td><td><button type="submit" value="${curso._id}" name="idDelete" class="btn btn-outline-dark btn-sm"><i class="fas fa-trash-alt"></i></button></td></tr>`
            } else {
                texto = texto + `<tr><td>${curso.nombre}</td><td>${curso.id}</td><td>${curso.costo}</td><td>${curso.modalidad}</td><td>Ver&nbsp;<button type="submit" name="idMostrar" value="${curso._id}" class="btn btn-sm"><i class="fas fa-eye"></i></button></td><td><button type="submit" value="${curso._id}" name="idCamb" class="btn btn-success btn-sm"><i class="fas fa-toggle-on"></i></button>&nbsp; ${curso.estado}</td><td><button type="submit" value="${curso._id}" name="idDelete" class="btn btn-outline-dark btn-sm"><i class="fas fa-trash-alt"></i></button></td></tr>`
            };
        });
        texto = texto + `</tbody></table></div>`
        return texto;
    }
});

hbs.registerHelper("listOfer", (cursos) => {
    if (cursos) {
        var texto = ""
        var i = 0;
        cursos.forEach(curso => {
            if (curso.estado === "disponible") {
                texto += `
            <div class="accordion-item">
                <h2 class="accordion-header" id="one${i}">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#two${i}" aria-expanded="true" aria-controls="two${i}">
                        <strong>Curso de ${curso.nombre}</strong>&nbsp; valor:$${curso.costo}
                    </button>
                </h2>
                <div id="two${i}" class="accordion-collapse collapse" aria-labelledby="one${i}" data-bs-parent="#accordionExample">
                    <div class="accordion-body">
                        <strong>Modalidad:</strong>&nbsp; ${curso.modalidad}.<br>
                        <strong>Descripción:</strong>&nbsp; ${curso.descripcion}.<br><br>
                        <button type="button" class="btn btn-outline-success" data-toggle="modal" data-target="#myModal${i}">Inscribirme</button>
                    </div>
                </div>
            </div>
      
            <div class="modal fade" id="myModal${i}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Diligencie sus Datos</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">

                            <form action="/inscripcion" method="post">
                                Curso a Matricular
                                <select name="idCurso" id="idCurso">
                                    <option value="${curso._id}">${curso.nombre}</option>
                                </select>
                                <br><br>
                                <br><br>
                                <input type="text" name="nombre" placeholder="Nombre"><br><br>
                                <input type="number" name="cedula"  placeholder="Cedula" required><br><br>
                                <input type="number" name="telefono"  placeholder="Telefono"><br><br>
                                <input type="email" name="correo"  placeholder="Correo"><br><br>
                                <input type="password" name="clave"  placeholder="Contraseña"><br><br>
                                <br><br>
                                <button>Matricular</button>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">salir</button>
                        </div>
                    </div>
                </div>
            </div>`
                i += 1;
            }
        });
    }
    return texto;
});



