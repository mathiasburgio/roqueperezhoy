const { Router } = require("express")
const router = Router()
const webpush = require("web-push")
const path = require("path")
const mysql = require("mysql");
const globals = require("./modules/Globals");
const safequeries = require("./modules/SafeQueries");
const arreglos = require("./modules/Arreglos");
const fs = require("fs");
const fechas = require("./public/resources/Fechas");
const mysqldump = require('mysqldump');
const archiver = require("archiver")
const {CATEGORIAS_POIS, CATEGORIAS_EVENTOS, CATEGORIAS_NOTICIAS, PUBLICIDADES} = require("./public/resources/Arreglos")
const axios = require("axios");


var cache = {};//guardo en cacheo lo mas comun


const connection = mysql.createPool({
    connectionLimit : 10,
    host     : '127.0.0.1',
    user     : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE_NAME,
    timezone: 'utc',
    multipleStatements: true,
    debug    :  false
})

connection.aquery = (query, printQuery = false) =>{
    return new Promise(resolve=>{
        if(printQuery){ console.log(query); }
        connection.query(query, (err, result, fields)=>{
            //console.log(err, result, fields);
            if(err){ console.log(err); }
            resolve({err, result, fields});
        })
    })
}

const cachear = (req, res) =>{
    let t0 = performance.now();
    let fx = new Date();
    cache = {};
    Promise.all([
        //0 noticias
        connection.aquery(`SELECT * FROM noticia WHERE eliminado = 0 AND activa = 1 ORDER BY id DESC LIMIT 2000`),
        //1 pois
        connection.aquery(`SELECT * FROM poi WHERE eliminado = 0 AND activo = 1`),
        //2 farmacias_de_turno
        connection.aquery(`SELECT * FROM farmacia_de_turno WHERE eliminado = 0 ORDER BY id DESC LIMIT 3`),
        //3 publicidad
        connection.aquery(`SELECT * FROM publicidad WHERE fecha_inicio <= NOW() AND fecha_fin >= NOW() AND eliminado = 0 AND prioridad > 0`),
        //4 telefonos_utiles
        connection.aquery(`SELECT * FROM telefono_util WHERE eliminado = 0`),
        //5 horarios_de_transportes
        connection.aquery(`SELECT * FROM horario_de_transporte WHERE eliminado = 0 AND activo=1`),
        //6 marquesina
        connection.aquery(`SELECT * FROM marquesina WHERE eliminado = 0 AND activo=1 AND vencimiento >= NOW()`),
        //7 eventos
        connection.aquery(`SELECT * FROM evento WHERE eliminado = 0 AND activo=1 AND fecha_fin >= NOW()`),
        //8 publicaciones MURO
        connection.aquery(`SELECT * FROM publicacion_muro WHERE eliminado = 0 AND activo=1 ORDER BY id DESC LIMIT 100`),
        //9 ahora
        connection.aquery(`SELECT * FROM ahora LIMIT 1`),
    ]).then(ret=>{
        cache.fecha = fx;
        cache.noticias = ret[0].result;
        cache.pois = ret[1].result;
        cache.farmaciasDeTurno = ret[2].result;
        cache.publicidades = ret[3].result;
        cache.telefonosUtiles = ret[4].result;
        cache.horariosDeTransportes = ret[5].result;
        cache.marquesina = ret[6].result;
        cache.eventos = ret[7].result;
        cache.publicacionesMuro = ret[8].result;
        cache.ahora = ret[9].result[0];

        cache.poisFarmacias = [];
        cache.poisTransportes = [];

        //desordeno las publicidades para que siempre se muestren de forma distina
        cache.publicidades.sort((a,b)=> globals.getRandom(-1,1));
        cache.publicidades.sort((a,b)=>{
            if(a.prioridad > b.prioridad) return -1
            if(a.prioridad < b.prioridad) return 1
            return 0
        })

        //asigno las publicidades a los pois
        cache.publicidades.forEach(item=>{
            item.px = PUBLICIDADES.find(p=>p.id === item.pid)
            if(item.px.grupo == "poi"){
                let px = cache.pois.find(p=>p.id === item.id_ref);
                if(px){ px.publicidad = item; }
            }else if(item.px.grupo == "evento"){
                let px = cache.eventos.find(p=>p.id === item.id_ref);
                if(px){ px.publicidad = item; }
            }else if(item.px.grupo == "noticia"){
                let px = cache.noticias.find(p=>p.id === item.id_ref);
                if(px){ px.publicidad = item; }
            }
        });

        //desordeno todo
        cache.marquesina.sort((a,b)=> globals.getRandom(-1,1));

        //reordeno marquesina
        cache.marquesina.sort((a,b)=>{
            if(a.prioridad > b.prioridad){
                return 1;
            }else if(a.prioridad < b.prioridad){
                return -1;
            }else{
                return 0;
            }
        });
        
        //desordeno todo
        cache.pois.sort((a,b)=> globals.getRandom(-1,1));

        //el desorden, lo reordeno segun tipo de publicidad
        cache.pois.sort((a,b)=>{
            if(typeof a.publicidad != "undefined" && typeof b.publicidad == "undefined"){
                return -1;
            }else if(typeof a.publicidad == "undefined" && typeof b.publicidad != "undefined"){
                return 1;
            }else if(typeof a.publicidad == "undefined" && typeof b.publicidad == "undefined"){
                return 0;
            }else{
                if(a.publicidad?.px?.prioridad < b.publicidad?.px?.prioridad){
                    return -1;
                }else if(a.publicidad?.px?.prioridad > b.publicidad?.px?.prioridad){
                    return 1;
                }else{
                    if((a.publicidad.subtipo == "DESTACADA" || a.publicidad.subtipo == "PRUEBA_GRATIS_DESTACADA") && (b.publicidad.subtipo != "DESTACADA" && b.publicidad.subtipo != "PRUEBA_GRATIS_DESTACADA")){
                        return -1;
                    }else if((a.publicidad.subtipo != "DESTACADA" && a.publicidad.subtipo != "PRUEBA_GRATIS_DESTACADA") && (b.publicidad.subtipo == "DESTACADA" || b.publicidad.subtipo == "PRUEBA_GRATIS_DESTACADA")){
                        return 1;
                    }else{
                        return 0;
                    }
                }
            }
        });


        //parseo todos los JSON
        cache.noticias.forEach(n=>{
            n.imagenes = JSON.parse(n.imagenes);
            n.tags = n.tags.split(";");
            n.categoria = CATEGORIAS_NOTICIAS.find(c=>c.id === parseInt(n.categoria))
        });

        //parseo todos los JSON
        //remuevo los datos de contacto de quienes no tienen publi
        cache.pois.forEach(n=>{
            n.imagenes = JSON.parse(n.imagenes);
            n.dias_horarios = JSON.parse(n.dias_horarios);
            n.datos_de_contacto = JSON.parse(n.datos_de_contacto);
            if(n.geo) n.geo = JSON.parse(n.geo)
            n.categoria_1 = CATEGORIAS_POIS.find(c=>c.id === parseInt(n.categoria_1))
            n.categoria_2 = CATEGORIAS_POIS.find(c=>c.id === parseInt(n.categoria_2))
            n.categoria_3 = CATEGORIAS_POIS.find(c=>c.id === parseInt(n.categoria_3))
            if(!n.publicidad) n.datos_de_contacto = []
        });

        let _poisFarmacias = [];
        //parseo todos los JSON
        cache.farmaciasDeTurno.forEach(n=>{
            n.fechas = JSON.parse(n.fechas);
            Object.values(n.fechas).forEach(f=>{
                _poisFarmacias.push(f);
            });
        });
        cache.poisFarmacias = getPois(_poisFarmacias)

        //parseo todos los JSON
        cache.telefonosUtiles.forEach(n=>{
            n.datos_de_contacto = JSON.parse(n.datos_de_contacto);
        });

        let _poisTransportes = []
        //parseo todos los JSON
        cache.horariosDeTransportes.forEach(n=>{
            n.dias_horarios = JSON.parse(n.dias_horarios);
            _poisTransportes.push(n.poi_transporte || 0)
            _poisTransportes.push(n.poi_origen || 0)
            _poisTransportes.push(n.poi_destino || 0)
        });
        cache.poisTransportes = getPois(_poisTransportes)

        //parseo todos los JSON
        cache.eventos.forEach(n=>{
            n.fechas = JSON.parse(n.fechas);
            n.imagenes = JSON.parse(n.imagenes);
            n.categoria = CATEGORIAS_EVENTOS.find(c=>c.id === parseInt(n.categoria))
        });

        cache._index = {
            fecha: cache.fecha,
            noticias: cache.noticias.slice(0,10),
            eventos: cache.eventos.slice(0,10),
            publicidades: cache.publicidades.filter(p=>p.tipo == "otra" && p.subtipo != "solo redes").slice(0,10),
            marquesina: cache.marquesina,
            pois: cache.pois.slice(0,10),//verificar esto, puede q tenga q invertir el array previo a hacer el slice
        }

        cache.marquesina_general = cache.marquesina.filter(m=>m.tipo_publicacion.indexOf("marquesina") >-1);
        cache.publicidad_general = cache.publicidades.filter(p=>["EVENTO_FULL", "POI_PREMIUM", "POI_PRUEBA_GRATIS_PREMIUM", "OTRA_lateral", "OTRA_lateral + redes", "OTRA_lateral PLUS", "OTRA_lateral PLUS + redes"].includes(p.px.nombre))
        cache.publicidad_general = cache.publicidad_general.map(p=>{return {id: p.id, imagen: p.imagen, pid: p.pid, px: p.px, enlace: p.enlace}})
        cache.ultimas_noticias = cache.noticias.slice(0, 20).map(nx=>{return {id: nx.id, url: nx.url, titulo: nx.titulo, bajada: nx.bajada, imagenes: nx.imagenes, fecha: nx.fecha, video: nx.video, categoria: nx.categoria}});
        cache.pois_simple = cache.pois.map(p=>{return {id: p.id, categoria_1: p.categoria_1, nombre: p.nombre, propietario: p.propietario, imagenes: [p.imagenes[0]], url: p.url, dias_horarios: p.dias_horarios, publicidad: p.publicidad}});
        let t1 = performance.now();
        cache.performance = (t1 - t0).toFixed(2) + "ms";
        cache._index.performance = (t1 - t0).toFixed(2) + "ms";
        console.log("cache: " + cache.performance);
        if(res){res.json({status: 1}); res.end();}
    });
}

