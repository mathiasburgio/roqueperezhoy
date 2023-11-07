class Globals{
    constructor(){
        this.bandera_menu = false;
        this.menu_open = false;
        this.bandera_buscador = false;
        this.buscador_open = false;
        this.mobile = (window.screen.width < 1024);
        this.menuSize = this.mobile ? "80vw" : "400px";
        this.isPwa = false;
        this._listados = null;
        this.PUBLIC_VAPID_KEY = "BNCPbvLknl6CwbrJu09bXCD6AJndiqN9RMp3h0qPS3bqT9t4fl9ql9GhUVGkpiQchrOPXOr9VTy_Y0EFSMuZJi8"
        $("#menu").css("width", this.menuSize).css("left", "-" + this.menuSize);
        $("#menu-backdrop>div").css("width", this.menuSize);//creditos
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isPwa = true;
        }

        if(this.mobile){
            $("#cortina img").css("width", "50vw");
            $("#container-marquee").removeClass("my-2");
        }
        $("#cortina img").removeClass("d-none");


        $("#btMenu").click(ev=>{
            this.toggleMenu();
        });

        $("#menu [name='btCerrarMenu']").click(ev=>{
            this.toggleMenu();
        });

        $("#menu-backdrop").click(ev=>{
            this.toggleMenu();
        });

        $("#menu li").click(ev=>{
            let href = $(ev.currentTarget).find("[href]");  
            console.log(href);
            if(href.length == 1){ window.location.href = href.attr("href"); }
            return false;
        });

        $("#menu [name='btCerrarSesion']").click(async ev=>{
            if(await modal.pregunta("¿Seguro de cerrar sesión?")){
                let ret = await this.exec("logout");
                window.location.href = "/";
            }
        });

        $("#btBuscador").click(ev=>{
            this.toggleBuscador();
        });

        $("[name='contactanos']").click(ev=>{
            if($("#menu-backdrop").hasClass("d-none") == false) $("[name='btCerrarMenu']").click(); 
            modal.mostrar({
                titulo: "Contactanos",
                cuerpo: $("#modal_contactanos").html(),
                botones: "volver"
            })
        });

        $("[name='emergencias']").click(ev=>{
            if($("#menu-backdrop").hasClass("d-none") == false) $("[name='btCerrarMenu']").click(); 
            modal.mostrar({
                titulo: "EMERGENCIAS",
                cuerpo: $("#modal_emergencias").html(),
                botones: "volver"
            })
        });

        this.suscription();

        //Verifica si esta en modo ADMIN
        if( window.location.href.indexOf("/admin_") > -1){
            //fuerzo a que el panel de admin use 12 columnas (quito la de publi)
            $("#container>.row>aside").remove();
            $("#container>.row>main").removeClass("col-md-9");
            $("#menu ul:eq(0)").addClass("d-none");
            $("#menu ul:eq(1)").removeClass("d-none");
        }else{
            $("#menu ul:eq(0)").removeClass("d-none");
            $("#menu ul:eq(1)").addClass("d-none");
        }
    }
    toggleMenu(){
        if(this.bandera_menu){return;}
        this.bandera_menu = true;

        if(this.menu_open){

            $("#menu").animate({
                left: parseInt($("#menu").css("width").replace("px", "")) * -1
            }, "fast",() =>{
                $("#menu-backdrop").addClass("d-none");
                this.bandera_menu = false;
                this.menu_open = false;
                $("body").removeClass("modal-open");
            });
        }else{
            $("#menu-backdrop").removeClass("d-none");
            $("#menu").animate({
                left: 0
            }, "fast",() =>{
                this.bandera_menu = false;
                this.menu_open = true;
                $("body").addClass("modal-open");
                
            });
        }
    }
    toggleBuscador(){
        if(this.bandera_buscador){return;}
        this.bandera_buscador = true;

        if(this.buscador_open){

            $("[name='txBuscar'").animate({
                right: "-50vw"
            }, "fast",() =>{
                this.bandera_buscador = false;
                this.buscador_open = false;
            });
        }else{
            $("[name='txBuscar'").animate({
                right: 0
            }, "fast",() =>{
                this.bandera_buscador = false;
                this.buscador_open = true;
            });
        }
    }
    closeCortina(){
        $("#container").removeClass("d-none");
        $("#cortina").animate({
            top: "-100vh",
            opacity: 0
        },()=>{
            $("#cortina").remove();
            //fuerza la suscripcion
            //this.suscription();
        });
    }
    str_to_bd(str, withTags = false){
        try{
            if(str == null){ str = ""; }
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
    bd_to_str(str, withTags = false){
        if(str == null){ str = ""; }
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
    onlyAlphanumeric(str, noSpaces = false){
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
    decimales(str, dec = 2){
        let separador_decimal = ",";
        let a = [];

        if(separador_decimal == "."){
            a = [".", ","];
        }else{
            a = [",", "."];
        }

        str = "" + str;
        str = str.replace(a[0], a[1]);
        if(str == ""){str = 0;}
        return  parseFloat( parseFloat(str).toFixed(dec) );
    }
    FD(obj){
        let fd = new FormData();
        for(let prop in obj){
            fd.append(prop, obj[prop]);
        }
        return fd;
    }
    getTextFromSelect($dom){
        return $dom[0].options[$dom[0].selectedIndex].text;
    }
    getUrl(id, nombre){
        nombre = nombre || "";
        nombre = nombre.toLowerCase().replaceAll("á", "a").replaceAll("é", "e").replaceAll("í", "i").replaceAll("ó", "o").replaceAll("ú", "u")
        return (id).toString() + "-" + nombre.replaceAll("[^A-Za-z0-9] ", "").replaceAll(" ", "-").replaceAll("'", "").replaceAll('"', "").replaceAll(',', "").replaceAll('.', "");
    }
    getOptions({ar, propText = "", propId = "id", optionDisabled = false}){
        let html = "";
        ar.forEach(item=>{
            if(typeof item == "object"){
                html += `<option value='${item[propId]}'>${item[propText]}</option>`;
            }else{
                html += `<option value='${item}'>${item}</option>`;
            }
        });
        if(optionDisabled){html = `<option value="0" disabled selected>Seleccionar</option>` + html}
        return html;
    }
    exec(_function, obj = {}){
        return new Promise(resolve=>{
            //console.log(query);
            let fd = new FormData();
            fd.append("function", _function);
            for(let prop in obj){
                fd.append(prop, obj[prop]);
            }
            $.post({
                url: "/exec",
                data: fd,
                cache: false,
                contentType: false,
                processData: false,
            }).done(ret=>{
                try{
                    if(ret && typeof ret == "string"){ ret = JSON.parse(ret); }
                }catch(ex){
                    console.log(ret);
                }
                resolve(ret);
            });
        });
    }
    safeQuery(obj){
        return new Promise(resolve=>{
            let fd = new FormData();
            for(let prop in obj){
                fd.append(prop, obj[prop]);
            }
            $.post({
                url: "/safeQuery",
                data: fd,
                cache: false,
                contentType: false,
                processData: false,
            }).done(ret=>{
                try{
                    if(ret && typeof ret == "string"){ ret = JSON.parse(ret); }
                }catch(ex){
                    console.log(ret);
                }
                resolve(ret);
            });
        });
    }
    unsafeQuery(obj){
        return new Promise(resolve=>{
            let fd = new FormData();
            for(let prop in obj){
                fd.append(prop, obj[prop]);
            }
            $.post({
                url: "/unsafeQuery",
                data: fd,
                cache: false,
                contentType: false,
                processData: false,
            }).done(ret=>{
                try{
                    if(ret && typeof ret == "string"){ ret = JSON.parse(ret); }
                }catch(ex){
                    console.log(ret);
                }
                resolve(ret);
            });
        });
    }
    uploadFile(nombre, archivo, aux = null, url = "/upload"){
        return new Promise(resolve=>{
            let fd = new FormData();
            fd.append(nombre, archivo);
            if(typeof aux != null){
                for(let prop in aux){
                    fd.append(prop, aux[prop]);
                }
            }
            $.post({
                url: url,
                data: fd,
                cache: false,
                contentType: false,
                processData: false,
            }).always(ret=>{
                console.log(ret);
                resolve( ret.files[0].newName );
            });
        });
    }
    getTableFromArrayOfObjects({ar, propId, structure, tipo = "tabla", classes = "", headerClasses = "", striped = true}){
        //structure = array of {prop, label, right, fn, width, classes}
        let thead = "";
        if(tipo == "tabla"){
            thead +=`<tr class="table-info">`;
            structure.forEach(item=>{
                thead += `<th class='${(item.right ? "text-right" : "")} ${item.width || ""} ${headerClasses || ""}'>${item.label}</th>`;
            });
            thead +=`</tr>`;
        }else if(tipo == "grid"){
            thead +=`<div class="row table-info">`;
            structure.forEach(item=>{
                thead += `<div class='${(item.right ? "text-right" : "")} ${item.width || ""} ${headerClasses || ""}'>${item.label}</div>`;
            });
            thead +=`</div>`;
        }else if(tipo == "flex"){
            thead +=`<div class="d-flex flex-row table-info">`;
            structure.forEach(item=>{
                thead += `<div class='${(item.right ? "text-right" : "")} ${item.width || ""} ${headerClasses || ""}'>${item.label}</div>`;
            });
            thead +=`</div>`;
        }
        
        let tbody = "";
        let _striped = true;
        ar.forEach((element, index)=>{
            
            if(tipo == "tabla"){
                tbody += `<tr idd="${propId ? element[propId] : -1}" ind="${index}">`;
                structure.forEach(item=>{
                    if(item.fn){
                        tbody += `<td class='${striped && _striped ? "bg-eee2" : ""} ${(item.right ? "text-right" : "")} ${item.width || ""} ${item.classes || ""} ${classes || ""}' prop="${item.prop || ""}">${item.fn(element, index)}</td>`;
                    }else{
                        tbody += `<td class='${striped && _striped ? "bg-eee2" : ""} ${(item.right ? "text-right" : "")} ${item.width || ""} ${item.classes || ""} ${classes || ""}' prop="${item.prop || ""}">${element[item.prop]}</td>`;
                    }
                });
                tbody += `</tr>`;
            }else if(tipo == "grid"){
                tbody += `<div class="row" idd="${propId ? element[propId] : -1}" ind="${index}">`;
                structure.forEach(item=>{
                    if(item.fn){
                        tbody += `<div class='${striped && _striped ? "bg-eee2" : ""} ${(item.right ? "text-right" : "")} ${item.width || ""} ${item.classes || ""} ${classes || ""}' prop="${item.prop || ""}">${item.fn(element, index)}</div>`;
                    }else{
                        tbody += `<div class='${striped && _striped ? "bg-eee2" : ""} ${(item.right ? "text-right" : "")} ${item.width || ""} ${item.classes || ""} ${classes || ""}' prop="${item.prop || ""}">${element[item.prop]}</div>`;
                    }
                });
                tbody += `</div>`;
            }else if(tipo == "flex"){
                tbody += `<div class="d-flex flex-row" idd="${propId ? element[propId] : -1}" ind="${index}">`;
                structure.forEach(item=>{
                    if(item.fn){
                        tbody += `<div class='${striped && _striped ? "bg-eee2" : ""} ${(item.right ? "text-right" : "")} ${item.width || ""} ${item.classes || ""} ${classes || ""}' prop="${item.prop || ""}">${item.fn(element, index)}</div>`;
                    }else{
                        tbody += `<div class='${striped && _striped ? "bg-eee2" : ""} ${(item.right ? "text-right" : "")} ${item.width || ""} ${item.classes || ""} ${classes || ""}' prop="${item.prop || ""}">${element[item.prop]}</div>`;
                    }
                });
                tbody += `</div>`;
            }
            
            _striped = !_striped;
        });

        if(tipo == "tabla"){
            return `<table class='table table-sm border'>
                    <thead>${thead}</thead>
                    <tbody>${tbody}</tbody>
                    <tfoot></tfoot>
                </table>`;
        }else if(tipo == "grid"){
            return thead + tbody;
        }else if(tipo == "flex"){
            return thead + tbody;
        }
    }
    marquee(selector, speed) {
        const parentSelector = document.querySelector(selector);
        const clone = parentSelector.innerHTML;
        const firstElement = parentSelector.children[0];
        let i = 0;
        parentSelector.insertAdjacentHTML('beforeend', clone);
        parentSelector.insertAdjacentHTML('beforeend', clone);
      
        setInterval(function () {
            firstElement.style.marginLeft = `-${i}px`;
            if (i > firstElement.clientWidth) {
                i = 0;
            }
            i = i + speed;
        }, 0);
    }
    marqueeV2(queryselector, text, speed, loop){
        var Selector = document.querySelector(queryselector);
        document.querySelector(queryselector).innerHTML = text;
    
        var SceenWidth = screen.width;
        var SelectorWidth = Selector.offsetWidth;
        var Sw=SceenWidth, step=1;
    
        Selector.style.left = SceenWidth + 'px';
    
        var sIntv = setInterval(() => {
            Sw = Sw - speed;
            Selector.style.left = `${Sw}px`;
    
            if (Sw <= -(SelectorWidth)) {
                Sw=SceenWidth;
                Selector.style.left = SceenWidth + 'px';
                (loop==0)?null:(step>= loop)?clearInterval(sIntv):step=1;step++;
            }
        }, 0);
    }
    async llenarMarquee(ar){
        if(!ar || ar.length == 0) ar = [{color: "text-primary", icono: "fas fa-newspaper", texto: "<b>roqueperezhoy.com.ar</b> el sitio de noticias N°1 de Roque Pérez"}];
        
        let dolar = await this.getDolar(true);
        if(dolar) ar = ar.concat(dolar);
        let clima = this.getClima();
        if(clima) ar = ar.concat(clima);
        
        console.log(ar)
        let html = "";
        ar.forEach(item=>{
            item.texto = this.bd_to_str(item.texto)
            html += `<a href="${item.enlace || "#"}" style="text-wrap:nowrap; white-space: nowrap;" class='${item.color} px-2 ml-4'>
                <i class='${item.icono} ml-2'></i>
                <span>${item.texto}</span>
            </a>`;
        });
        $("#container-marquee").removeClass("d-none")
        $("#container-marquee").html("<div>" + html + "</div>")
        g.marquee("#container-marquee", 0.2);
        //$("#container-marquee").html(html);
    }
    async cargar_listados(pois = true, noticias = true, eventos = true){
        if(!this._listados) this._listados = {};

        if(pois){
            this._listados.pois = (await g.safeQuery({q: "Pois.selectAll"})).result;
            this._listados.pois.forEach(p=>{
                p.nombre = g.bd_to_str(p.nombre)
                if(p.propietario) p.propietario = g.bd_to_str(p.propietario)
                if(p.detalle) p.detalle = g.bd_to_str(p.detalle, true)
                p.imagenes = JSON.parse(p.imagenes)
            });
        }

        if(noticias){
            this._listados.noticias = (await g.safeQuery({q: "Noticias.selectAll"})).result;
            this._listados.noticias.forEach(p=>{
                p.titulo = g.bd_to_str(p.titulo)
                if(p.bajada) p.bajada = g.bd_to_str(p.bajada, true)
                p.imagenes = JSON.parse(p.imagenes)
            });
        }

        if(eventos){
            this._listados.eventos = (await g.safeQuery({q: "Eventos.selectLast100"})).result;
            this._listados.eventos.forEach(p=>{
                p.nombre = g.bd_to_str(p.nombre)
                if(p.detalle) p.detalle = g.bd_to_str(p.detalle, true)
                p.imagenes = JSON.parse(p.imagenes)
            });
        }

        return true;
    }
    async seleccionarObjeto(lista, prop, cb){
        if(!this._listados) await this.cargar_listados();
        
        if(lista === "pois") lista = this._listados.pois
        else if(lista === "eventos") lista = this._listados.eventos
        else if(lista === "noticias") lista = this._listados.noticias

        let fnFiltrar = (p) =>{
            p = p.toLowerCase();
            
            let html = "";
            let cc = 0;
            lista.forEach(px=>{
                if((p == "" || px[prop].toLowerCase().indexOf(p) > -1) && cc < 20){
                    html += `<tr idd="${px.id}"><td>${px[prop]}</td></tr>`;
                    cc++;
                }
            });

            $("#modal table tbody").html( html );
                
            $("#modal table tbody tr").click(ev=>{
                let idd = parseInt( $(ev.currentTarget).attr("idd") );
                let px = lista.find(px=>px.id === idd);
                cb(px);
                modal.ocultar();
            });
        }
        
        let foo = `<input type='search' class="form-control mb-3" placeholder="Buscar...">
                    <div class="border">
                        <table class='table table-sm mb-0'>
                            <tbody></tbody>
                        </table>
                    </div>`;

        modal.mostrar({
            titulo: "Seleccionar",
            cuerpo: foo,
            fnMostrar2: () =>{ $("#modal [type='search']").change(); },
            botones: "volver"
        });

        $("#modal [type='search']").change(ev=>{
            let v = $(ev.currentTarget).val();
            fnFiltrar(v);
        }).keyup(ev=>{
            if(ev.keyCode == 13){
                let v = $(ev.currentTarget).val();
                fnFiltrar(v);
            }
        });
    }
    setMarquesina(lista){
        let html = "";
        lista.forEach(item=>{
            html += `<a class="mx-2 cp" href="${item.href || "#"} text-${item.color || "dark"}"><i class="fas fa-${item.icono || "circle"}"></i> ${item.texto}</a>`
        });
        $("marquee").append(html);
    }
    async timeout(ms){
        return new Promise(resolve=>{
            setTimeout(()=>{
                resolve(true);
            }, ms);
        });
    }

    async suscription(){
        const urlBase64ToUint8Array = (base64String) => {
            const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
            const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
          
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
          
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }
          

        const register = await navigator.serviceWorker.register("/worker.js",{
            scope: "/"
        })
        //console.log(this.PUBLIC_VAPID_KEY, urlBase64ToUint8Array(this.PUBLIC_VAPID_KEY))
        const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(this.PUBLIC_VAPID_KEY)
        });
        //console.log(subscription);
        await fetch("/subscription",{
            method: "POST",
            body: JSON.stringify(subscription),
            headers: {
                "Content-Type": "application/json"
            }
        })
    }

    stripTags(str){
        return str.replace(/(<([^>]+)>)/gi, "");
    }
    toast(str){
        $(".toast-body").html(str);
        $("#toast").toast("show");
        let s = new Audio();
        s.src = "/resources/sound_noti2.mp3"
        s.play();
    }
    getParams(){
        let u = window.location.href;
        u = u.split("#")[0];
        let aux = u.split("?");
        if(aux.length != 2) return
        let params = {};
        aux[1].split("&").forEach(px=>{
            let aux2 = px.split("=")
            if(aux2.length == 2){
                params[aux2[0]] = aux2[1]
            }
        });
        return params
    }
    ahora(hx){
        return false;//por ahora deshabilitado
        let alertas = JSON.parse(localStorage.getItem("alertas") || "[]")
        if(hx && hx.activo === 1 && alertas.includes(hx.idd) === false){
            let d = $("[alert-id]");
            d.attr("alert-id", hx.idd);
            d.addClass(hx.color);
            d.find(".alert-body").html(this.bd_to_str(hx.texto));
            d.removeClass("d-none");
            if(hx.url && hx.url != "#"){
                d.attr("href", hx.url);
                d.attr("taget", "_blank")
            }
            d.find("button").click(()=>{
                alertas.push(hx.idd)
                localStorage.setItem("alertas", JSON.stringify(alertas))
            });
        }
    }
    waitCKEDITOR(queryString, aux, version = 1){
        return new Promise(resolve=>{
            let cc = 10;
            let ret = CKEDITOR.replace( queryString, aux );
            if(version === 1){
                CKEDITOR.on('instanceReady', function(){ 
                    resolve(ret)    
                }); 
            }else if(version == 2){
                let t = setInterval(()=>{
                    if(typeof ret != "undefined" && ret.applicationTitle){
                        clearInterval(t);
                        resolve(ret);
                    }
                    if(--cc < 0){
                        clearInterval(t)
                        throw "Timeout para cargar CKEDITOR";
                    }
                },1500);
            }
        })
    }
    async getDolar(getForMarquee = true){
        try{
            let ret = await $.get({
                url: "https://dolarapi.com/v1/dolares",
                timeout: 2000
            });
            let oficial = ret.find(d=>d.casa == "oficial");
            let blue = ret.find(d=>d.casa == "blue");
            if(oficial && blue && getForMarquee == true){
                let ar = [];
                ar.push({color: "bg-primary text-white", icono: "fas fa-dollar-sign", texto: `Dolar oficial ${oficial.compra} / ${oficial.venta}`});
                ar.push({color: "bg-primary text-white", icono: "fas fa-dollar-sign", texto: `Dolar blue ${blue.compra} / ${blue.venta}`})
                return ar;
            }else{
                return ret;
            }    
        }catch(err){
            console.log("Error al obtener dolar->", err.toString());
            return null;
        }
    }
    getClima(){
        let _datos = DATOS && typeof DATOS == "string" ? JSON.parse(DATOS) : null;
        if(_datos?.clima){
            let clima = _datos.clima;
            return [{color: "bg-primary text-white", icono: "fas fa-sun", texto: `Clima Temp ${clima.ahora.temperature}º  (min ${clima.hoy.temperature_min}º / max ${clima.hoy.temperature_max}º)`}]
        }else{
            return null;
        }
    }
    tryImgCover($img){
        let ret = this.cercania169($img[0].width, $img[0].height);
        if(ret.cercania_16_9 > 90){
            $img.css("object-fit", "cover");
        }
    }
    cercania169(imageWidth, imageHeight) {
        // Calcula el aspect ratio de la imagen
        const aspectRatio = imageWidth / imageHeight;
        
        // Calcula las diferencias entre los aspect ratios
        const diferencia_16_9 = Math.abs(aspectRatio - (16 / 9));
        const diferencia_9_16 = Math.abs(aspectRatio - (9 / 16));
        
        // Calcula el porcentaje de cercanía
        const cercania_16_9 = (1 - diferencia_16_9) * 100;
        const cercania_9_16 = (1 - diferencia_9_16) * 100;
        
        // Devuelve un objeto con la cercanía a ambos aspect ratios
        return {
            cercania_16_9,
            cercania_9_16
        };
    }
    subirImagenV2(){
        modal.mostrar({
            titulo: "Subir foto v2",
            tamano: "modal-xl",
            cuerpo: `<iframe src="/editor-imagen.html" style="width:100%; height: 500px; border:none" />`,
            botones: "volver"
        });
    }
}