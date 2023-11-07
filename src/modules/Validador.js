class Validador{
    constructor(){
        this.FORMATO = {
            STRING: 1,
            INT: 2,
            MAIL: 3,
            EMAIL: 3,
            DATE: 4,
            IMAGE: 5,
            STRING_V2: 6
        };
    }
    validar(val, formato, min = false, max = false){
        if(formato ===  this.FORMATO.STRING){
            if(typeof val != "string"){return "Tipo " + typeof val + ", se esperaba string";}
            if(min !== false && val.length < min){return "Mínimo " + min;}
            if(max !== false && val.length > max){return "Máximo " + max;}
        }else if(formato === this.FORMATO.INT){
            if(typeof val != "number"){return "Tipo " + typeof val + ", se esperaba number";}
            if(min !== false && val < min){return "Mínimo " + min;}
            if(max !== false && val > max){return "Máximo " + max;}
        }else if(formato === this.FORMATO.MAIL || formato === this.FORMATO.EMAIL){
            let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            if(typeof val != "string"){return "Tipo " + typeof val + ", se esperaba string (mail)";}
            if(val.match(emailFormat) !== true){return "Formato de email no válido.";}
        }else if(formato === this.FORMATO.DATE){
            let dateFormat = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/;
            if(typeof val != "string"){return "Tipo " + typeof val + ", se esperaba string (date)";}
            if(val.match(dateFormat) !== true){return "Formato de fecha no válido.";}
        }else if(formato === this.FORMATO.IMAGE){
            let imageFormat = /^[a-zA-Z0-9\-_]{4,30}.(jpg|jpeg|png)$/;
            if(typeof val != "string"){return "Tipo " + typeof val + ", se esperaba string (imagen file)";}
            if(val.match(imageFormat) !== true){return "Formato de imagen no válido.";}
        }else if(formato === this.FORMATO.STRING_V2){
            let stringV2 = /^[a-zA-Z0-9-.]+$/;
            if(val.match(stringV2) !== true){return "Formato no válido.";}
            if(min !== false && val < min){return "Mínimo " + min;}
            if(max !== false && val > max){return "Máximo " + max;}
        }
        return true;
    }
}

if(typeof module != "undefined"){
    let v = new Validador();
    module.exports = v;
}
