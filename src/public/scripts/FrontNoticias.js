class FrontNoticias{
    constructor(){
        this.datos = null
        this.busqueda= {
            tipo: "nada",
            query: "nada",
            ar: []
        }
        this._busqueda = JSON.stringify(this.busqueda);
    }
    ini(){
        try{
            this.datos = JSON.parse(DATOS)
            this.agregar_publicidades_laterales(this.datos.publicidades);
            g.llenarMarquee(this.datos.marquesina.filter(m=>m.tipo_publicacion.indexOf("marquesina") >= 0))
            let params = g.getParams();
            if(params && params.tipo == "tag" && params.query){
                this.getNoticias("tag", params.query);
                $("[name='mostrar_todo'] span").html("tag: " + params.query);
            }else{
                this.mostrarTodo(0);
            }

            $("[name='txBuscar']").keyup(ev=>{
                let v = $(ev.currentTarget).val().toString().trim()
                if(ev.keyCode == 13){
                    if(v === ""){
                        this.mostrarTodo();
                    }else{
                        $("#noticias [name='listado']").html("");
                        $("[name='mostrar_todo'] span").html("Busqueda: " + v);
                        this.getNoticias("buscar", v);
                    }
                }
            })

            $("[name='cargar_mas']").click(ev=>{
                this.getNoticias(this.busqueda.tipo, this.busqueda.query);
            })

            $("[name='filtrar']").click(ev=>{
                this.modal_filtrar();
            })

            $("[name='mostrar_todo']").click(ev=>{
                this.mostrarTodo();
            })

            g.ahora(this.datos.ahora);
            g.closeCortina();
        }catch(ex){
            console.error(ex)
        }
    }
    
    agregar_publicaciones(ar){
        let template = $("#template_noticia").html();
        ar.forEach(nx=>{
            nx.titulo = g.bd_to_str(nx.titulo)
            $("#noticias [name='listado']").append(template);
            let card = $("#noticias [name='listado'] .card").last();
            card.find("a").attr("href", "/noticia/" + nx.url)
            card.find("[name='imagen']").prop("src", "/images/subidas/" + nx.imagenes[0])
            card.find("[name='titulo2']").html(nx.titulo)
            card.find("[name='fecha']").html(fechas.parse({val: nx.fecha, formato: fechas.FORMATO.ARG_FECHA}))
            card.find("[name='categoria']").html(nx.categoria.limpio)
            if(nx.video){
                card.find("[name='etiqueta']").removeClass("d-none")
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

        let html = "";
        [{id: 0, label: "Últimas noticias", limpio: "ultimas-noticias"}].concat(CATEGORIAS_NOTICIAS).forEach(cx=>{
            html += `<li categoria="${cx.id}" class="list-group-item list-group-item-action cp">
                        <span>${cx.label}</span>
                    </li>`
        })
        $("#modal .list-group").html(html)

        $("#modal .list-group li").click(ev=>{
            modal.config.fnOcultar2 = () =>{
                let cate = parseInt($(ev.currentTarget).attr("categoria"))
                let cx = CATEGORIAS_NOTICIAS.find(c=>c.id === cate)
                if(cate === 0){
                    this.mostrarTodo();
                }else{
                    $("#noticias [name='listado']").html("");
                    $("[name='mostrar_todo'] span").html("Categoría: " + cx.label);
                    this.busqueda.tipo = null;//esta linea es para evitar q se seleccione 2 veces la misma categoria
                    this.getNoticias("categoria", cate);
                }
            };
            modal.ocultar();
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
    getNoticias(tipo, query){
        modal.esperando("Buscando noticias...");
        setTimeout(()=>{
            
            if(this.busqueda.tipo != tipo || this.busqueda.query != query){
                this.busqueda.tipo = tipo;
                this.busqueda.query = query;
                this.busqueda.ar = [];
                $("#noticias [name='listado']").html("");
            }
            let url = `/noticias/q/${this.busqueda.tipo}/${encodeURI(this.busqueda.query)}/${this.busqueda.ar.length}`
            $.get({
                url: url
            }).done(ret=>{
                console.log(ret)
                if(this.busqueda.tipo != tipo || this.busqueda.query != query){
                    this.busqueda.ar = ret.lista;
                }else{
                    this.busqueda.ar = this.busqueda.ar.concat(ret.lista);
                }
                $("[name='cargar_mas']").prop("disabled", ret.lista.length < 10)
                if(tipo != "nada"){
                    $("[name='mostrar_todo']")
                    .removeClass("d-none")

                    $("[name='txBuscar']")
                    .prop("disabled", true)
                    .prop("placeholder", "")
                    .val("")
                }
                this.agregar_publicaciones(ret.lista);
                modal.ocultar();
            });

        },500);  
    }
    async mostrarTodo(){
        await modal.esperando2("Buscando noticias...");
        $("[name='cargar_mas']").prop("disabled", false)

        $("[name='listado-categorias'] [categoria]").removeClass("badge-primary").addClass("badge-light")
        $("[name='listado-categorias'] [categoria='0']").addClass("badge-primary").removeClass("badge-light")

        $("[name='mostrar_todo']").addClass("d-none")
        $("[name='txBuscar']")
        .prop("disabled", false)
        .prop("placeholder", "Buscar noticia...")
        .val("")
        
        $("#noticias [name='listado']").html("");
        this.busqueda = JSON.parse(this._busqueda)
        this.busqueda.ar = this.datos.noticias;
        this.agregar_publicaciones(this.busqueda.ar)
        modal.ocultar()
    }
}
