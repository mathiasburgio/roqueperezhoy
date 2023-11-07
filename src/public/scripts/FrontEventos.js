class FrontEventos{
    constructor(){
        this.datos = null
    }
    ini(){
        try{
            this.datos = JSON.parse(DATOS)
            this.agregar_publicaciones(this.datos.eventos)
            g.llenarMarquee(this.datos.marquesina.filter(m=>m.tipo_publicacion.indexOf("marquesina") >= 0))
            this.agregar_publicidades_laterales(this.datos.publicidades);

            g.ahora(this.datos.ahora);
            g.closeCortina();
        }catch(ex){
            console.error(ex)
        }
    }
    agregar_publicaciones(ar){
        let template = $("#template_evento").html();
        let fx = fechas.parse({val: new Date(), formato: fechas.FORMATO.USA_FECHA});
        ar.forEach(nx=>{
            nx.nombre = g.bd_to_str(nx.nombre)
            $("#eventos [name='listado']").append(template);
            let card = $("#eventos [name='listado'] .item").last();
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
    agregar_publicidades_laterales(ar){
        let template = $("#publicidad").html();
        ar.forEach(p=>{
            $("[name='publicidades_laterales']").append(template)
            $("[name='publicidades_laterales'] a").last().attr("href", p.enlace);
            $("[name='publicidades_laterales'] img").last().attr("src", "/images/subidas/" + p.imagen);
        })
    }
}
