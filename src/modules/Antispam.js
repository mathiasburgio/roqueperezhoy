var buffer = [];
const limit = 10;
function validar(id, accion){
    let coincidencias = buffer.filter(item=>item.id === id && item.accion === accion);
    if(coincidencias.length > 50){ return false;}//evito el SOBRE-SPAM

    let time = new Date().getTime();
    buffer.push({
        id: id,
        accion: accion,
        time: time
    });
    let time_less_1_min = time - (1000 * 60);
    buffer = buffer.filter(item=>item.time > time_less_1_min);
    if(coincidencias.length > limit){ return false;}
    return true;
}

module.exports.validar = validar;