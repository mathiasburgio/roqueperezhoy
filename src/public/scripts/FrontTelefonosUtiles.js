class FrontTelefonosUtiles{
    constructor(){
        this.datos = null
    }
    ini(){
        try{
            this.datos = JSON.parse(DATOS)
            this.agregar_publicaciones(this.datos.contactos)
            g.llenarMarquee(this.datos.marquesina.filter(m=>m.tipo_publicacion.indexOf("marquesina") >= 0))
            this.agregar_publicidades_laterales(this.datos.publicidades)
            this.agregar_otras_noticias(this.datos.noticias);
            
            
            $("[name='txBuscar']").keyup(ev=>{
                let v = $(ev.currentTarget).val().toString().toLowerCase();
                if(ev.keyCode == 13 || v == ""){
                    let ar = this.datos.contactos.filter(c=>{
                        if(g.bd_to_str(c.nombre).toLowerCase().indexOf(v) > -1) return c; 
                    });
                    this.agregar_publicaciones(ar);
                }
            });
            g.ahora(this.datos.ahora);
            g.closeCortina();
        }catch(ex){
            console.error(ex)
        }
    }
    agregar_publicaciones(ar){
        //limpio 1ro
        $("#telefonos-utiles [name='listado']").html("");
        
        let template = $("#template_telefono_util").html();
        ar.forEach(p=>{
            p.datos_de_contacto.forEach(item=>{
                $("#telefonos-utiles [name='listado']").append(template);
                let card = $("#telefonos-utiles .list-group-item").last();
                card.find("[name='departamento']").html(g.bd_to_str(p.nombre))
                card.find("[name='subdepartamento']").html(item[0] && item[0])
                if(item[1] == "Teléfono"){
                    card.attr("href", "tel:" + item[2].replaceAll("-", "").replaceAll(" ", ""));
                    card.find("i").addClass("fas").addClass("fa-phone")
                    card.find("i").parent().css("background", "var(--primary)")
                    card.find("[name='dato']").html("Teléfono: " + item[2])
                }else if(item[1] == "Teléfono2"){
                    card.attr("href", "https://wa.me/" + item[2].replaceAll("-", "").replaceAll(" ", ""));
                    card.find("i").addClass("fab").addClass("fa-whatsapp")
                    card.find("i").parent().css("background", "var(--whatsapp)")
                    card.find("[name='dato']").html("Whatsapp: " + item[2])
                }else if(item[1] == "Mail"){
                    card.attr("href", "mailto:" + item[2]);
                    card.find("i").addClass("fas").addClass("fa-envelope")
                    card.find("i").parent().css("background", "var(--secondary)")
                    card.find("[name='dato']").html("Mail: " + item[2])
                }else if(item[1] == "Web"){
                    card.attr("href", item[2]);
                    card.find("[name='accion']").html("Ir a sitio")
                    card.find("i").addClass("fas").addClass("fa-globe")
                    card.find("i").parent().css("background", "var(--warning)")
                    card.find("[name='dato']").html("Website: " + item[2])
                }else if(item[1] == "Facebook"){
                    card.attr("href", item[2]);
                    card.find("i").addClass("fab").addClass("fa-facebook")
                    card.find("i").parent().css("background", "var(--facebook)")
                    card.find("[name='dato']").html("Facebook: " + item[2])
                }else if(item[1] == "Instagram"){
                    card.attr("href", item[2]);
                    card.find("i").addClass("fab").addClass("fa-instagram")
                    card.find("i").parent().css("background", "var(--instagram)")
                    card.find("[name='dato']").html("Instagram: " + item[2])
                }

            });
        });
    }
    agregar_publicidades_laterales(ar){
        let template = $("#publicidad").html();
        ar.forEach(p=>{
            $("[name='publicidades_laterales']").append(template)
            $("[name='publicidades_laterales'] a").last().attr("href", p.enlace);
            $("[name='publicidades_laterales'] img").last().attr("src", "/images/subidas/" + p.imagen);
        })
    }
    agregar_otras_noticias(ar){
        let template = $("#template_noticia").html();
        ar.forEach(nx=>{
            nx.titulo = g.bd_to_str(nx.titulo);
            $("[name='otras-noticias']").append(template);
            let card = $("[name='otras-noticias'] .card").last();
            card.find("a").attr("href", "/noticia/" + nx.url)
            card.find("[name='imagen']").prop("src", "/images/subidas/" + nx.imagenes[0])
            card.find("[name='titulo2']").html(nx.titulo)
            card.find("[name='fecha']").html(fechas.parse({val: nx.fecha, formato: fechas.FORMATO.ARG_FECHA}))
            if(nx.video) card.find("[name='etiqueta']").removeClass("d-none")
        })
    }
}