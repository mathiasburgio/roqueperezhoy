const http = require("http");//necesario para SSL
const https = require("https");
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const formidableMiddleware = require("express-formidable");
const session = require("express-session");
const FileStore = require('session-file-store')(session);
const cors = require("cors");
const morgan = require("morgan")
const favicon = require('serve-favicon')
require('dotenv').config({path:'./.env'});

//console.log(process.env);

var fileStoreOptions = {
    //ttl: 3600 * 24 * 365 * 5//en seg def 3600 = 1hora
};

//middlewares
if(process.env.NODE_ENV != 'deploy') app.use(morgan("dev"))
app.use(formidableMiddleware())
//SESIONES
app.use(session({
    secret: 'roque-perez-hoy-victoria-secret',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge : (1000 * 60 * 60 * 24 * 365),//la sesion dura 365 dias
        secure : false // true ssl
    },
    store: new FileStore(fileStoreOptions)
}));
//redirecciona HTTPS
app.use(function(request, response, next) {
    if (process.env.NODE_ENV != 'development' && !request.secure) {
       return response.redirect("https://" + request.headers.host + request.url);
    }
    next();
})

app.use(favicon(path.join(__dirname, 'src', 'public', 'favicon.ico')))
app.use(require("./src/routes.js"))



app.set("view engine", "ejs");
app.set("views", __dirname + "/src/views/");

//static content
app.use("/scripts", express.static(__dirname + "/src/public/scripts"));
app.use("/resources", express.static(__dirname + "/src/public/resources"));
app.use("/images", express.static(__dirname + "/src/public/images"));
app.use("/styles", express.static(__dirname + "/src/public/styles"));

const privateKey  = process.env.NODE_ENV != 'development' ? fs.readFileSync(__dirname + '/roqueperezhoy.com.ar.key', 'utf8') : null;
const certificate = process.env.NODE_ENV != 'development' ? fs.readFileSync(__dirname + '/roqueperezhoy.com.ar.crt', 'utf8') : null;

const httpServer = http.createServer(app);
const httpsServer = process.env.NODE_ENV != 'development' ? https.createServer({key : privateKey, cert : certificate}, app) : null;

//INICIA el servidor
if(process.env.NODE_ENV == "deploy"){
    httpServer.listen(80);
    httpsServer.listen(443);
    console.log("Start server");
}else{
    httpServer.listen(3000);
    console.log("Escuchando: http://localhost:3000");
    console.log("Escuchando: http://localhost:3000/login");
}