class FrontComercio{
    constructor(){
        this.datos = null
        this.mapa = null;
        this.favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]")
    }
    ini(){
        try{
            this.datos = JSON.parse(DATOS)
            this.mostrar_comercio(this.datos.poi)
            g.llenarMarquee(this.datos.marquesina.filter(m=>m.tipo_publicacion.indexOf("marquesina") >= 0))
            this.agregar_publicidades_laterales(this.datos.publicidades);
            this.agregar_comercios_abajo(this.datos.pois)
            if(this.datos.poi && this.favoritos.includes(this.datos.poi.id)){
                this.toggleFavorito(true, false);
            }

            $("button[name='favorito']").click(ev=>{
                let v = this.favoritos.includes(this.datos.poi.id);
                this.toggleFavorito(!v, true);
            });
            g.ahora(this.datos.ahora);
            g.closeCortina();
        }catch(ex){
            console.error(ex)
        }
    }
    mostrar_comercio(nx){
        if(!nx){
            $("#nota").html(`<div class='alert alert-warning h3'>Emprendimiento no encontrado</div>`)
            $("[name='share_facebook']").remove()
            $("[name='share_whatsapp']").remove()
            $("[name='share_twitter']").remove()
            return
        }
        nx.nombre = g.bd_to_str(nx.nombre)
        nx.detalle = g.bd_to_str(nx.detalle, true)
        nx.propietario = g.bd_to_str(nx.propietario)
        nx.direccion = g.bd_to_str(nx.direccion)

        let htmlImgs = ""
        nx.imagenes.forEach(img=>{
            if(img != "sin_imagen.jpg"){
                htmlImgs += `<div class="swiper-slide">
                                <img src="/images/subidas/${img}" class="img-169" alt="imagen de noticia" />
                            </div>`
            }
        });
        $("#swiper-principal .swiper-wrapper").html(htmlImgs)
        $("#swiper-principal").removeClass("d-none")

        let swiper = new Swiper("#swiper-principal", {
            grabCursor: true,
            pagination: {
                el: ".swiper-pagination",
                clickable: true
            },
            spaceBetween: 30,
            loop: true,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
        });

        $("#nota [name='nombre']").html(nx.nombre)
        $("#nota [name='detalle']").html(g.bd_to_str(nx.detalle, true))
        $("#nota [name='ubicacion'] span").html(nx.direccion || "???")
        $("#nota [name='propietario'] span").html(nx.propietario || "???")

        let fx = new Date();
        let ahora = fechas.getAhora().split(" ")[1];
        let dia = fx.getDay();

        if((nx.dias_horarios[dia][0] != "" && nx.dias_horarios[dia][0] <= ahora 
            && nx.dias_horarios[dia][1] != "" && nx.dias_horarios[dia][1] >= ahora)
            || (nx.dias_horarios[dia][2] != "" && nx.dias_horarios[dia][2] <= ahora 
            && nx.dias_horarios[dia][3] != "" && nx.dias_horarios[dia][3] >= ahora)){
                $("[name='ahora']").html("Ahora: abierto");
                $("[name='ahora']").addClass("badge-success").removeClass("badge-warning");
            }
        
        let todos_vacios = true;
        let solo_manana = true;
        nx.dias_horarios.forEach((dia, i)=>{
            if(dia[0] != "" && dia[1] != ""){
                todos_vacios = false;
                $("table tbody tr:eq(" + i + ") td:eq(1)").html("de " + dia[0] + " a " + dia[1]);
            }else{
                $("table tbody tr:eq(" + i + ")").addClass("d-none");
            }
            if(dia[2] != "" && dia[3] != ""){
                solo_manana = false;
                $("table tbody tr:eq(" + i + ") td:eq(2)").html("de " + dia[2] + " a " + dia[3]);
            }else{
                $("table tbody tr:eq(" + i + ") td:eq(2)").addClass("d-none");
            }
        });
        if(todos_vacios){
            $("#horarios").addClass("d-none");
            $("[name='horarios']").html("Sin aclarar");
        }
        if(solo_manana){
            $("[name='horarios'] thead").addClass("d-none");
            $("[name='horarios'] tbody tr td:eq(2)").addClass("d-none");
        }
        
        let _abierto = this.getEstadoAbierto(nx);
        if(_abierto == "abierto"){
            $("#nota [name='abierto'] span").html("Ahora: Abierto")
        }else if(_abierto == "???"){
            $("#nota [name='abierto'] span").addClass("d-none")
        }else if(_abierto == "cerrado"){
            $("#nota [name='abierto'] span").html("Ahora: Cerrado")
        }

        let contacto = "";
        nx.datos_de_contacto.forEach(item=>{
            if(item[0] == "Teléfono"){
                let aux = item[1].replaceAll(" ", "").replaceAll("+", "");
                contacto += `<a class='btn btn-block btn-light' target="_blank" href="tel:${aux}"><i class='fas fa-phone'></i> ${item[1]}</button>`
                
            } 
            if(item[0] == "Teléfono2"){
                let aux = item[1].replaceAll(" ", "").replaceAll("+", "");
                contacto += `<a class='btn btn-block btn-light' target="_blank" href="https://wa.me/?phone=${aux}"><i class='fab fa-whatsapp'></i> ${item[1]}</button>`
                
            } 
            if(item[0] == "Mail"){contacto += `<a class='btn btn-block btn-light' target="_blank" href="mailto:${item[1]}"><i class='fas fa-envelope'></i> ${item[1]}</button>`} 
            if(item[0] == "Web"){
                let short = item[1].replace("https://", "").replace("http://", "");
                let long = "https://" + short;
                contacto += `<a class='btn btn-block btn-light' target="_blank" href="${long}"><i class='fab fa-internet-explorer'></i> ${short}</button>`
                
            } 
            if(item[0] == "Facebook"){
                let short = item[1];
                if(short.at(-1) == "/"){short = short.substr(0, short.length-1);}
                if(short.split("/").length > 1){short = short.split("/").at(-1);}
                if(short.at(1) != "/"){short = "/" + short;}
                let long = "https://facebook.com" + short;
                contacto += `<a class='btn btn-block btn-light' target="_blank" href="${long}"><i class='fab fa-facebook'></i> ${short}</button>`
            }
            if(item[0] == "Instagram"){
                let short = item[1];
                if(short.at(-1) == "/"){short = short.substr(0, short.length-1);}
                if(short.split("/").length > 1){short = short.split("/").at(-1);}
                if(short.at(1) != "/"){short = "/" + short;}
                let long = "https://instagram.com" + short;
                contacto += `<a class='btn btn-block btn-light' target="_blank" href="${long}"><i class='fab fa-instagram'></i> ${short}</button>`
                
            } 
        });
        if(nx.publicidad){
            $("[name='datos_de_contacto']").html(contacto);
        }else{
            $("[name='datos_de_contacto']").html("Oculto...");
        }

        if(nx.geo && nx.geo.lat && nx.geo.lng){
            this.mapa = new google.maps.Map(document.querySelector("#mapa"), {
                center: { lat: nx.geo.lat, lng: nx.geo.lng },
                zoom: 15,
            });
            this.mapa.setOptions({ 
                styles: [
                    {
                        "featureType": "poi",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "on"
                            }
                        ]
                    },
                ]
            });
            let marker = new google.maps.Marker({
                position: nx.geo,
                map: this.mapa,
            });
        }else{
            $("#mapa").addClass("d-none");
        }
        
        if(nx.delivery === 1){
            $("#nota [name='delivery'] span").removeClass("badge-danger").addClass("badge-success").html("Si")
        }
        if(nx.take_away === 1){
            $("#nota [name='delivery'] span").removeClass("badge-danger").addClass("badge-success").html("Si")
        }

        let htmlCategorias = "";
        ["categoria_1", "categoria_2", "categoria_3"].forEach(c=>{
            let aux = nx[c];
            if(aux){
                htmlCategorias += `<span class='badge badge-primary mr-2'>${aux.nombre}</span>`
            }
        });
        $("#nota [name='categorias']").html(htmlCategorias)

        $("#nota [name='fecha']").html(fechas.parse({val: nx.ultima_actualizacion, formato: fechas.FORMATO.ARG_FECHA}))

        $("[name='share_facebook']").attr("href", "https://www.facebook.com/sharer.php?u=https://roqueperezhoy.com.ar/guia-comercial/comercio/" + nx.url);
        $("[name='share_whatsapp']").attr("href", "https://wa.me/?text=https://roqueperezhoy.com.ar/guia-comercial/comercio/" + nx.url);
        $("[name='share_twitter']").attr("href", "https://twitter.com/intent/tweet?text=comercio%20RoquePerezHoy&url=https://roqueperezhoy.com.ar/guia-comercia/comercio/" + nx.url);
    }
    agregar_publicidades_laterales(ar){
        let template = $("#publicidad").html();
        ar.forEach(p=>{
            if(p.pid < 20 || p.pid >= 40){//no muestro publicidades de comercios para no ser redundante
                $("[name='publicidades_laterales']").append(template)
                $("[name='publicidades_laterales'] a").last().attr("href", p.enlace);
                $("[name='publicidades_laterales'] img").last().attr("src", "/images/subidas/" + p.imagen);
            }
        })
    }
    agregar_comercios_abajo(ar){
        let template = $("#template_comercio").html();
        
        ar.forEach((nx, ind)=>{
            nx.nombre = g.bd_to_str(nx.nombre)
            nx.propietario = g.bd_to_str(nx.propietario)
            
            $("[name='otros-emprendimientos']").append(template);
            let card = $("[name='otros-emprendimientos'] .card").last();
            
            card.find("[name='imagen']").prop("src", "/images/subidas/" + nx.imagenes[0])
            card.find("[name='titulo']").html(nx.nombre)
            card.find("[name='titulo2']").html(nx.propietario)
            card.find("[name='categoria_1']").html(nx.categoria_1.nombre)
            card.find("[name='titulo1']").html(nx.nombre)
            card.find("[name='fecha']").html(fechas.parse({val: nx.fecha, formato: fechas.FORMATO.ARG_FECHA}))
            card.find("a").attr("href", "/guia-comercial/comercio/" + nx.url);
            if(nx.publicidad){
                card.find("[name='etiqueta']").removeClass("d-none")
                if([20,23].includes(nx.publicidad.pid)){
                    card.find("[name='etiqueta'] i").removeClass("text-warning").addClass("text-secondary")
                }else if([21,24].includes(nx.publicidad.pid)){
                    card.find("[name='etiqueta'] i").addClass("text-warning").removeClass("text-secondary")
                }
            }
            if(this.favoritos.includes(nx.id) == false) card.find("[name='favorito']").addClass("d-none")
            
            let _abierto = this.getEstadoAbierto(nx);
            if(_abierto == "abierto"){
                card.find("[name='abierto']").append("Abierto")
            }else if(_abierto == "???"){
                card.find("[name='abierto']").addClass("d-none")
            }else if(_abierto == "cerrado"){
                card.find("[name='abierto']").append("Cerrado")
            }
        })
    }
    toggleFavorito(estado, guardar){
        if(estado){
            $("button[name='favorito']").removeClass("btn-light").addClass("btn-danger")
            $("button[name='favorito'] i").addClass("text-light").removeClass("text-danger")
            if(guardar){
                this.favoritos.push(this.datos.poi.id);
                localStorage.setItem("favoritos", JSON.stringify(this.favoritos))
                g.toast("Agregado a favoritos!");
            }
        }else{
            $("button[name='favorito']").addClass("btn-light").removeClass("btn-danger")
            $("button[name='favorito'] i").removeClass("text-light").addClass("text-danger")
            if(guardar){
                this.favoritos = this.favoritos.filter(p=>p != this.datos.poi.id);
                localStorage.setItem("favoritos", JSON.stringify(this.favoritos))
                g.toast("Removido a favoritos!");
            }
        }
    }
    getEstadoAbierto(nx){
        let fx = fechas.parse({val: new Date()})
        let hora = fx.hora + ":" + fx.minuto;
        let dia = (new Date()).getDay();

        if((nx.dias_horarios[dia][0] <= hora && nx.dias_horarios[dia][1] >= hora) || (nx.dias_horarios[dia][2] <= hora && nx.dias_horarios[dia][3] >= hora)){
            return "abierto";
        }else if(nx.dias_horarios[dia].every(n=>n === "")){
            return "???";
        }else{
            return "cerrado";
        }
    }
}