var cacheClima = null;
var climaToMarquee = null;
const cachearClima = () =>{
    axios.get(`https://api.tutiempo.net/json/?lan=es&apid=XwGXz4X4azzg2oQ&lid=121997`)
    .then(ret=>{
        if(typeof ret == "string") ret = JSON.parse(ret);
        cacheClima = ret.data;
        cacheClima.fx = fechas.getNow(true);
        climaToMarquee = {
            hoy: cacheClima?.day1 || null,
            ahora: cacheClima?.hour_hour?.hour1 || null,
            fx: cacheClima.fx
        }
    });
}

const getPois = (aux) =>{
    if(Array.isArray(aux) == false) aux = [aux];
    let s = new Set();
    aux.forEach(px=> s.add(px) );
    let aux2 = [];
    Array.from(s).forEach(px=>{
        let existe = cache.pois.find(p=>p.id === parseInt(px));
        if(existe) aux2.push(existe)
    });
    return aux2;
}

var antispamVisita = [];
const anotarVisita = ({req, seccion, referencia = -1}) =>{
    const fx = new Date()
    let dia = fx.getDate()
    let mes = fx.getMonth() + 1
    let anio = fx.getFullYear()
    let hora = fx.getHours()
    dia = dia < 10 ? "0" + dia : dia
    mes = mes < 10 ? "0" + mes : mes
    const fx2 = anio + "-" + mes + "-" + dia

    const ip = getIp(req);
    let existe = antispamVisita.find(x=>x.ip === ip && x.seccion == seccion && x.referencia == referencia && x.fx2 === fx2 && x.hora == hora);
    if(existe) return; //si existe la visita dentro de la misma hora, no la registro
    antispamVisita.push({ip, seccion, referencia, fx2, hora });
    antispamVisita = antispamVisita.slice(-2000);//guarda los ultimos 2mil registros
    connection.query(`SELECT id FROM visita WHERE seccion='${seccion}' AND referencia='${referencia}' AND hora=${hora} AND fecha='${fx2}'`, (err, result)=>{
        if(err) console.log(err);
        if(result.length == 1){
            connection.query(`UPDATE visita SET contador = contador + 1 WHERE id=${result[0].id} LIMIT 1`)
        }else{
            connection.query(`INSERT INTO visita SET hora=${hora}, fecha='${fx2}', seccion='${seccion}', referencia='${referencia}', contador= 1`)
        }
    });
}

