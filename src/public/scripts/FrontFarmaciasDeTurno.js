class FrontFarmaciasDeTurno{
    constructor(){
        this.datos = null
    }
    ini(){
        try{
            this.datos = JSON.parse(DATOS)
            this.datos.pois.forEach(p=>{
                p.nombre = g.bd_to_str(p.nombre);
                p.direccion = g.bd_to_str(p.direccion);
            })
            this.agregar_publicaciones(this.datos.fechas)
            g.llenarMarquee(this.datos.marquesina.filter(m=>m.tipo_publicacion.indexOf("marquesina") >= 0))
            this.agregar_publicidades_laterales(this.datos.publicidades)
            this.agregar_otras_noticias(this.datos.noticias);
            g.ahora(this.datos.ahora);
            g.closeCortina();
        }catch(ex){
            console.error(ex)
        }
    }
    agregar_publicaciones(ar){
        let template = $("#template_item").html();
        let fx = new Date()
        //mes completo
        ar.forEach(p=>{
            
            if(p.mes === fx.getMonth() && p.anio === fx.getFullYear()){
                for(let prop in p.fechas){
                    $("#farmacias-de-turno [name='lista-mes']").append(template);
                    let card = $("#farmacias-de-turno [name='lista-mes'] .list-group-item").last();
                    let dia = parseInt(prop.substring(1))
                    if (dia < 10) dia = "0" + dia 
                    let farmacia = this.datos.pois.find(fx=>fx.id ===  parseInt(p.fechas[prop]))
                    if(farmacia){
                        
                        card.find("[name='dato']").html("<b>" + dia + "</b> - " + farmacia?.nombre)
                        card.find("[name='ubicacion']").html("Ubicación: " + farmacia?.direccion)
                        card.attr("href", "/guia-comercial/comercio/" + farmacia.url)
                    }else{
                        card.find("[name='dato']").html(dia + " - ?")
                        card.find("[name='ubicacion']").html("")
                        card.attr("href", "#")
                    }
                }
            }
        });


        let _hoy = fechas.parse({val: fx})
        let fx2 = new Date()
        fx2.setDate(fx2.getDate() - 1)
        let _ayer = fechas.parse({val: fx2})
        console.log(_hoy, _ayer)

        let mes_farmacia_ayer = ar.find(h1=>h1.mes === parseInt(_ayer.mes) - 1 && h1.anio === parseInt(_ayer.anio))
        if(!mes_farmacia_ayer) return;//si no tiene farmacias de ayer cancela la muestra de farmacias
        let farmacia_ayer = mes_farmacia_ayer.fechas["f" + parseInt(_ayer.dia)]

        //hoy HASTA 8am
        if(farmacia_ayer && farmacia_ayer != 0){
            $("#farmacias-de-turno [name='lista-hoy']").append(template);
            let card = $("#farmacias-de-turno [name='lista-hoy'] .list-group-item").last();
            let farmacia = this.datos.pois.find(fx=>fx.id ===  parseInt(farmacia_ayer))
            if(farmacia){
                card.find("[name='dato']").html("<b>Hasta 8am</b> - " + farmacia?.nombre)
                card.find("[name='ubicacion']").html("Ubicación: " + farmacia?.direccion)
                card.attr("href", "/guia-comercial/comercio/" + g.getUrl(farmacia.id, farmacia.nombre))
            }else{
                card.find("[name='dato']").html(dia + " - ?")
                card.find("[name='ubicacion']").html("")
                card.attr("href", "#")
            }
        }

        let mes_farmacia_hoy = ar.find(h1=>h1.mes === parseInt(_hoy.mes) - 1 && h1.anio === parseInt(_hoy.anio))
        let farmacia_hoy = mes_farmacia_hoy.fechas["f" + parseInt(_hoy.dia)]

        //hoy DESDE 8am
        if(farmacia_hoy && farmacia_hoy != 0){
            $("#farmacias-de-turno [name='lista-hoy']").append(template);
            let card = $("#farmacias-de-turno [name='lista-hoy'] .list-group-item").last();
            let farmacia = this.datos.pois.find(fx=>fx.id ===  parseInt(farmacia_hoy))
            if(farmacia){
                card.find("[name='dato']").html("<b>Desde 8am</b> - " + farmacia?.nombre)
                card.find("[name='ubicacion']").html("Ubicación: " + farmacia?.direccion)
                card.attr("href", "/guia-comercial/comercio/" + g.getUrl(farmacia.id, farmacia.nombre))
            }else{
                card.find("[name='dato']").html(dia + " - ?")
                card.find("[name='ubicacion']").html("")
                card.attr("href", "#")
            }
        }
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
}