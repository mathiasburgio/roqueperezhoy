const CATEGORIAS_POIS = [
	{id : 1, nombre : "Parque, turismo", tags : ["parque", "turismo", "playa", "plaza", "playon", "placita", "descanso", "monumento", "historico", "historia"]},
	{id : 2, nombre : "Despensa, supermercado", tags : ["despensa", "supermercado", "mercado", "bebida", "alimento", "comida"]},
	{id : 3, nombre : "Heladería", tags : ["heladeria", "helado", "bebida", "comida"]},
	{id : 4, nombre : "Panadería", tags : ["panaderia", "pan", "factura", "sanguche", "sandwich", "torta", "pastel", "comida"]},
	{id : 5, nombre : "Carnicería, verdulería", tags : ["carniceria", "verduleria", "carne", "pollo", "polleria", "pollajeria", "verdura", "comida"]},
	{id : 6, nombre : "Transporte", tags : ["transporte", "remis", "remises", "colectivo", "bondi", "tren", "avion", "trenes", "aviones", "taxi", "subte"]},
	{id : 7, nombre : "Banco, pago de servicio", tags : ["banco", "pago", "pago facil", "rapipago", "rapi pago", "bapro"]},
	{id : 8, nombre : "Hospedaje, hotel, camping", tags : ["hospedaje", "hotel", "camping", "acamptar", "hostel", "hostal"]},
	{id : 9, nombre : "Comercio", tags : ["comercio"]},
	{id : 10, nombre : "Salud, farmacia, hospital", tags : ["salud", "farmacia", "sanatorio", "hosptital", "clinica"]},
	{id : 11, nombre : "Indumentaria, calzado", tags : ["indumentaria", "calzado", "ropa", "zapatilla", "remera", "camisa", "jean", "cartera", "vestido"]},
	{id : 12, nombre : "Cuidado personal", tags : ["cuidado personal", "pedicura", "manicura", "peluqueria", "peluquero", "tintura", "tatuaje", "piercing"]},
	{id : 13, nombre : "Religión", tags : ["religion", "iglesia"]},
	{id : 14, nombre : "Fitness", tags : ["fitness", "gimnasio", "yoga", "kick boxing", "kickboxing", "pilates"]},
	{id : 15, nombre : "Telefonía, informática", tags : ["telefonia", "telefono", "informatica", "computadora", "mantenimiento", "repuestos", "telefono", "movistar", "claro", "samsung", "iphone"]},
	{id : 16, nombre : "Educación", tags : ["educacion", "colegio", "escuela", "jardin", "instituto", "jardines", "profesor", "maestro", "maestra", "universidad", "pedagocio", "pedagogia"]},
	{id : 17, nombre : "Comida, resto, bar, rotisería", tags : ["restaurant", "restaurante", "bar", "resto", "comida", "rotiseria", "pub"]},
	{id : 18, nombre : "Nocturno, boliche, pub", tags : ["nocturno", "boliche", "disco", "discoteca", "noche", "pub", "bar"]},
	{id : 19, nombre : "Vehículo, service, repuestos", tags : ["vehiculo", "auto", "camion", "moto", "cuatriciclo", "manteminiento", "tecnico", "mecanico"]},
	{id : 20, nombre : "Estacion de servicio", tags : ["estacion de servicio", "ypf", "esso", "oil", "combustible", "aceite"]},
	{id : 21, nombre : "Mascota", tags : ["mascota", "veterinario", "veterinaria", "perro", "gato"]},
	{id : 22, nombre : "Estacionamiento", tags : ["estacionamiento", "parking"]},
	{id : 23, nombre : "Otro", tags : ["otros"]},
	{id : 24, nombre : "Profesional", tags : ["profesional"]},
	{id : 25, nombre : "Servicio público", tags : ["servicio publico", "publico"]},
	{id : 26, nombre : "Kiosco, librería", tags : ["kiosco", "libreria"]},
	{id : 27, nombre : "Cultura, arte, música, teatro, cine", tags : ["cine", "arte", "musica", "teatro", "cultura"]},
	{id : 28, nombre : "Deporte, club, cancha", tags : ["deporte", "club", "cancha"]},
	{id : 29, nombre : "Hogar, construcción", tags : ["hogar", "construccion", "plomero", "electrisista", "gasista", "mueble", "cocina", "baño", "dormitorio"]},
	{id : 30, nombre : "Terapia alternativa, vida sana", tags : ["terapia alternativa", "terapias alternativas", "yoga"]},
	{id : 31, nombre : "Servicio privado", tags : ["servicio privado", "servicios privados", "privado"]},
	{id : 32, nombre : "Rural, agricultura, ganaderia", tags : ["rural", "agricultura", "ganaderia", "semillas", "campo"]},
	{id : 33, nombre : "Comunicación, periodismo", tags : ["comunicacion", "periodismo", "radio", "tv", "television", "diario", "revista"]}
];
const CATEGORIAS_NOTICIAS = [
    {id: 2, label: "Política", limpio: "politica"}, 
    {id: 3, label: "Deporte", limpio: "deporte"}, 
    {id: 4, label: "Cultura", limpio: "cultura"}, 
    {id: 5, label: "Interes general", limpio: "interes-general"}, 
    {id: 6, label: "Actualidad", limpio: "actualidad"}, 
    {id: 7, label: "Comunidad", limpio: "comunidad"}, 
    {id: 8, label: "Sociales", limpio: "sociales"},     
];