//rutina de cacheo
setTimeout(()=>{
    cachear();
}, 1000 * 60 * 5);//cachea cada 5 min


setTimeout(()=>{
    cachearClima();
}, (1000 * 60 * 60));//cada 1 hora

webpush.setVapidDetails(
    "mailto:mathias.b@live.com.ar", 
    process.env.PUBLIC_VAPID_KEY, 
    process.env.PRIVATE_VAPID_KEY
);

//var tempSuscription = null;
router.post("/subscription", async (req, res)=>{
    //tempSuscription = req.fields;
    try{
        //console.log(req.fields);
        let endpoint = (req.fields.endpoint || "").toString();
        let p256dh = (req.fields.keys.p256dh || "").toString();
        let auth = (req.fields.keys.auth || "").toString();
        
        if(/^[0-9a-zA-Z.\_\-:/]+$/.test(endpoint) == false) throw "endpoint no válido (codigo 1)"
        if(endpoint.length < 128 || endpoint.length > 256) throw "endpoint no válido (codigo 2)"
        if(/^https?:\/\/(localhost|\w+\.)*\w+\.\w+(:\d+)?(\/\S*)?$/.test(endpoint) == false) throw "endpoint no válido (codigo 3)"
        if(/^[A-Za-z0-9_-]+$/.test(p256dh) == false) throw "key.p256dh no válido (codigo 1)"
        if(p256dh.length < 64 || p256dh.length > 128) throw "key.p256dh no válido (codigo 2)"
        if(/^[A-Za-z0-9_-]+$/.test(auth) == false) throw "key.auth no válido (codigo 1)"
        if(auth.length < 16 || auth.length > 32) throw "key.auth no válido (codigo 2)"
    
        let token= {
            endpoint: endpoint,
            expirationTime: null,
            keys: {
                p256dh: p256dh,
                auth: auth,
            }
        };

        let ip = getIp(req)
    
        connection.query(`SELECT * FROM reg_notificacion WHERE endpoint='${endpoint}'`, (err, result)=>{
            if(result.length === 0){
                connection.query(`INSERT INTO reg_notificacion SET errores = '[]', habilitado=1, creado=NOW(), endpoint='${token.endpoint}', p256dh='${token.keys.p256dh}', auth='${token.keys.auth}', token='${JSON.stringify(token)}', ip='${ip}'`, (err, result)=>{
                    if(err) throw err
                });
            }
        });
        res.status(200).json({status: 1, message: "OK"})
    }catch(err){
        console.log(err);
        res.status(200).json({status: 0, message: err.toString()})
    }
})

