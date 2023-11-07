module.exports = {
    "Noticias.selectAll":{
        q: "SELECT id, fecha, titulo, imagenes, bajada, url FROM noticia WHERE eliminado = 0 ORDER BY id DESC LIMIT 100",
        p: []
    },
    "Noticias.selectLast100":{
        q: "SELECT * FROM noticia WHERE eliminado = 0 ORDER BY id DESC LIMIT 100",
        p: []
    },
    "Noticias.getById":{
        q: "SELECT * FROM noticia WHERE id=@id",
        p: ["id"]
    },
    "Noticias.getByTitulo":{
        q: "SELECT * FROM noticia WHERE titulo LIKE '%@titulo%' LIMIT 20",
        p: ["titulo"]
    },
    "Noticias.insert":{
        q: "INSERT INTO noticia SET titulo='@titulo', bajada='@bajada', fecha='@fecha', detalle='@detalle', imagenes='@imagenes', pie_de_foto='@pie_de_foto', video='@video', categoria='@categoria', tags='@tags', autor='@autor', fuente='@fuente', activa='@activa', marquesina='@marquesina', principal='@principal', eliminado=0",
        p: ["titulo", "bajada", "fecha", "detalle", "imagenes", "pie_de_foto", "video", "categoria", "tags", "autor", "fuente", "activa", "marquesina", "principal"]
    },
    "Noticias.update":{
        q: "UPDATE noticia SET titulo='@titulo', bajada='@bajada', fecha='@fecha', detalle='@detalle', imagenes='@imagenes', pie_de_foto='@pie_de_foto', video='@video', categoria='@categoria', tags='@tags', autor='@autor', fuente='@fuente', activa='@activa', marquesina='@marquesina', principal='@principal' WHERE id=@id LIMIT 1",
        p: ["titulo", "bajada", "fecha", "detalle", "imagenes", "pie_de_foto", "video", "categoria", "tags", "autor", "fuente", "activa", "marquesina", "principal", "id"]
    },
    "Noticias.delete":{
        q: "UPDATE noticia SET eliminado = 1 WHERE id=@id LIMIT 1",
        p: ["id"]
    },
    "Pois.selectAll":{
        q: "SELECT id, nombre, propietario, ultima_actualizacion, imagenes, url, detalle, datos_de_contacto FROM poi WHERE eliminado = 0",
        p: []
    },
    "Pois.getById":{
        q: "SELECT * FROM poi WHERE id=@id LIMIT 1",
        p: ["id"]
    },
    "Pois.insert":{
        q: "INSERT INTO poi SET ultima_actualizacion=NOW(), nombre='@nombre', propietario='@propietario', detalle='@detalle', direccion='@direccion', local_al_publico='@local_al_publico', geo='@geo', categoria_1='@categoria_1', categoria_2='@categoria_2', categoria_3='@categoria_3', imagenes='@imagenes', datos_de_contacto='@datos_de_contacto', dias_horarios='@dias_horarios', delivery='@delivery', take_away='@take_away', auxiliar='@auxiliar', activo='@activo', eliminado=0",
        p: ["nombre", "propietario", "detalle", "direccion", "local_al_publico", "geo", "categoria_1", "categoria_2", "categoria_3", "imagenes", "datos_de_contacto", "dias_horarios", "delivery", "take_away", "auxiliar", "activo"]
    },
    "Pois.update":{
        q: "UPDATE poi SET ultima_actualizacion=NOW(), nombre='@nombre', propietario='@propietario', detalle='@detalle', direccion='@direccion', local_al_publico='@local_al_publico', geo='@geo', categoria_1='@categoria_1', categoria_2='@categoria_2', categoria_3='@categoria_3', imagenes='@imagenes', datos_de_contacto='@datos_de_contacto', dias_horarios='@dias_horarios', delivery='@delivery', take_away='@take_away', auxiliar='@auxiliar', activo='@activo' WHERE id = @id LIMIT 1",
        p: ["nombre", "propietario", "detalle", "direccion", "local_al_publico", "geo", "categoria_1", "categoria_2", "categoria_3", "imagenes", "datos_de_contacto", "dias_horarios", "delivery", "take_away", "auxiliar", "activo", "id"]
    },
    "Pois.delete":{
        q: "UPDATE poi SET eliminado = 1 WHERE id=@id LIMIT 1",
        p: ["id"]
    },
    "Eventos.selectAll":{
        q: "SELECT id, nombre, fecha_inicio, fecha_fin, url, imagenes, detalle FROM evento WHERE eliminado = 0",
        p: []
    },
    "Eventos.selectLast100":{
        q: "SELECT id, nombre, detalle, fecha_inicio, fecha_fin, imagenes, url FROM evento WHERE eliminado = 0 ORDER BY id DESC LIMIT 100",
        p: []
    },
    "Eventos.getById":{
        q: "SELECT * FROM evento WHERE id=@id",
        p: ["id"]
    },
    "Eventos.getByNombre":{
        q: "SELECT * FROM evento WHERE nombre LIKE '%@nombre%' LIMIT 20",
        p: ["nombre"]
    },
    "Eventos.insert":{
        q: "INSERT INTO evento SET nombre='@nombre', poi='@poi', precio='@precio', fechas='@fechas', fecha_inicio='@_fecha_inicio', fecha_fin='@_fecha_fin', detalle='@detalle', imagenes='@imagenes', categoria='@categoria', activo='@activo', marquesina='@marquesina', principal='@principal', suspendido='@suspendido', eliminado=0",
        p: ["nombre", "poi", "precio", "fechas", "_fecha_inicio", "_fecha_fin", "detalle", "imagenes", "categoria", "activo", "marquesina", "principal", "suspendido"]
    },
    "Eventos.update":{
        q: "UPDATE evento SET nombre='@nombre', poi='@poi', precio='@precio', fechas='@fechas', fecha_inicio='@_fecha_inicio', fecha_fin='@_fecha_fin', detalle='@detalle', imagenes='@imagenes', categoria='@categoria', activo='@activo', marquesina='@marquesina', principal='@principal', suspendido='@suspendido' WHERE id=@id LIMIT 1",
        p: ["nombre", "poi", "precio", "fechas", "_fecha_inicio", "_fecha_fin", "detalle", "imagenes", "categoria", "activo", "marquesina", "principal", "suspendido", "id"]
    },
    "Eventos.delete":{
        q: "UPDATE evento SET eliminado = 1 WHERE id=@id LIMIT 1",
        p: ["id"]
    },
    "FarmaciasDeTurno.selectLast20":{
        q: "SELECT * FROM farmacia_de_turno WHERE eliminado = 0 ORDER BY id DESC LIMIT 20",
        p: []
    },
    "FarmaciasDeTurno.insert":{
        q: "INSERT INTO farmacia_de_turno SET mes='@mes', anio='@anio', fechas='@fechas', eliminado=0",
        p: ["mes", "anio", "fechas"]
    },
    "FarmaciasDeTurno.update":{
        q: "UPDATE farmacia_de_turno SET mes='@mes', anio='@anio', fechas='@fechas' WHERE id = @id LIMIT 1",
        p: ["mes", "anio", "fechas", "id"]
    },
    "FarmaciasDeTurno.delete":{
        q: "UPDATE farmacia_de_turno SET eliminado = 1 WHERE id=@id LIMIT 1",
        p: ["id"]
    },
    "HorariosDeTransportes.selectAll":{
        q: "SELECT * FROM horario_de_transporte WHERE eliminado = 0",
        p: []
    },
    "HorariosDeTransportes.insert":{
        q: "INSERT INTO horario_de_transporte SET poi_transporte=@poi_transporte, origen='@origen', poi_origen=@poi_origen, destino='@destino', poi_destino=@poi_destino, dias_horarios='@dias_horarios', imagen='@imagen', activo=@activo, eliminado=0",
        p: ["poi_transporte", "origen", "poi_origen", "destino", "poi_destino", "dias_horarios", "imagen", "activo"]
    },
    "HorariosDeTransportes.update":{
        q: "UPDATE horario_de_transporte SET poi_transporte=@poi_transporte, origen='@origen', poi_origen=@poi_origen, destino='@destino', poi_destino=@poi_destino, dias_horarios='@dias_horarios', imagen='@imagen', activo=@activo WHERE id=@id LIMIT 1",
        p: ["poi_transporte", "origen", "poi_origen", "destino", "poi_destino", "dias_horarios", "imagen", "activo", "id"]
    },
    "HorariosDeTransportes.delete":{
        q: "UPDATE horario_de_transporte SET eliminado = 1 WHERE id=@id LIMIT 1",
        p: ["id"]
    },
    "TelefonosUtiles.selectAll":{
        q: "SELECT * FROM telefono_util WHERE eliminado = 0",
        p: []
    },
    "TelefonosUtiles.insert":{
        q: "INSERT INTO telefono_util SET poi=@poi, nombre='@nombre', datos_de_contacto='@datos_de_contacto', nota='@nota', activo=@activo, eliminado=0",
        p: ["poi", "nombre", "datos_de_contacto", "nota", "activo"]
    },
    "TelefonosUtiles.update":{
        q: "UPDATE telefono_util SET poi=@poi, nombre='@nombre', datos_de_contacto='@datos_de_contacto', nota='@nota', activo=@activo WHERE id=@id LIMIT 1",
        p: ["poi", "nombre", "datos_de_contacto", "nota", "activo", "id"]
    },
    "TelefonosUtiles.delete":{
        q: "UPDATE telefono_util SET eliminado = 1 WHERE id=@id LIMIT 1",
        p: ["id"]
    },

    "Publicidades.selectAll":{
        q: "SELECT * FROM publicidad WHERE eliminado = 0 AND ( ( MONTH(creada) = MONTH(NOW()) AND YEAR(creada) = YEAR(NOW()) ) OR NOW() <= DATE_SUB( fecha_fin, INTERVAL 15 DAY) )",
        p: []
    },
    "Publicidades.insert":{
        q: "INSERT INTO publicidad SET creada=NOW(), nombre='@nombre', pid='@pid', id_ref=@id_ref, imagen='@imagen', texto_redes='@texto_redes', enlace='@enlace', fecha_inicio='@fecha_inicio', dias='@dias', fecha_fin='@fecha_fin', valor='@valor', eliminado=0, compartida=0, prioridad=@prioridad",
        p: ["nombre", "pid", "id_ref", "imagen", "texto_redes", "enlace", "fecha_inicio", "dias", "fecha_fin", "valor", "prioridad"]
    },
    "Publicidades.modify":{
        q: "UPDATE publicidad SET nombre='@nombre', pid='@pid', id_ref=@id_ref, imagen='@imagen', texto_redes='@texto_redes', enlace='@enlace', fecha_inicio='@fecha_inicio', dias='@dias', fecha_fin='@fecha_fin', valor='@valor', eliminado=0, compartida=0, prioridad=@prioridad WHERE id='@id' LIMIT 1",
        p: ["nombre", "pid", "id_ref", "imagen", "texto_redes", "enlace", "fecha_inicio", "dias", "fecha_fin", "valor", "prioridad", "id"]
    },
    "Publicidades.getResumen":{
        q: "SELECT * FROM publicidad WHERE MONTH(creada) = @mes AND YEAR(creada) = @anio",
        p: ["mes", "anio"]
    },
    "Publicidades.addCompartida":{
        q: "UPDATE publicidad SET compartida = compartida + 1 WHERE id = @id LIMIT 1",
        p: ["id"]
    },
    "Publicidades.updatePrioridad":{
        q: "UPDATE publicidad SET prioridad =@prioridad WHERE id = @id LIMIT 1",
        p: ["id", "prioridad"]
    },
    "Muro.selectLast100":{
        q: "SELECT * FROM publicacion_muro WHERE eliminado = 0 ORDER BY id DESC LIMIT 100",
        p: []
    },
    "Muro.getById":{
        q: "SELECT * FROM publicacion_muro WHERE id=@id",
        p: ["id"]
    },
    "Muro.insert":{
        q: "INSERT INTO publicacion_muro SET creado=NOW(), nombre='@nombre', poi='@poi', detalle='@detalle', imagen='@imagen', boton='@boton', activo='@activo', compartido=0, clicks=0, eliminado=0",
        p: ["nombre", "poi", "detalle", "imagen", "boton", "activo"]
    },
    "Muro.update":{
        q: "UPDATE publicacion_muro SET nombre='@nombre', poi='@poi', detalle='@detalle', imagen='@imagen', boton='@boton', activo='@activo', compartido=0, clicks=0 WHERE id=@id LIMIT 1",
        p: ["nombre", "poi", "detalle", "imagen", "boton", "activo", "id"]
    },
    "Muro.delete":{
        q: "UPDATE publicacion_muro SET eliminado = 1 WHERE id=@id LIMIT 1",
        p: ["id"]
    },

    "Marquesina.selectLast100":{
        q: "SELECT * FROM marquesina WHERE eliminado = 0 ORDER BY id DESC LIMIT 100",
        p: []
    },
    "Marquesina.selectActivos":{
        q: "SELECT * FROM marquesina WHERE eliminado = 0 AND vencimiento > NOW()",
        p: []
    },
    "Marquesina.insert":{
        q: "INSERT INTO marquesina SET tipo_publicacion='@tipo_publicacion', tipo_referencia='@tipo_referencia', referencia='@referencia', texto='@texto', enlace='@enlace', imagen='@imagen', vencimiento='@vencimiento', icono='@icono', color='@color', prioridad='@prioridad', activo='@activo', eliminado=0",
        p: ["tipo_publicacion", "tipo_referencia", "referencia", "texto", "enlace", "imagen", "vencimiento", "icono", "color", "prioridad", "activo"]
    },
    "Marquesina.update":{
        q: "UPDATE marquesina SET tipo_publicacion='@tipo_publicacion', tipo_referencia='@tipo_referencia', referencia='@referencia', texto='@texto', enlace='@enlace', imagen='@imagen', vencimiento='@vencimiento', icono='@icono', color='@color', prioridad='@prioridad', activo='@activo' WHERE id=@id LIMIT 1",
        p: ["tipo_publicacion", "tipo_referencia", "referencia", "texto", "enlace", "imagen", "vencimiento", "icono", "color", "prioridad", "activo", "id"]
    },
    "Marquesina.delete":{
        q: "UPDATE marquesina SET eliminado = 1 WHERE id=@id LIMIT 1",
        p: ["id"]
    },
    "Bitacora.insert":{
        q: "INSERT INTO bitacora SET fecha=NOW(), detalle='@detalle', usuario='@usuario'",
        p: ["detalle", "usuario"]
    },
    "Public.getNoticias":{
        q: "SELECT id, titulo, imagenes, fecha FROM noticias WHERE eliminado =0, activa = 1 AND id < @ultimo_id ORDER BY id DESC LIMIT 30",
        fn: function(arg1){
            return this.q.replace("@ultimo_id", parseInt(arg1));
        }
    },
    "Public.getNoticiasQ":{
        q: "SELECT id, titulo, imagenes, fecha FROM noticias WHERE eliminado =0, activa = 1",
        fn: function(arg1){
            return this.q.replace("@ultimo_id", parseInt(arg1));
        }
    },
    "AdminInicio.general": {
        q: "SELECT COUNT(id) as cantidad FROM noticia WHERE eliminado = 0; SELECT now() as ahora",
        p: []
    },
    "Notificaciones.getLast200":{
        q: "SELECT * FROM notificacion ORDER BY id DESC LIMIT 200",
        p: []
    },
    "Notificaciones.insert":{
        q: "INSERT INTO notificacion SET titulo='@titulo', cuerpo='@cuerpo', imagen='@imagen', url='@url', creado=NOW(), fue_enviado=0",
        p: ["titulo", "cuerpo", "imagen", "url"]
    },
    "Notificaciones.setEnviado":{
        q: "UPDATE notificacion SET fue_enviado = 1, enviado = NOW() WHERE id=@id LIMIT 1",
        p: ["id"]
    },
    "Ahora.update":{
        q: "UPDATE ahora SET texto='@texto', url='@url', color='@color', activo='@activo', actualizado=NOW(), idd='@idd' WHERE id=1 LIMIT 1",
        p: ["texto", "url", "color", "activo", "idd"]
    },
    "Ahora.getAhora":{
        q: "SELECT * FROM ahora WHERE id=1 LIMIT 1",
        p: []
    }
};