const CATEGORIAS_EVENTOS = [
    {id: 2, label: "Fiesta pública", limpio: "fiesta-publica"},    
    {id: 3, label: "Recital", limpio: "recital"},    
    {id: 4, label: "Cultura", limpio: "culura"},    
];

const TIPOS_CONTACTO = [
    {tipo: "Teléfono", label: "Teléfono", prefijo: "tel:"},
    {tipo: "Teléfono2", label: "Whatsapp", prefijo: "https://wa.me/"},
    {tipo: "Mail", label: "Mail", prefijo: "mailto:"},
    {tipo: "Web", label: "Sitio web", prefijo: ""},
    {tipo: "Facebook", label: "Facebook", prefijo: ""},
    {tipo: "Intagram", label: "Instagram", prefijo: ""},
]

const DIAS_SEMANA = [
    {label: "Lun a Vie", val: "1,5"},
    {label: "Lun a Sab", val: "1,6"},
    {label: "Dom", val: "0"},
    {label: "Lun", val: "1"},
    {label: "Mar", val: "2"},
    {label: "Mie", val: "3"},
    {label: "Jue", val: "4"},
    {label: "Vie", val: "5"},
    {label: "Sab", val: "6"},
];

const SIGNOS_ZODIACO = [
    {id: 1, nombre: "aries", nombre2: "Aries", name: "aries", desde: "21-03", hasta: "20-04", planeta: "Marte"},
    {id: 2, nombre: "tauro", nombre2: "Tauro", name: "taurus", desde: "21-04", hasta: "21-05", planeta: "Venus"},
    {id: 3, nombre: "geminis", nombre2: "Géminis", name: "gemini", desde: "22-05", hasta: "21-06", planeta: "Mercurio"},
    {id: 4, nombre: "cancer", nombre2: "Cancer", name: "cancer", desde: "22-06", hasta: "23-07", planeta: "Luna"},
    {id: 5, nombre: "leo", nombre2: "Leo", name: "leo", desde: "24-07", hasta: "23-08", planeta: "Sol"},
    {id: 6, nombre: "virgo", nombre2: "Virgo", name: "virgo", desde: "24-08", hasta: "22-09", planeta: "Mercurio"},
    {id: 7, nombre: "libra", nombre2: "Libra", name: "libra", desde: "23-09", hasta: "22-10", planeta: "Venus"},
    {id: 8, nombre: "escorpio", nombre2: "Escorpio", name: "scorpio", desde: "23-10", hasta: "22-11", planeta: "Pluton"},
    {id: 9, nombre: "sagitario", nombre2: "Sagitario", name: "sagittarius", desde: "23-11", hasta: "21-12", planeta: "Júpiter"},
    {id: 10, nombre: "capricornio", nombre2: "Capricornio", name: "capricorn", desde: "22-12", hasta: "19-01", planeta: "Saturno"},
    {id: 11, nombre: "acuario", nombre2: "Acuario", name: "aquarius", desde: "20-01", hasta: "19-02", planeta: "Urano"},
    {id: 12, nombre: "piscis", nombre2: "Piscis", name: "pisces", desde: "20-02", hasta: "20-03", planeta: "Neptuno"},
];
const POIS_TRANSPORTES = [
    10,11
];
const POIS_FARMACIAS = [
    18,19,20,21,22,23
];
const PUBLICIDADES = [
    //menor numero = mayor prioridad
    {id: 2, prioridad: 1, grupo: "evento", nombre: "EVENTO_SIMPLE", precio: 1000, duracion: 7},//muestra precio, NO aparece en barra lateral
    {id: 3, prioridad: 1, grupo: "evento", nombre: "EVENTO_FULL", compartir: 1, precio: 1500, duracion: 7},//muestra precio, aparece en barra lateral con mayor prioridad, aparece en intermedio noticias
    
    {id: 20, prioridad: 3, grupo: "poi", nombre: "POI_DESTACADA", precio: 1000, duracion: 7},//muestra los datos de contacto, esta 2da en orden
    {id: 21, prioridad: 2, grupo: "poi", nombre: "POI_PREMIUM", compartir: 1, precio: 1500, duracion: 7},//muestra los datos de contacto esta 1ra en orden, aparece en barra lateral
    {id: 22, prioridad: 1, grupo: "poi", nombre: "POI_PREMIUM PLUS (PROXIMAMENTE)", compartir: 0, precio: 0, duracion: 0},//proximamente, mayor exposicion, asegura mostrarse entre las 1ras laterales
    {id: 23, prioridad: 2, grupo: "poi", nombre: "POI_PRUEBA_GRATIS_DESTACADA", precio: 0, duracion: 7},
    {id: 24, prioridad: 1, grupo: "poi", nombre: "POI_PRUEBA_GRATIS_PREMIUM", compartir: 1, precio: 0, duracion: 7},

    {id: 40, prioridad: 1, grupo: "otra", nombre: "OTRA_lateral", precio: 1000, duracion: 7},//aparece al costado en los listados (si es pantalla chica aparece abajo 1ro)
    {id: 41, prioridad: 1, grupo: "otra", nombre: "OTRA_lateral + redes", compartir: 1, precio: 1500, duracion: 7},//aparece en medio de los listados y la noticia
    {id: 42, prioridad: 1, grupo: "otra", nombre: "OTRA_lateral PLUS", precio: 1500, duracion: 7},//aparece al costado en los listados + aparece intermedia entre noticias
    {id: 43, prioridad: 1, grupo: "otra", nombre: "OTRA_lateral PLUS + redes", compartir: 1, precio: 1000, duracion: 7},
];

if(typeof module != "undefined"){
    module.exports.CATEGORIAS_POIS = CATEGORIAS_POIS;
    module.exports.CATEGORIAS_NOTICIAS = CATEGORIAS_NOTICIAS;
    module.exports.CATEGORIAS_EVENTOS = CATEGORIAS_EVENTOS;
    module.exports.SIGNOS_ZODIACO = SIGNOS_ZODIACO;
    module.exports.POIS_TRANSPORTES = POIS_TRANSPORTES;
    module.exports.POIS_FARMACIAS = POIS_FARMACIAS;
    module.exports.PUBLICIDADES = PUBLICIDADES;
    module.exports.DIAS_SEMANA = DIAS_SEMANA;
    module.exports.TIPOS_CONTACTO = TIPOS_CONTACTO;
}