router.post("/safeQuery", (req, res)=>{
    if(!req.session.user){ res.end(); return; }
    safeQuery(req, res);
});
router.post("/exec", (req, res)=>{
    try{
        if(req.fields.function == "login"){
            login(req, res);
        }else if(req.fields.function == "logout"){
            logout(req, res);
        }else if(req.fields.function == "cachear"){
            if(!req.session.user){ res.end(); return; }
            cachear(req, res);
        }else if(req.fields.function == "get_hash"){
            if(!req.session.user || req.session.user.mail != "mathias.b@live.com.ar"){ res.end(); return; }
            globals.get_password_hash(req.fields.string).then(ret=>{
                res.json({status:1, hash: ret});
                res.end();
            });
        }else if(req.fields.function == "set_url"){
            if(!req.session.user){ res.end(); return; }
            connection.query(`UPDATE ${req.fields.tabla} SET url='${req.fields._url}' WHERE id='${req.fields.id}' LIMIT 1`);
            res.status(200).json({status: 1});
        }else if(req.fields.function == "send_notification"){
            if(!req.session.user){ res.end(); return; }
            sendNotification(req, res);
        }else if(req.fields.function == "respaldar_bd"){
            try{
                let termino = 0;
                mysqldump({
                    connection: {
                        host: 'localhost',
                        user: 'root',
                        password: 'servidor',
                        database: 'roqueperezhoy',
                    },
                    dumpToFile: __dirname + '/dump.sql'
                }).then(ret=>{
                    res.status(200).json({status: 1, message: "dump.sql"});
                }).catch(err=>{
                    throw err;
                });
    
            }catch(err){
                res.status(200).json({status: 0, message: err.toString()});
            }
            
        }else if(req.fields.function == "respaldar_imgs"){
            try{
                let output = fs.createWriteStream(__dirname + "/images.zip")
                let archive = archiver("zip")
    
                output.on('close', ()=>{
                    res.status(200).json({status: 1, message: "images.zip"});
                })

                archive.on('error', function(err){
                    throw err;
                });
    
                archive.pipe(output)
                archive.directory(__dirname + "/public/images/subidas/", false)
                archive.finalize()
            }catch(err){
                res.status(200).json({status: 0, message: err.toString()});
            }
        }
    }catch(err){
        res.json({status: 0, message: err});
        res.end();
    }
});

router.get("/descargar-dump", (req, res) =>{
    if(!req.session.user){ res.end(); return; }
    try{
        res.download(__dirname + "/dump.sql")
    }catch(err){
        console.log(err)
    }
});

router.get("/descargar-images", (req, res) =>{
    if(!req.session.user){ res.end(); return; }
    try{
        res.download(__dirname + "/images.zip")
    }catch(err){
        console.log(err)
    }
});

router.post("/upload", (req, res) =>{
    if(!req.session.user){ res.end(); return; }
    upload(req, res);
});



router.get("/login", (req, res)=>{
    res.setHeader('content-type', 'text/html');
    res.status(200).sendFile(path.join(__dirname, '/login.html')); 
});

router.get("/worker.js", (req, res)=>{
    res.status(200).sendFile(path.join(__dirname, 'public', 'worker.js')); 
});

router.get("/manifest.json", (req, res)=>{
    res.status(200).sendFile(path.join(__dirname, 'public', 'manifest.json')); 
});

router.get("/admin_inicio_get_info", async(req, res)=>{
    if(!req.session.user){ res.end(); return; }
    let fx = new Date()
    fx.setMonth(fx.getMonth() - 1)
    let anio_previo = fx.getFullYear()
    let mes_previo = fx.getMonth() + 1
    Promise.all([
        connection.aquery("SELECT COUNT(id) as cantidad FROM noticia WHERE eliminado = 0 AND activa = 1"),
        connection.aquery("SELECT COUNT(id) as cantidad FROM poi WHERE eliminado = 0 AND activo = 1"),
        connection.aquery("SELECT COUNT(id) as cantidad FROM publicacion_muro WHERE eliminado = 0 AND activo = 1"),
        connection.aquery("SELECT COUNT(id) as cantidad FROM evento WHERE eliminado = 0 AND activo = 1"),
        connection.aquery("SELECT COUNT(id) as cantidad FROM reg_notificacion WHERE habilitado = 1"),
        connection.aquery("SELECT COUNT(id) as cantidad, seccion FROM visita WHERE YEAR(fecha) = YEAR(NOW()) AND MONTH(fecha) = MONTH(NOW()) GROUP BY seccion"),
        connection.aquery(`SELECT COUNT(id) as cantidad, seccion FROM visita WHERE YEAR(fecha) = YEAR(${anio_previo}) AND MONTH(fecha) = MONTH(${mes_previo}) GROUP BY seccion`),
        connection.aquery(`SELECT COUNT(id) as cantidad, pid FROM publicidad WHERE fecha_inicio <= NOW() AND fecha_fin >= NOW() GROUP BY pid`),
        connection.aquery(`SELECT COUNT(id) as cantidad, pid FROM publicidad WHERE YEAR(creada) = YEAR(NOW()) AND MONTH(creada) = MONTH(NOW()) GROUP BY pid`),
        connection.aquery(`SELECT COUNT(id) as cantidad FROM poi WHERE DATEDIFF(NOW(), ultima_actualizacion) > 60`),
    ]).then(ret=>{
        //console.log(ret);
        let ret2 = {
            ahora: cache.ahora,
            
            bd_noticias: ret[0].result[0].cantidad,
            bd_pois: ret[1].result[0].cantidad,
            bd_publicaciones_muro: ret[2].result[0].cantidad,
            bd_eventos: ret[3].result[0].cantidad,
            bd_registro_notificaciones: ret[4].result[0].cantidad,
            bd_visitas_mes_actual: ret[5].result,
            bd_visitas_mes_anterior: ret[6].result,
            bd_publicidades_activas: ret[7].result,
            bd_publicidades_creadas: ret[8].result,
            bd_pois_60_dias: ret[9].result[0].cantidad,

            fecha: new Date(),
            cache_noticias: cache.noticias.length,
            cache_pois: cache.pois.length,
            cache_publicidades: cache.publicidades.length,
            cache_marquesina: cache.marquesina.length,
            cache_eventos: cache.eventos.length,
            cache_publicacionesMuro: cache.publicacionesMuro.length,
        };
        res.status(200).json(ret2);
    });
});

