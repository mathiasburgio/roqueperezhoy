class FrontGuiaComercial{
    constructor(){
        this.datos = null
        this.favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]")
        this.busqueda = [];
        this.categorias = JSON.parse(JSON.stringify(CATEGORIAS_POIS))
    }
    ini(){
        try{
            this.datos = JSON.parse(DATOS)
            this.datos.pois.forEach(px=>{
                px.nombre = g.bd_to_str(px.nombre)
                px.propietario = g.bd_to_str(px.propietario)
                px._nombre = g.onlyAlphanumeric(px.nombre)
                let cx = this.categorias.find(c=>c.id == px.categoria_1.id);
                cx.cantidad ? cx.cantidad++ : cx.cantidad = 1;
            });

            this.busqueda = this.datos.pois;
            this.agregar_publicaciones(false);
            g.llenarMarquee(this.datos.marquesina.filter(m=>m.tipo_publicacion.indexOf("marquesina") >= 0))
            this.categorias.sort((a, b)=>{
                if(a.nombre > b.nombre) return 1
                if(a.nombre < b.nombre) return -1
                return 0
            });
            
            $("[name='txBuscar']").keyup(ev=>{
                let v = g.onlyAlphanumeric($(ev.currentTarget).val().toString().trim());
                if(ev.keyCode == 13){
                    if(v === ""){
                        this.busqueda = this.datos.pois;
                        this.agregar_publicaciones(false);
                        this.filtro(false);
                    }else{
                        this.busqueda = this.datos.pois.filter(p=>p._nombre.indexOf(v) > -1)
                        this.agregar_publicaciones(false);
                        this.filtro(true, "Busqueda: " + v)
                    }
                }
            })

            $("[name='filtrar']").click(ev=>{
                this.modal_filtrar()
            })

            $("[name='cargar_mas']").click(ev=>{
                this.agregar_publicaciones(true);
            })

            $("[name='mostrar_todo']").click(ev=>{
                this.busqueda = this.datos.pois;
                this.agregar_publicaciones(false);
                this.filtro(false);
            })

            this.agregar_publicidades_laterales(this.datos.publicidades);

            g.ahora(this.datos.ahora);
            g.closeCortina();
        }catch(ex){
            console.error(ex)
        }
    }
    async agregar_publicaciones(cargar_mas = false){
        await modal.esperando2("Buscando...");
        if(cargar_mas == false) $("#guia-comercial [name='listado']").html("");
        
        let template = $("#template_item").html();
        let fx = fechas.parse({val: new Date()})
        let hora = fx.hora + ":" + fx.minuto;
        let dia = (new Date()).getDay();
        
        let mostrar = 10;
        let cc = 0;
        let lastInd = parseInt($("#guia-comercial [name='listado'] [ind]").last().attr("ind") || -1);
        console.log(lastInd)
        this.busqueda.forEach((nx, ind)=>{
            if(ind > lastInd && cc < mostrar){
                $("#guia-comercial [name='listado']").append(template);
                let card = $("#guia-comercial [name='listado'] .card").last();
                card.attr("poi", nx.id);
                card.attr("ind", ind);
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
                if((nx.dias_horarios[dia][0] <= hora && nx.dias_horarios[dia][1] >= hora) || (nx.dias_horarios[dia][2] <= hora && nx.dias_horarios[dia][3] >= hora)){
                    card.find("[name='abierto']").append("Abierto")
                }else if(nx.dias_horarios[dia].every(n=>n === "")){
                    card.find("[name='abierto']").addClass("d-none")
                }else{
                    card.find("[name='abierto']").append("Cerrado")
                }
                cc++;
            }
        })
        if(cc < mostrar) $("[name='cargar_mas']").prop("disabled", true)
        modal.ocultar();
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
    modal_filtrar(){
        let fox = `<ul class="list-group"></ul>`;
        modal.mostrar({
            titulo: "Filtrar",
            cuerpo: fox,
            botones: "volver"
        })
        const getItem = (str, cant, icono = "") =>{
            return `<li categoria="${str}" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center cp">
                        <span>${icono}${str}</span>
                        <span class="badge badge-primary badge-pill">${cant}</span>
                    </li>`;
        }
        
        let html = ""
        html += getItem("Todos", this.datos.pois.length)
        html += getItem(`Favoritos`, this.favoritos.length || 0, `<i class='fas fa-heart text-danger'></i> `)
        
        this.categorias.forEach(cx=>{
            if(cx.cantidad && cx.cantidad > 0){
                html += getItem(cx.nombre, cx.cantidad || 0)
            }
        })
        $("#modal .list-group").html(html)

        $("#modal .list-group li").click(ev=>{
            modal.config.fnOcultar2 = () =>{
                let cate = $(ev.currentTarget).attr("categoria")
                let ar = this.datos.pois.filter(p=>p.categoria_1.nombre === cate);
                if(cate == "Todos"){
                    this.busqueda = this.datos.pois;
                    this.agregar_publicaciones(false);
                    this.filtro(false)
                }else{
                    if(cate == "Favoritos") ar = this.datos.pois.filter(p=>this.favoritos.includes(p.id))
                    this.busqueda = ar;
                    this.agregar_publicaciones(false);
                    this.filtro(true, "Categoría: " + cate);
                }
            }
            modal.ocultar();
        });
    }
    filtro(mostrar, str){
        if(mostrar == false){
            $("[name='cargar_mas']").prop("disabled", false)

            $("[name='mostrar_todo']").addClass("d-none")

            $("[name='txBuscar']")
            .prop("disabled", false)
            .prop("placeholder", "Buscar...")
            .val("")
        }else{
            $("[name='mostrar_todo'] span").html(str);

            $("[name='mostrar_todo']")
            .removeClass("d-none")
    
            $("[name='txBuscar']")
            .prop("disabled", true)
            .prop("placeholder", "")
            .val("")
        }
    }
}
