class FrontComunidad{
    constructor(){
        this.datos = null
        this.likes = JSON.parse(localStorage.getItem("likes") || "[]")
        this.ultimo_id = -1;
        this.contador_intermedia = -1;//indice de publicidad intermedia, para no repetirlas
        this.publicidad_cada = 5;//cada cuantas publicaciones hay una publicidad
        this.contador_delta_intermedia = this.publicidad_cada;//contador de publicaciones hasta la proxima publicidad
    }
    ini(){
        try{
            this.datos = JSON.parse(DATOS)

            if(this.datos.publicacion){
                this.datos.publicaciones = this.datos.publicaciones.filter(p=>p.id != this.datos.publicacion.id);
                this.datos.publicaciones = [this.datos.publicacion].concat(this.datos.publicaciones);
            }
            this.agregar_publicaciones(this.datos.publicaciones)
            g.llenarMarquee(this.datos.marquesina.filter(m=>m.tipo_publicacion.indexOf("marquesina") >= 0))
            this.agregar_publicidades_laterales(this.datos.publicidades)
            this.agregar_otras_noticias(this.datos.noticias);
            g.ahora(this.datos.ahora);
            
            this.ultimo_id = this.datos.publicaciones.at(-1).id;
            $("[name='cargar_mas']").click(async ev=>{
                await modal.esperando2("Obteniendo publicaciones...");
                $.get({ url: "/comunidad_cargar_mas/" + this.ultimo_id })
                .then(ret=>{;
                    this.datos.publicaciones = this.datos.publicaciones.concat(ret.lista);
                    this.agregar_publicaciones(ret.lista);
                    if(ret.lista.length < 5) $("[name='cargar_mas']").prop("disabled", true)
                    modal.ocultar();
                })
            });
            
            g.closeCortina();            
        }catch(ex){
            console.error(ex)
        }
    }
    agregar_publicaciones(ar){
        let template = $("#template_card").html();
        ar.forEach(p=>{
            p.nombre = g.bd_to_str(p.nombre)
            p.detalle = g.bd_to_str(p.detalle, true)
            $("#comunidad").append(template);
            let card = $("#comunidad .card").last();
            card.attr("publicacion", p.id)
            card.find("[name='titulo']").html(p.nombre)
            card.find("[name='cuerpo']").html(p.detalle, true)
            card.find("[name='imagen']").prop("src", "/images/subidas/" + p.imagen)
            card.find("[name='contador']").html(p.boton + ": " + p.clicks )
            console.log(p.creado)
            card.find("[name='fecha']").html(fechas.parse({val: p.creado, formato: fechas.FORMATO.ARG_FECHA}));
            if(p.poi) card.find("[name='emprendimiento']").removeClass("d-none").prop("href", "/guia-comercial/comercio/" + g.getUrl(p.poi, p.nombre))

            if(this.likes.includes(p.id)) this.toggleLike(p.id, true, false)

            this.contador_delta_intermedia--;
            if(this.contador_delta_intermedia === 0){
                this.agregar_publicidad_intermedia();
                this.contador_delta_intermedia = this.publicidad_cada;
            }

            card.find("[name='share_facebook']").attr("href", "https://www.facebook.com/sharer.php?u=https://roqueperezhoy.com.ar/comunidad/" + p.url);
            card.find("[name='share_whatsapp']").attr("href", "https://wa.me/?text=https://roqueperezhoy.com.ar/comunidad/" + p.url);
            card.find("[name='share_twitter']").attr("href", `https://twitter.com/intent/tweet?text=${encodeURI(p.nombre)}&url=https://roqueperezhoy.com.ar/comunidad/` + p.url);
        });

        $("[name='like']").unbind("click")
        $("[name='like']").click(ev=>{
            let idd = parseInt($(ev.currentTarget).parent().parent().parent().attr("publicacion"));
            let p = this.datos.publicaciones.find(px=> px.id === idd);
            let suma = this.likes.includes(p.id);
            let mas1 = suma ? -1 : 1;
            p.clicks = p.clicks + mas1;
            console.log(suma, mas1)
            this.toggleLike(p.id, !suma, true);
            
            $(ev.currentTarget)[0].blur();

            $("#comunidad [publicacion='" + p.id + "'] [name='contador']").html(p.boton + ": " + p.clicks )
            $.post({
                url:"/like_comunidad",
                data: {
                    id: idd, 
                    accion: mas1
                },
                processData: true,
                cache: false,
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
            nx.titulo = g.bd_to_str(nx.titulo)
            $("[name='otras-noticias']").append(template);
            let card = $("[name='otras-noticias'] .card").last();
            card.find("a").attr("href", "/noticia/" + nx.url)
            card.find("[name='imagen']").prop("src", "/images/subidas/" + nx.imagenes[0])
            card.find("[name='titulo2']").html(nx.titulo)
            card.find("[name='fecha']").html(fechas.parse({val: nx.fecha, formato: fechas.FORMATO.ARG_FECHA}))
            if(nx.video) card.find("[name='etiqueta']").removeClass("d-none")
        })
    }
    toggleLike(pid, estado, guardar){
        if(estado){
            $("[publicacion='" + pid + "'] [name='like']").removeClass("btn-outline-danger").addClass("btn-danger")
            if(guardar){
                this.likes.push(pid);
                localStorage.setItem("likes", JSON.stringify(this.likes))
                g.toast("¡Me gusta!");
            }
        }else{
            $("[publicacion='" + pid + "'] [name='like']").removeClass("btn-danger").addClass("btn-outline-danger")
            if(guardar){
                this.likes = this.likes.filter(p=>p != pid);
                localStorage.setItem("likes", JSON.stringify(this.likes))
                g.toast("Ya no me gusta");
            }
        }
    }
    agregar_publicidad_intermedia(){
        let template = $("#publicidad").html();
        let intermedias = this.datos.publicidades.filter(p=>[22,42,43].includes(p.px.id))
        this.contador_intermedia++;
        let px = intermedias.at(this.contador_intermedia);
        if(px){
            $("#comunidad").append("<div class='publicidad-intermedia m-auto' style='max-width: 470px; margin-bottom:30px'><small class='text-muted'>Publicidad</small></div>");
            let p = $(".publicidad-intermedia").last();
            p.append(template);

            p.find("a").attr("href", px.enlace);
            p.find("img")
            .css("width", "auto")
            .css("max-width", "100%")
            .css("max-height", "250px")
            .attr("src", "/images/subidas/" + px.imagen);
        }
    }
}