router.get([
    "/admin_inicio",
    "/admin_ahora",
    "/admin_noticias",
    "/admin_publicidades",
    "/admin_guia-comercial",
    "/admin_farmacias-de-turno",
    "/admin_horarios-de-transportes",
    "/admin_eventos",
    "/admin_telefonos-utiles",
    "/admin_comunidad",
    "/admin_marquesina",
    "/admin_notificaciones"
], async (req, res)=>{
    let raw_url = req.originalUrl.substring(1);//remuevo "/"
    if(raw_url.indexOf("?") > -1) raw_url = raw_url.split("?")[0]
    if(raw_url.indexOf("#") > -1) raw_url = raw_url.split("#")[0]
    if(!req.session.user){ 
        res.redirect("/");
        return; 
    }
    res.render(raw_url, {
        title: "Roque Pérez Hoy", 
        ogTitle: "Roqué Perez Hoy", 
        ogUrl: "https://roqueperezhoy.com.ar", 
        ogImage: "https://roqueperezhoy.com.ar/images/roque-perez-hoy-3.png", 
        ogType: "website",
        datos: "{}"
    })
})

router.get("/", (req, res)=>{
    anotarVisita({req, seccion: "index", referencia: -1})
    res.render("front_index", {
        title: "Roque Pérez Hoy", 
        ogTitle: "Roqué Perez Hoy", 
        ogUrl: "https://roqueperezhoy.com.ar", 
        ogImage: "https://roqueperezhoy.com.ar/images/compartir_roqueperezhoy.png", 
        ogType: "website",
        datos: JSON.stringify({
            noticias: cache.ultimas_noticias,
            eventos: cache.eventos,
            ahora: cache.ahora,
            publicidades: cache.publicidad_general,
            marquesina: cache.marquesina,//marquesina solo para q me traiga los sliders tambien
            pois: cache.pois_simple.slice(0, 20),
            clima: climaToMarquee
        })
    })
});

router.get("/editor-imagen.html", (req, res)=>{
    res.sendFile(path.join(__dirname, "views", "editor-imagen.html"));
});

router.get("/noticias", (req, res)=>{
    anotarVisita({req, seccion: "noticias", referencia: -1})
    res.render("front_noticias", {
        title: "Noticias", 
        ogTitle: "Noticias", 
        ogUrl: "https://roqueperezhoy.com.ar/noticias", 
        ogImage: "https://roqueperezhoy.com.ar/images/compartir_noticias.png", 
        ogType: "article",
        datos: JSON.stringify({
            noticias: cache.ultimas_noticias,
            ahora: cache.ahora,
            publicidades: cache.publicidad_general,
            marquesina: cache.marquesina_general
        })
    })
    res.end();
});
router.get("/noticias/q/:tipo/:query/:offset", (req, res)=>{
    try{
        let tipo =  (req.params.tipo || "").toString();
        let query = (req.params.query || "").toString();
        let offset = (parseInt(req.params.offset) || 0);
        if(offset < 0) offset = 0
    
        cache.noticias.filter(n=>n.categoria === query)
        let lista = [];
        if(tipo == "categoria")lista = cache.noticias.filter(n=>n.categoria.id === parseInt(query))
        else if(tipo == "tag") lista = cache.noticias.filter(n=>n.tags.includes(query))
        else if(tipo == "buscar") lista = cache.noticias.filter(n=>n.titulo.toLowerCase().indexOf(query.toLowerCase()) > -1)
        else lista = cache.noticias

        res.status(200).json({ lista: lista.slice(offset, offset + 10).map(nx=>{return {id: nx.id, url: nx.url, titulo: nx.titulo, bajada: nx.bajada, imagenes: nx.imagenes, fecha: nx.fecha, video: nx.video, categoria: nx.categoria}}) })
    }catch(err){
        res.status(200).json({ lista: [] })
    }
});

router.get("/noticia/:id", async(req, res)=>{
    let id = parseInt((req.params.id || "").split("-")[0]);
    let nx = cache.noticias.find(n=>n.id === id);
    if(!nx){
        let aux = await connection.aquery(`SELECT * FROM noticia WHERE eliminado = 0 AND activa = 1 AND id='${id}' LIMIT 1`)
        //console.log(aux)
        if(aux.result.length === 1){
            nx = aux.result[0]
            nx.imagenes = JSON.parse(nx.imagenes)
        }
    }
    anotarVisita({req, seccion: "noticia", referencia: id || -1})
    res.render("front_noticia", {
        title: nx ? globals.bd_to_str(nx.titulo) : "Noticia no encontrada", 
        ogTitle: nx ? globals.bd_to_str(nx.titulo) : "Noticia no encontrada", 
        ogUrl: "https://roqueperezhoy.com.ar/noticia/" + (nx ? nx.url : "0-noticia-no-encontrada"), 
        ogImage: "https://roqueperezhoy.com.ar/images/" + (nx && nx.imagenes[0] != "sin_imagen.jpg" ? ("subidas/" + nx.imagenes[0]) : "compartir_noticias.png"), 
        ogType: "article",
        datos: JSON.stringify({
            noticia: nx,
            noticias: cache.ultimas_noticias,
            ahora: cache.ahora,
            publicidades: cache.publicidad_general,
            marquesina: cache.marquesina_general
        })
    })
});

