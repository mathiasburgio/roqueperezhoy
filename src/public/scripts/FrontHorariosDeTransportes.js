class FrontHorariosDeTransportes{
    constructor(){
        this.datos = null
    }
    ini(){
        try{
            this.datos = JSON.parse(DATOS)
            this.agregar_publicaciones(this.datos.horarios)
            g.llenarMarquee(this.datos.marquesina.filter(m=>m.tipo_publicacion.indexOf("marquesina") >= 0))
            this.agregar_publicidades_laterales(this.datos.publicidades)
            this.agregar_otras_noticias(this.datos.noticias);

            let idx = parseInt(window.location.pathname.split("/").at(-1).split("#")[0].split("?")[0].split("-")[0])
            if(idx && $("#horarios-de-transportes tbody [idd='" + idx + "']").length === 1) $("#horarios-de-transportes tbody [idd='" + idx + "']").click()
            
            g.ahora(this.datos.ahora);
            g.closeCortina();
        }catch(ex){
            console.error(ex)
        }
    }
    agregar_publicaciones(ar){
        let template = $("#template_item tbody").html();

        ar.sort((a,b)=>{
            if(a.origen > b.origen) return 1
            else if(a.origen < b.origen) return -1
            if(a.destino > b.destino) return 1
            else if(a.destino < b.destino) return -1
            return 0
        })
        ar.forEach(p=>{
            let px = this.datos.pois.find(px=>px.id === p.poi_transporte)
            if(px){
                px.nombre = g.bd_to_str(px.nombre)
                p.origen = g.bd_to_str(p.origen)
                p.destino = g.bd_to_str(p.destino)
                $("#horarios-de-transportes tbody").append(template);
                let card = $("#horarios-de-transportes tbody tr").last();
                card.attr("idd", p.id);
                card.find("[name='origen']").html(p.origen)
                card.find("[name='destino']").html(p.destino)
                card.find("[name='transporte']").html(px.nombre)
            }
        });

        $("#horarios-de-transportes tbody tr").click(ev=>{
            let dom = $(ev.currentTarget);
            let id = parseInt(dom.attr("idd"))
            let reg = this.datos.horarios.find(r=>r.id === id)
            this.modalTransporte(reg)
        })
    }
    modalTransporte(reg){
        let px = this.datos.pois.find(px=>px.id === reg.poi_transporte)
        console.log({reg, px})
        
        let fox = $("#template_modal").html()
        modal.mostrar({
            titulo: "Horarios",
            cuerpo: fox,
            tamano: "modal",
            botones: "volver"
        })
        
        //verifico si tiene imagen
        if(reg.imagen.indexOf("sin_imagen.jpg") == -1){
            $("#modal .modal-cuerpo").html(`<img style="width:100%" src="/images/subidas/${reg.imagen}"/>`)
            return;
        }

        $("#modal [name='origen']").val(g.bd_to_str(reg.origen))
        $("#modal [name='destino']").val(g.bd_to_str(reg.destino))
        $("#modal [name='transporte']").val(g.bd_to_str(px.nombre))

        if(reg.poi_origen > 0){
            $("#modal [name='enlace_origen']").prop("href", "/guia-comercial/comercio/" + reg.poi_origen) 
            $("#modal [name='enlace_origen']").removeClass("disabled") 
        }
        if(reg.poi_destino > 0){
            $("#modal [name='enlace_destino']").prop("href", "/guia-comercial/comercio/" + reg.poi_destino) 
            $("#modal [name='enlace_destino']").removeClass("disabled") 
        }
        if(reg.poi_transporte > 0){
            $("#modal [name='enlace_transporte']").prop("href", "/guia-comercial/comercio/" + reg.poi_transporte) 
            $("#modal [name='enlace_transporte']").removeClass("disabled") 
        }

        reg.dias_horarios.forEach(dh=>{
            let ds = DIAS_SEMANA.find(d=>d.val == dh[0])
            let bar = `<tr>
                            <td>${ds.label}</td>
                            <td class="text-right">${dh[1] || "---"}</td>
                            <td class="text-right">${dh[2] || "---"}</td>
                            <td class="text-right">$${dh[3] || "---"}</td>
                        </tr>`
            $("#modal table tbody").append(bar)
        })

        let htmlContactar = "";
        if(px.publicidad){
            px.datos_de_contacto.forEach(dc=>{
                let tc = TIPOS_CONTACTO.find(t=>t.tipo == dc[0])
                if(tc){
                    let bar = `<a href="${dc[1]}" target="_blank" class="list-group-item list-group-item-action">
                                    ${tc.label + ": " + dc[1]}
                                </a>`
                    htmlContactar += bar
                }
            })
        }
        if(htmlContactar) $("#modal [name='botones-contactar']").html(htmlContactar)

        $("#modal [name='share-facebook']").attr("href", "https://www.facebook.com/sharer.php?u=https://roqueperezhoy.com.ar/horarios-de-transportes/" + reg.url);
        $("#modal [name='share-whatsapp']").attr("href", "https://wa.me/?text=https://roqueperezhoy.com.ar/horarios-de-transportes/" + reg.url);
        $("#modal [name='share-twitter']").attr("href", "https://twitter.com/intent/tweet?text=horarios-de-transportes%20RoquePerezHoy&url=https://roqueperezhoy.com.ar/horarios-de-transportes/" + reg.url);
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