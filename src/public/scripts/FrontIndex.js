class FrontIndex{
    constructor(){
        this.datos = null;
    }
    async ini(){
        $("#btMenu").addClass("d-none");
        $("#btBuscador").addClass("d-none");
        $("header>div:eq(1) span").css("font-size", "2rem");
        $("main.col-md-9").removeClass("col-md-9");
        $("aside.col-md-3").remove();

        this.datos = JSON.parse(DATOS)
        this.llenarPrincipal(this.datos.marquesina.filter(m=>m.tipo_publicacion.indexOf("slider") >= 0))
        g.llenarMarquee(this.datos.marquesina.filter(m=>m.tipo_publicacion.indexOf("marquesina") >= 0))
        this.llenarNoticias(this.datos.noticias)
        this.llenarEventos(this.datos.eventos)
        this.llenarEmprendimientos(this.datos.pois)
        this.agregar_publicidades_laterales(this.datos.publicidades.slice(0,5))

        if($(window).width() < 1024){
            $("#chico").addClass("d-flex").removeClass("d-none");      
        }else{
            $("#grande").removeClass("d-none");
        }

        $("#grande .list-group:eq(0) a").on("mouseover", ev=>{
            let l = $(ev.currentTarget)
            this.animateLi(l)
        });

        g.ahora(this.datos.ahora);
        g.closeCortina();
    }
    llenarPrincipal(ar){
        if(ar.length == 0){
            ar = JSON.parse(JSON.stringify(this.datos.noticias))
            ar.forEach(nx=>{
                nx.imagen = nx.imagenes[0];
                nx.texto = nx.titulo;
            })
            if(ar.length > 5) ar.length = 5;
        }
        let template = $("#template_swipe_slide_principal").html()
        ar.forEach(item=>{
            $("#swiper-principal .swiper-wrapper").append(template)
            let slide = $("#swiper-principal .swiper-wrapper .swiper-slide").last()
            slide.find("a").attr("href", item.enlace)
            slide.find("[name='imagen']").attr("src", "/images/subidas/" + item.imagen)
            slide.find("[name='texto']").html(g.bd_to_str(item.texto))
        });

        ar.forEach(item=>{
            $("#swiper-principal-chico .swiper-wrapper").append(template)
            let slide = $("#swiper-principal-chico .swiper-wrapper .swiper-slide").last()
            slide.find("a").attr("href", item.enlace)
            slide.find("[name='imagen']").attr("src", "/images/subidas/" + item.imagen)
            slide.find("[name='texto']").html(g.bd_to_str(item.texto))
        });

        const swiper = new Swiper('#swiper-principal', {
            // Optional parameters
            loop: true,
            //slidesPerView: 3,
            //spaceBetween: 30,
          
            // If we need pagination
            /*
            pagination: {
              el: '#swiper-principal .swiper-pagination',
              clickable: true,
            },
            */
            autoplay: {
               delay: 5000,
            },
          
            // Navigation arrows
            navigation: {
              nextEl: '#swiper-principal .swiper-button-next',
              prevEl: '#swiper-principal .swiper-button-prev',
            },
        });

        const swiperChico = new Swiper('#swiper-principal-chico', {
            // Optional parameters
            loop: true,
            //slidesPerView: 3,
            //spaceBetween: 30,
          
            // If we need pagination
            pagination: {
              el: '#swiper-principal-chico .swiper-pagination',
              clickable: true,
            },
          
            // Navigation arrows
            navigation: {
              nextEl: '#swiper-principal-chico .swiper-button-next',
              prevEl: '#swiper-principal-chico .swiper-button-prev',
            },
        });
    }
    
    llenarNoticias(ar){
        let template = $("#template_swipe_slide_secundario").html()
        let segundo = false;
        ar.forEach(item=>{
            item.titulo = g.bd_to_str(item.titulo)
            let img = item.imagenes[0]
            $("#swiper-noticias .swiper-wrapper").append(template)
            let slide = $("#swiper-noticias .swiper-wrapper .swiper-slide").last()
            
            slide.parent().append("<div class='w-100'></div>" + slide.html());//duplico el slide
            slide.find("a").attr("href", "/noticia/" + item.url)
            slide.find("[name='imagen']").attr("src", "/images/subidas/" + img)
            slide.find("[name='texto']").html(item.titulo)
        });

        const swiper = new Swiper('#swiper-noticias', {
            // Optional parameters
            loop: true,
            slidesPerView: 2,
            spaceBetween: 30,
            
            // If we need pagination
            pagination: {
              el: '#swiper-noticias .swiper-pagination',
            },
          
            // Navigation arrows
            navigation: {
              nextEl: '#swiper-noticias .swiper-button-next',
              prevEl: '#swiper-noticias .swiper-button-prev',
            },
        });
    }
    llenarEventos(ar){
        
        if(ar.length == 0){
            $("[name='titulo-eventos']").addClass("d-none");
            $("#swiper-eventos").parent().addClass("d-none")
        }
        
        let template = $("#template_swipe_slide_secundario").html()
        ar.sort((a, b)=>{
            if(a.publicidad && !b.publicidad) return -1
            if(!a.publicidad && b.publicidad) return 1
            return 0
        });
        ar.forEach(item=>{
            item.nombre = g.bd_to_str(item.nombre)
            let img = item.imagenes[0]
            $("#swiper-eventos .swiper-wrapper").append(template)
            let slide = $("#swiper-eventos .swiper-wrapper .swiper-slide").last()
            slide.find("a").attr("href", "/evento/" + item.url)
            slide.find("[name='imagen']").attr("src", "/images/subidas/" + img)
            slide.find("[name='texto']").html(item.nombre)
        });

        const swiper = new Swiper('#swiper-eventos', {
            // Optional parameters
            loop: true,
            slidesPerView: 3,
            spaceBetween: 20,
          
            // If we need pagination
            pagination: {
              el: '#swiper-eventos .swiper-pagination',
            },
          
            // Navigation arrows
            navigation: {
              nextEl: '#swiper-eventos .swiper-button-next',
              prevEl: '#swiper-eventos .swiper-button-prev',
            },
        });
    }
    llenarEmprendimientos(ar){
        
        if(ar.length == 0){
            $("[name='titulo-emprendimientos']").addClass("d-none");
            $("#swiper-emprendimientos").parent().addClass("d-none")
        }
        
        let template = $("#template_swipe_slide_secundario").html()
        ar.forEach(item=>{
            item.nombre = g.bd_to_str(item.nombre)
            if(item.publicidad && [21, 24].includes(item.publicidad.pid)){
                let img = item.imagenes[0]
                $("#swiper-emprendimientos .swiper-wrapper").append(template)
                let slide = $("#swiper-emprendimientos .swiper-wrapper .swiper-slide").last()
                slide.find("a").attr("href", "/guia-comercial/comercio/" + item.url)
                slide.find("[name='imagen']").attr("src", "/images/subidas/" + img)
                slide.find("[name='texto']").html(item.nombre)
            }
        });

        const swiper = new Swiper('#swiper-emprendimientos', {
            // Optional parameters
            loop: true,
            slidesPerView: 3,
            spaceBetween: 20,
          
            // If we need pagination
            pagination: {
              el: '#swiper-emprendimientos .swiper-pagination',
              clickable: true,
            },
          
            // Navigation arrows
            navigation: {
              nextEl: '#swiper-emprendimientos .swiper-button-next',
              prevEl: '#swiper-emprendimientos .swiper-button-prev',
            },
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
    animateLi(li, leftToRight = true){
        let animando = li.data("animando");
        let w = parseInt(li.css("width").replace("px", ""));
        let w_ = (w * -1) + "px";
        w = w + "px";

        if(!animando){
            li.data("animando", 1);
            li.css("background", "linear-gradient(90deg, rgb(179, 176, 230) 0%, rgb(132, 132, 243) 35%, var(--rph) 100%)");
            li.css("background-repeat", "no-repeat");
            li.css("background-position-x", leftToRight ? w_ : w);
            
            li.animate({
                "background-position-x": leftToRight ? w : w_
            }, 500, ()=>{
                li.data("animando", 0);
                li.css("background", "var(--rph)")
            });
        }
    }
}