router.get("/eventos", async(req, res)=>{
    anotarVisita({req, seccion: "eventos", referencia: -1})
    res.render("front_eventos", {
        title: "Eventos", 
        ogTitle: "Eventos", 
        ogUrl: "https://roqueperezhoy.com.ar/eventos", 
        ogImage: "https://roqueperezhoy.com.ar/images/compartir_eventos.png", 
        ogType: "article",
        datos: JSON.stringify({
            eventos: cache.eventos,
            ahora: cache.ahora,
            publicidades: cache.publicidad_general,
            marquesina: cache.marquesina_general,
        })
    })
});

router.get("/evento/:id", async(req, res)=>{
    let id = parseInt((req.params.id || "").split("-")[0]);
    let nx = cache.eventos.find(n=>n.id === id);
    if(!nx){
        let aux = await connection.aquery(`SELECT * FROM evento WHERE eliminado = 0 AND activo = 1 AND id=${id} LIMIT 1`)
        //console.log(aux)
        if(aux.result.length === 1){
            nx = aux.result[0]
            nx.imagenes = JSON.parse(nx.imagenes)
            nx.fechas = JSON.parse(nx.fechas)
        }
    }
    anotarVisita({req, seccion: "evento", referencia: id || -1})
    res.render("front_evento", {
        title: nx ? globals.bd_to_str(nx.nombre) : "Evento no encontrado", 
        ogTitle: nx ? globals.bd_to_str(nx.nombre) : "Evento no encontrado", 
        ogUrl: "https://roqueperezhoy.com.ar/evento/" + (nx ? nx.url : "0-evento-no-encontrado"), 
        ogImage: "https://roqueperezhoy.com.ar/images/" + (nx && nx.imagenes[0] != "sin_imagen.jpg" ? ("subidas/" + nx.imagenes[0]) : "compartir_eventos.png"), 
        ogType: "article",
        datos: JSON.stringify({
            evento: nx,
            eventos: cache.eventos,
            ahora: cache.ahora,
            publicidades: cache.publicidad_general,
            marquesina: cache.marquesina_general,
        })
    })
});

router.get("/guia-comercial", async(req, res)=>{
    anotarVisita({req, seccion: "guia_comercial", referencia: -1})
    res.render("front_guia-comercial", {
        title: "Guía comercial", 
        ogTitle: "Guía comercial", 
        ogUrl: "https://roqueperezhoy.com.ar/guia-comercial", 
        ogImage: "https://roqueperezhoy.com.ar/images/compartir_guia_comercial.png", 
        ogType: "article",
        datos: JSON.stringify({
            pois: cache.pois_simple,
            ahora: cache.ahora,
            publicidades: cache.publicidad_general,
            marquesina: cache.marquesina_general,
        })
    })
});

router.get("/guia-comercial/comercio/:id", async(req, res)=>{
    let id = parseInt((req.params.id || "").split("-")[0]);
    let nx = cache.pois.find(n=>n.id === id);
    if(!nx){
        let aux = await connection.aquery(`SELECT * FROM poi WHERE eliminado = 0 AND activo = 1 AND id='${id}' LIMIT 1`)
        if(aux.result.length === 1){
            nx = aux.result[0]
            nx.imagenes = JSON.parse(nx.imagenes);
            nx.geo = nx.geo ? JSON.parse(nx.geo) : "";
            nx.datos_de_contacto = JSON.parse(nx.datos_de_contacto)
            nx.dias_horarios = JSON.parse(nx.dias_horarios)
        }
    }
    anotarVisita({req, seccion: "comercio", referencia: id || -1})
    res.render("front_comercio", {
        title: nx ? globals.bd_to_str(nx.nombre) : "Emprendimiento no encontrado", 
        ogTitle: nx ? globals.bd_to_str(nx.nombre) : "Emprendimiento no encontrado", 
        ogUrl: "https://roqueperezhoy.com.ar/guia-comercial/comercio/" + (nx ? globals.getUrl(nx.id, nx.nombre) : "0-emprendimiento-no-encontrado"), 
        ogImage: "https://roqueperezhoy.com.ar/images/" + (nx && nx.imagenes[0] != "sin_imagen.jpg" ? ("subidas/" + nx.imagenes[0]) : "compartir_guia_comercial.png"), 
        ogType: "article",
        datos: JSON.stringify({
            poi: nx,
            pois: cache.pois_simple,
            ahora: cache.ahora,
            publicidades: cache.publicidad_general,
            marquesina: cache.marquesina_general,
        })
    })
});

router.get("/publicidad/:id", async(req, res)=>{
    let id = parseInt((req.params.id || "").split("-")[0]);
    let nx = cache.publicidades.find(n=>n.id === id);
    if(!nx){
        let aux = await connection.aquery(`SELECT * FROM publicidad WHERE eliminado = 0 AND fecha_inicio <= NOW() AND fecha_fin >= NOW() AND id='${id}' LIMIT 1`)
        if(aux.result.length === 1) nx = aux.result[0];
    }
    anotarVisita({req, seccion: "publicidad", referencia: id || -1})
    let nombre = nx ? nx.nombre.split("#") : "Roque Pérez Hoy";
    nombre = nombre.length === 2 ? nombre[1].trim() : nombre[0];
    res.render("front_publicidad", {
        title: globals.bd_to_str(nombre), 
        ogTitle: globals.bd_to_str(nombre), 
        ogUrl: (nx ? nx.enlace : "https://roqueperezhoy.com.ar"), 
        ogImage: "https://roqueperezhoy.com.ar/images/subidas/" + (nx ? nx.imagen : "sin_imagen.jpg"), 
        ogType: "article",
        datos: JSON.stringify(nx || {})
    })
});

