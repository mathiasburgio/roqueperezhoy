class FrontNoticia{
    constructor(){
        this.datos = null
    }
    ini(){
        try{
            this.datos = JSON.parse(DATOS)
            this.mostrar_noticia(this.datos.noticia)
            g.llenarMarquee(this.datos.marquesina.filter(m=>m.tipo_publicacion.indexOf("marquesina") >= 0))
            this.agregar_publicidades_laterales(this.datos.publicidades);

            $("[name='escuchar']").click(ev=>{
                this.sintetizar_texto()
            });

            g.ahora(this.datos.ahora);
            g.closeCortina();

            this.agregar_otras_noticias(this.datos.noticias)
        }catch(ex){
            console.error(ex)
        }
    }
    mostrar_noticia(nx){
        let fx = fechas.parse({val: nx.fecha})
        $("#nota [name='titulo']").html(g.bd_to_str(nx.titulo))
        $("#nota [name='bajada']").html(g.bd_to_str(nx.bajada))
        $("#nota [name='detalle']").html(g.bd_to_str(nx.detalle, true))
        $("[name='categoria']").html(nx.categoria.limpio)
        $("#nota [name='fecha']").html(fx.dia + " de " + fechas.MONTH_NAME[parseInt(fx.mes) -1] + " de " + fx.anio)
        if(nx.autor){
            $("#nota [name='autor']").html(nx.autor);
        }else{
            $("#nota [name='autor']").parent().remove();
        }
        if(nx.fuente){
            $("#nota [name='fuente']").html(nx.fuente);
        }else{
            $("#nota [name='fuente']").parent().remove();
        }
        
        let tags = ""
        nx.tags.forEach(tag=>{
            tags += `<a href="/noticias/tag/${tag}" class="badge badge-primary mr-2">${tag}</a>`
        });
        $("#nota [name='tags']").html(tags);

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
        $("#nota [name='pie_de_foto']").html(g.bd_to_str(nx.pie_de_foto) || "")

        $("[name='share_facebook']").prop("href", "https://www.facebook.com/sharer.php?u=https://roqueperezhoy.com.ar/noticia/" + nx.url)
        $("[name='share_whatsapp']").prop("href", "https://wa.me/?text=https://roqueperezhoy.com.ar/noticia/" + nx.url)
        $("[name='share_twitter']").prop("href", "https://twitter.com/intent/tweet?url=https://roqueperezhoy.com.ar/noticia/" + nx.url)
    }
    agregar_otras_noticias(ar){
        let cc = 0;
        let template = $("#template_item").html();
        ar.forEach(nx=>{
            nx.titulo = g.bd_to_str(nx.titulo)
            if(cc < 6 && nx.id != this.datos.noticia.id){
                $("#noticia [name='otras-noticias']").append(template);
                let card = $("#noticia [name='otras-noticias'] .card").last();
                card.find("a").attr("href", "/noticia/" + nx.url)
                card.find("[name='imagen']").prop("src", "/images/subidas/" + nx.imagenes[0])
                card.find("[name='titulo2']").html(nx.titulo)
                card.find("[name='fecha']").html(fechas.parse({val: nx.fecha, formato: fechas.FORMATO.ARG_FECHA}))
                if(nx.video) card.find("[name='etiqueta']").removeClass("d-none")
                g.tryImgCover( card.find("[name='imagen']") );
                cc++;
            }
        })
    }
    agregar_publicidades_laterales(ar){
        let template = $("#publicidad").html();
        ar.forEach(p=>{
            $("[name='publicidades_laterales']").append(template)
            $("[name='publicidades_laterales'] a").last().attr("href", p.enlace);
            $("[name='publicidades_laterales'] img").last().attr("src", "/images/subidas/" + p.imagen);
        })

        let intermedias = this.datos.publicidades.filter(p=>[22,42,43].includes(p.px.id))
        $("#nota .publicidad-interna").each((ind, ev)=>{
            let px = intermedias.at(ind)
            if(px){
                $(ev).replaceWith(template)
                let p = $("#nota [pub]").last();
                
                p.find("a").attr("href", px.enlace);
                p.find("img")
                .css("width", "auto")
                .css("max-width", "100%")
                .css("max-height", "250px")
                .attr("src", "/images/subidas/" + px.imagen);
            }
        });
    }
    sintetizar_texto(){

        let text = ""
        $("#nota [name='detalle'] p").each((ind, ev)=>{
            text += ($(ev).text()).trim()
        })

        if ('speechSynthesis' in window) {
            // Creamos un nuevo objeto de síntesis de voz
            var synthesis = window.speechSynthesis;
            
            // Obtenemos el texto de la noticia
            //let textoNoticia = txt;
            
            // Creamos un nuevo objeto de síntesis de voz
            let utterance = new SpeechSynthesisUtterance(text);
            
            // Opcional: Configuramos opciones adicionales
            utterance.lang = 'es-ES'; // Idioma de la síntesis de voz
            
            // Sintetizamos la voz
            synthesis.cancel();
            synthesis.speak(utterance);
        } else {
            // El navegador no es compatible con la Web Speech API
            console.log('El navegador no admite la síntesis de voz.');
        }
    }
}
