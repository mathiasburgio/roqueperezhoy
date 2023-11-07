class FrontEvento{
    constructor(){
        this.datos = null
    }
    ini(){
        try{
            this.datos = JSON.parse(DATOS)

            this.mostrar_evento(this.datos.evento)
            this.agregar_otros_eventos(this.datos.eventos)
            g.llenarMarquee(this.datos.marquesina.filter(m=>m.tipo_publicacion.indexOf("marquesina") >= 0))
            this.agregar_publicidades_laterales(this.datos.publicidades);

            g.ahora(this.datos.ahora);
            g.closeCortina();
        }catch(ex){
            console.error(ex)
        }
    }
    agregar_otros_eventos(ar){
        let template = $("#template_evento").html();
        let fx = fechas.parse({val: new Date(), formato: fechas.FORMATO.USA_FECHA});
        ar.forEach(nx=>{
            nx.nombre = g.bd_to_str(nx.nombre)
            $("[name='otros-eventos']").append(template);
            let card = $("[name='otros-eventos'] .item").last();
            card.attr("idd", nx.id)
            card.find("[name='imagen']").prop("src", "/images/subidas/" + nx.imagenes[0])
            card.find("a").prop("href", "/evento/" + nx.url)

            let _fx = "";
            nx.fechas.forEach(f=>{
                let fx2 = fechas.parse({val: f, formato: fechas.FORMATO.USA_FECHA});
                if(fx2 >= fx && _fx == "") _fx = fx2
            });

            let fechita = fechas.parse({val: _fx});
            card.find("[name='fecha']").html(fechita.dia + "<br>" + fechas.MONTH_NAME[parseInt(fechita.mes) - 1].substring(0,3))
            if(nx.suspendido) card.find("[name='suspendido']").removeClass("d-none")
        })
    }
    mostrar_evento(nx){
        if(!nx){
            $("#nota").html(`<div class='alert alert-warning h3'>Evento no encontrado</div>`)
            $("[name='share_facebook']").remove()
            $("[name='share_whatsapp']").remove()
            $("[name='share_twitter']").remove()
            return
        }



        if(nx.suspendido) $("#nota [name='suspendido']").removeClass("d-none")
        $("#nota [name='nombre']").html(g.bd_to_str(nx.nombre))
        $("#nota [name='detalle']").html(g.bd_to_str(nx.detalle, true))
        
        let ffin = fechas.parse({val: nx.fecha_fin, formato: fechas.FORMATO.USA_FECHA_HORA});
        let fahora = fechas.getNow(true);
        if(ffin < fahora || nx.publicidad){
            $("#nota [name='precio']").html("Precio $" + nx.precio)
        }else{
            $("#nota [name='precio']").html("Precio GRATIS")
        }
        
        if(nx.video){
            $("#myVideo").on("load", ()=>{
                $("#myVideo").removeClass("d-none");
            });
            $("#myVideo").attr("src", nx.video);
        }else{
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

            var swiper = new Swiper("#swiper-principal", {
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
        }

        let htmlFechas = "";
        nx.fechas.forEach(f=>{
            let _f = fechas.parse({val: f, formato: fechas.FORMATO.ARG_FECHA_HORA}).split(" ");
            htmlFechas += `
            <tr>
                <td>${_f[0]}</td>
                <td>${_f[1]}</td>
            </tr>`;
        })
        $("#nota [name='fechas'] tbody").html(htmlFechas)

        $("[name='share_facebook']").attr("href", "https://www.facebook.com/sharer.php?u=https://roqueperezhoy.com.ar/evento/" + nx.url);
        $("[name='share_whatsapp']").attr("href", "https://wa.me/?text=https://roqueperezhoy.com.ar/evento/" + nx.url);
        $("[name='share_twitter']").attr("href", "https://twitter.com/intent/tweet?text=evento%20RoquePerezHoy&url=https://roqueperezhoy.com.ar/evento/" + nx.url);
    }
    agregar_publicidades_laterales(ar){
        let template = $("#publicidad").html();
        ar.forEach(p=>{
            $("[name='publicidades_laterales']").append(template)
            $("[name='publicidades_laterales'] a").last().attr("href", p.enlace);
            $("[name='publicidades_laterales'] img").last().attr("src", "/images/subidas/" + p.imagen);
        })
    }
}