router.get(["/comunidad", "/comunidad/:id"], async(req, res)=>{
    let id = parseInt((req.params.id || "").split("-")[0]);
    let nx = null;
    if(id){
        nx = cache.publicacionesMuro.find(n=>n.id === id);
        if(!nx){
            let aux = await connection.aquery(`SELECT * FROM muro WHERE eliminado = 0 AND activo = 1 AND id='${id}' LIMIT 1`)
            if(aux.result.length === 1) nx = aux.result[0]
        }
    }
    anotarVisita({req, seccion: "comunidad", referencia: id || -1})
    res.render("front_comunidad", {
        title: "Comunidad Roque Pérez Hoy", 
        ogTitle: decodeURI(nx ? nx.nombre : "Comunidad Roque Pérez Hoy"), 
        ogUrl: "https://roqueperezhoy.com.ar/comunidad" + (nx ? "/" + nx.id : ""), 
        ogImage: "https://roqueperezhoy.com.ar/images/" + (nx ? "subidas/" + nx.imagen : "compartir_comunidad.png"), 
        ogType: "article",
        datos: JSON.stringify({
            publicacion: nx,
            publicaciones: cache.publicacionesMuro.slice(0,5),
            ahora: cache.ahora,
            publicidades: cache.publicidad_general,
            marquesina: cache.marquesina_general,
            noticias: cache.ultimas_noticias
        })
    })
});

router.post("/like_comunidad", async(req, res)=>{
    let id = parseInt(req.fields.id) || 0;
    let accion = parseInt(req.fields.accion) || 0;//1 sumar
    let ip = getIp(req);
    if(id && id > 0){
        let nx = cache.publicacionesMuro.find(n=>n.id === id);
        console.log(id, accion)
        connection.query(`SELECT * FROM click_publicacion_muro WHERE ip='${ip}' AND publicacion = '${id}' LIMIT 1`, (err, result)=>{
            if(result.length === 1){
                if(accion == -1 && result[0].sumar === 1){
                    connection.query(`UPDATE publicacion_muro SET clicks = clicks - 1 WHERE id=${id} LIMIT 1`);
                    connection.query(`UPDATE click_publicacion_muro SET sumar=0 WHERE ip='${ip}' AND publicacion=${id} LIMIT 1`);
                    if(nx) nx.clicks--
                }else if(accion == 1 && result[0].sumar === 0){
                    connection.query(`UPDATE publicacion_muro SET clicks = clicks + 1 WHERE id=${id} LIMIT 1`);
                    connection.query(`UPDATE click_publicacion_muro SET sumar=1 WHERE ip='${ip}' AND publicacion=${id} LIMIT 1`);
                    if(nx) nx.clicks++
                }
            }else{
                if(accion === 1){
                    connection.query(`UPDATE publicacion_muro SET clicks = clicks + 1 WHERE id=${id} LIMIT 1`);
                    connection.query(`INSERT INTO click_publicacion_muro SET ip = '${ip}', publicacion=${id}, sumar=1`);
                    if(nx) nx.clicks++
                }
            }
        });
    }
    res.end()
})
router.get("/comunidad_cargar_mas/:lastid", async(req, res)=>{
    let lastid = parseInt(req.params.lastid) || 0;
    let ind = cache.publicacionesMuro.findIndex(p=>p.id == lastid);
    if(ind && ind > -1){
        let ar = cache.publicacionesMuro.slice(ind, ind + 5)
        res.status(200).json({lista: ar});
    }else{
        res.status(200).json({lista: []});
    }
});

router.get("/telefonos-utiles", async(req, res)=>{
    anotarVisita({req, seccion: "telefonos-utiles", referencia: -1})
    res.render("front_telefonos-utiles", {
        title: "Teléfonos útiles - Roque Pérez Hoy", 
        ogTitle: "Teléfonos útiles - Roque Pérez Hoy", 
        ogUrl: "https://roqueperezhoy.com.ar/telefonos-utiles", 
        ogImage: "https://roqueperezhoy.com.ar/telefonos-utiles.png", 
        ogType: "article",
        datos: JSON.stringify({
            contactos: cache.telefonosUtiles,
            ahora: cache.ahora,
            publicidades: cache.publicidad_general,
            marquesina: cache.marquesina_general,
            noticias: cache.ultimas_noticias,
        })
    })
});

router.get("/farmacias-de-turno", async(req, res)=>{
    anotarVisita({req, seccion: "farmacias-de-turno", referencia: -1})
    res.render("front_farmacias-de-turno", {
        title: "Farmacias de turno - Roque Pérez Hoy", 
        ogTitle: "Farmacias de turno - Roque Pérez Hoy", 
        ogUrl: "https://roqueperezhoy.com.ar/farmacias-de-turno", 
        ogImage: "https://roqueperezhoy.com.ar/images/compartir_farmacias_de_turno.png", 
        ogType: "article",
        datos: JSON.stringify({
            noticias: cache.ultimas_noticias,
            ahora: cache.ahora,
            publicidades: cache.publicidad_general,
            marquesina: cache.marquesina_general,
            fechas: cache.farmaciasDeTurno,
            pois: cache.poisFarmacias,
        })
    })
});

