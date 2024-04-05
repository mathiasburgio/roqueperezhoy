const request = require("request");
const bcrypt = require("bcrypt");

module.exports.varificar_captcha = function(){
    return new Promise(resolve=>{
        const secret_key = "6LdJ4WQjAAAAANV9LSHnsrDJufK42iu6oWxEp16w";
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response}`;
        
        request(url, function(error, response, body) {
            body = JSON.parse(body);
            resolve( body.success );
        });
    })
}

module.exports.get_password_hash = async function(field_password){
    let salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(field_password, salt);
}

module.exports.compare_password_hash = async function(field_password, bd_password){
    return await bcrypt.compare(field_password, bd_password);
}

module.exports.uuid = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {  
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);  
        return v.toString(16);  
    });  
}
module.exports.guid = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {  
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);  
        return v.toString(16);  
    });  
}
module.exports.getRandom = function(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

module.exports.getUrl = (id, nombre) =>{
    nombre = nombre || "";
    nombre = nombre.toLowerCase().replaceAll("á", "a").replaceAll("é", "e").replaceAll("í", "i").replaceAll("ó", "o").replaceAll("ú", "u")
    return (id).toString() + "-" + nombre.replaceAll("[^A-Za-z0-9] ", "").replaceAll(" ", "-").replaceAll("'", "").replaceAll('"', "").replaceAll(',', "").replaceAll('.', "").replaceAll("%", "");
}

module.exports.onlyAlphanumeric = (str, noSpaces = false) =>{
    str = str.replaceAll("á", "a");
    str = str.replaceAll("é", "e");
    str = str.replaceAll("í", "i");
    str = str.replaceAll("ó", "o");
    str = str.replaceAll("ú", "u");
    str = str.replaceAll("Á", "a");
    str = str.replaceAll("É", "e");
    str = str.replaceAll("Í", "i");
    str = str.replaceAll("Ó", "o");
    str = str.replaceAll("Ú", "u");
    str = str.replaceAll("ñ", "n");
    str = str.replaceAll("Ñ", "n");
    str = str.replace(/[^a-z0-9 -]/gi, '').toLowerCase().trim();
    if(noSpaces){
        return str.replaceAll(" ", "-")
    }else{
        return str
    }
}

module.exports.str_to_bd = (str, withTags = false) =>{
    try{
        if(str == null || !str){ str = ""; }
        if(!str){return str;}
        str = ("" + str);
        if(withTags == false){
            str = str.replace(/</g, "");
            str = str.replace(/>/g, "");
            str = str.replace(/%3c/g, "");
            str = str.replace(/%3e/g, "");
            str = str.replace(/%3C/g, "");
            str = str.replace(/%3E/g, "");
        }else{
            str = str.replace(/</g, "_3@@");
            str = str.replace(/>/g, "_4@@");
        }
        
        str = str.replace(/'/g, "_1@@");
        str = str.replace(/"/g, "_2@@");
        str = encodeURI(str);
        return str;
    }catch(err){
        return str;
    }
}
module.exports.bd_to_str = (str, withTags = false) =>{
    if(str == null || !str){ str = ""; }
    try{
        if(!str){return str;}
        str = ("" + str);
        str = decodeURI(str);

        str = str.replace(/_1@@/g, "'");
        str = str.replace(/_2@@/g, '"');
        if(withTags === true){
            str = str.replace(/_3@@/g, "<");
            str = str.replace(/_4@@/g, '>');
        }
    }catch(ex){
        console.log(str, ex);
    }
    return str;
}