router.get(["/horarios-de-transportes", "/horarios-de-transportes/:id"], async(req, res)=>{
    let id = (req.params.id || "").toString();
    id = id ? parseInt(id.split("-")[0]) : -1;

    anotarVisita({req, seccion: "horarios-de-transportes", referencia: id || -1})
    res.render("front_horarios-de-transportes", {
        title: "Horarios de transportes - Roque Pérez Hoy", 
        ogTitle: "Horarios de transportes - Roque Pérez Hoy", 
        ogUrl: "https://roqueperezhoy.com.ar/horarios-de-transportes", 
        ogImage: "https://roqueperezhoy.com.ar/images/compartir_horarios_de_transportes.png", 
        ogType: "article",
        datos: JSON.stringify({
            horarios: cache.horariosDeTransportes,
            pois: cache.poisTransportes,
            ahora: cache.ahora,
            publicidades: cache.publicidad_general,
            marquesina: cache.marquesina_general,
            noticias: cache.ultimas_noticias,
        })
    })
});
router.get("/ping", (req, res)=>{
    console.log("req=>ping")
    res.status(200).send("pong")
});

let bandera_login = false;
const login = async (req, res) =>{
    try{
        //el mejor puto codigo para evitar ataques de fuerza bruta
        if(bandera_login){res.json({status:0, message: "Aguarde unos segundos para reintentar"}); return;}
        bandera_login = true;
        setTimeout(()=>{bandera_login = false},3000);

        let ux = arreglos.usuarios.find(item=>item.mail === req.fields.mail.toLowerCase());
        if(!ux){ res.json({status: 0, message: "Combinación mail/contraseña no válida(1)."}); return; }
        let passComp = await globals.compare_password_hash(req.fields.contrasena, ux.contrasena);
        if(!passComp){ res.json({status: 0, message: "Combinación mail/contraseña no válida(2)."}); return; }
        //console.log(ux);
        req.session.user = ux;
        req.session.save();
        res.json({status: 1, mail: ux.mail, permisos: ux.permisos});
    }catch(err){
        console.log(err);
        res.json({status: 0, message: err});
    }
    res.end();
}
const logout = (req, res) =>{
    req.session.destroy();
    res.json({status: 1});
    res.end();
}
const safeQuery = async (req, res) =>{
    try{
        if(!req.session.user){ throw "Usuario no válido." }
        let qx = safequeries[req.fields.q];
        if(!qx){throw "Query no encontrada [" + req.fields.q + "]"}
        let aux = qx.q;
        qx.p.forEach(param=>{
            if(typeof req.fields[param] == "undefined"){ throw "Paramentro [" + param + "] no encontrado."}
            aux = aux.replaceAll("@" + param, req.fields[param])
        });
        let ret = await connection.aquery(aux);
        res.json(ret);
    }catch(err){
        res.json({status: 0, message: err});
        res.end();
    }
}
const upload = (req, res) =>{
    try{
        let _files = [];
        let _queries = [];
        let cc = 0;
        for(let f in req.files){
            let file = req.files[f];
            
            if(file.size > 1024 * 1024 * 5){res.json({status: 0, message: "Tamaño máximo de archivo 5Mb"}); return;}
            let newName = "file_" + new Date().getTime() + "_" + cc + "." + file.name.split(".").at(-1);
            let newPath = path.join(__dirname, "public", "images", "subidas", newName);
            console.log(req.files[f].path, newPath);
            fs.copyFileSync(req.files[f].path, newPath);
            _files.push({oldName: f, newName: newName});
            _queries.push(`INSERT INTO subido SET usuario=${req.session?.user?.id || 0}, archivo='${newName}', fecha = NOW(), eliminado = 0`);
            cc++;
        }
        //console.log("ola mundo")
        //console.log(_queries.join(";"));
        connection.query(_queries.join(";"));
        res.json({status: 1, files: _files});
    }catch(err){
        console.log(err);
        res.json({status: 0, message: err});
    }
}
const sendNotification = async (req, res) =>{
    let t0 = performance.now();
    let fx = fechas.getNow();
    
    let noti = (await connection.aquery(`SELECT * FROM notificacion WHERE id='${req.fields.id}' LIMIT 1`)).result[0]
    let payload = {
        title: noti.titulo,
        body: noti.cuerpo,
        image: noti.imagen || "",
        url: noti.url,
        icon: "https://roqueperezhoy.com.ar/images/favicon.png",
    }
    let ar = (await connection.aquery(`SELECT * FROM reg_notificacion WHERE habilitado = 1`)).result
    ar.forEach(async reg=>{
        try{
            await webpush.sendNotification(JSON.parse(reg.token), JSON.stringify(payload));
        }catch(err){
            connection.query(`UPDATE reg_notificacion SET errores = CONCAT(errores, ';' ,${fx}) WHERE id='${reg.id}' LIMIT 1`)
        }
    });

    connection.query(`UPDATE notificacion SET fue_enviado=1, enviado = NOW() WHERE id='${req.fields.id}' LIMIT 1`);
    let t1 = performance.now();
    res.json({status: 1, time: (t1 - t0).toFixed(2) + "ms"});
}
const getIp = req => (req && req.headers['x-forwarded-for']) || (req && req.socket.remoteAddress);
const getPublicidad = (ar, incluir =[]) =>{
    if(Array.isArray(incluir) == false) incluir = [incluir]
    const ret = ar.filter(p=> incluir.includes(p.subtipo));
    return ret;
}
cachear();
cachearClima();
console.log("Ahora =>" + fechas.getNow());
module.exports = router