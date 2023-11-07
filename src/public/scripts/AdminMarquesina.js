class AdminMarquesina{
    constructor(){
        this.bandera = false;
    }
    async ini(){
        await g.cargar_listados(true, true, true);
        
        imagine.domUploader({dom: $(".imagen"), resizeOnChange: true, imgDefault: "/images/subidas/sin_imagen.jpg", callback: async (file, dom)=>{
            let ret = await imagine.uploadFile({nombre: "imagen.jpg", archivo: file});
            imagine.setValues(dom, "/images/subidas/" + ret);
        }});

        this.lista_iconos = [
            {clase: "fas fa-circle", nombre: "Circulo"},
            {clase: "fab fa-facebook", nombre: "Facebook"},
            {clase: "fab fa-instagram", nombre: "Instagram"},
            {clase: "fab fa-whatsapp", nombre: "Whatsapp"},
            {clase: "fas fa-comment", nombre: "Comentario"},
            {clase: "fas fa-bomb", nombre: "Bomba"},
            {clase: "fas fa-poo", nombre: "poo"},
            {clase: "fas fa-paperclip", nombre: "Clip"},
            {clase: "fas fa-circle-exclamation", nombre: "Exclamación circulo"},
            {clase: "fas fa-triangle-exclamation", nombre: "Exclamación triangulo"},
            {clase: "fas fa-city", nombre: "Ciudad"},
            {clase: "fas fa-fire", nombre: "Fuego"},
            {clase: "fas fa-star", nombre: "Estrella"},
            {clase: "fas fa-cloud-rain", nombre: "Nube lluvia"},
            {clase: "fas fa-heart", nombre: "Corazón"},
        ];
        $("[name='icono']").html(g.getOptions({ar: this.lista_iconos, propText: "nombre", propId: "clase", optionDisabled: true}));
        $("[name='icono']").change(ev=>{
            $("#label-icono").html("<i class='" + $(ev.currentTarget).val() + "'></i>" )
        });

        $("[name='color']").change(ev=>{
            let c = $(ev.currentTarget).val();
            console.log(c);
            $("#label-color").html( `<i class="fas fa-circle ${c}"></i>` );
        });
        

        this.crud = new SimpleCRUD({
            list: [],
            searchProps: ["texto"],
            structure: [
                {
                    label: "Texto",
                    prop: "texto"
                }
            ],
            beforeSelect: async item =>{
            },
            afterSelect: (item) => {
                imagine.setValues(null, ["/images/subidas/" + (item.imagen || "sin_imagen.jpg")]);
                $("[name='icono']").change();
                $("[name='color']").change();
            },
            afterClear: () =>{
                imagine.clearValues();
            }
        });
        

        $("[crud='btNew']").click(()=>{
            this.crud.onNew();
            if(g.mobile){ $("[tab-ref='datos']").click(); }
            $("[name='tipo_publicacion']").val(0);
            $("[name='tipo_referencia']").val(0);
            $("[name='vencimiento']").val( fechas.toInputDate() );
            $("[name='icono']").val( "fas fa-circle" );
            $("[name='color']").val( "text-dark bg-light" );
            $("[name='prioridad']").val( "3" );
            $("[name='activo']").val( "1" );
        });
        $("[crud='btModify']").click(()=>{
            if(typeof this.crud.element == "undefined"){modal.mensaje("Seleccione un item para realizar esta acción");return;}
            this.crud.onModify();
            if(g.mobile){ $("[tab-ref='datos']").click(); }
        });
        $("[crud='btDelete']").click(()=>{
            if(typeof this.crud.element == "undefined"){modal.mensaje("Seleccione un item para realizar esta acción");return;}
            this.onDelete();
        });

        $("[crud='btSave']").click(()=>{
            if(this.bandera == false){
                this.bandera = true;
                this.onSave();
            }
        });

        $("[tab-ref]").click(ev=>{
            let ref = $(ev.currentTarget).attr("tab-ref");
            $("[tab]").addClass("d-none");
            $("[tab='" + ref + "']").removeClass("d-none");
        })
        
        $("[name='btSeleccionarReferencia']").click(()=>{
            let tipo = $("[name='tipo_referencia']").val();
            console.log(tipo);
            let lista = [];
            let prop = ""
            if(tipo == "noticia"){ lista = "noticias"; prop = "titulo"; }
            else if(tipo == "evento"){ lista = "eventos"; prop = "nombre"; }
            else if(tipo == "poi"){ lista = "pois"; prop = "nombre"; }
            else{ modal.mensaje("...Nada que seleccionar"); return;}
            g.seleccionarObjeto(lista, prop, e =>{
                console.log(e)
                let fx = new Date();
                fx = fx.getDate() + "-" + fechas.MONTH_NAME[fx.getMonth()]
                let img = "/images/subidas/" + (Array.isArray(e.imagenes) ? e.imagenes[0] : JSON.parse(e.imagenes)[0]);
                if(tipo == "noticia"){
                    $("[name='texto']").val(e.titulo.substring(0,100));
                    $("[name='enlace']").val("/noticia/" + e.url);
                    imagine.setValues(null, [img]);
                }else if(tipo == "evento"){
                    $("[name='texto']").val(e.nombre.substring(0,100));
                    $("[name='enlace']").val("/evento/" + e.url);
                    imagine.setValues(null, [img]);
                }else if(tipo == "poi"){
                    $("[name='texto']").val(e.nombre.substring(0,100));
                    $("[name='enlace']").val("/guia-comercial/comercio/" + e.url);
                    imagine.setValues(null, [img]);
                }
            });
        });

        this.crud.setTable($("#container-main-table"));
        this.crud.list = await this.getListado();
        this.crud.search();
        this.crud.inicialize();
        if(g.mobile == false){ $("[tab-ref]").prop("disabled", true); }
        
        g.closeCortina();
    }
    async getListado(){
        let ret = await g.safeQuery({q: "Marquesina.selectLast100"});
        ret.result.forEach(item=>{
            item.texto = g.bd_to_str(item.texto)
        });
        return ret.result;
    }
    async onSave() {
        let data = this.crud.getDataToSave();
        if(!data.tipo_publicacion || data.tipo_publicacion == 0){modal.mensaje("Tipo de publicación no válido"); this.bandera = false; return;}
        if(data.texto.length < 3){ modal.mensaje("Texto no válido"); this.bandera = false; return;}
        data.imagen = imagine.getValues()[0];

        if (this.crud.isNew) {
            let ret1 = await g.safeQuery({
                q:"Marquesina.insert",
                tipo_publicacion: data.tipo_publicacion, 
                tipo_referencia: data.tipo_referencia, 
                referencia: 0, 
                texto: g.str_to_bd(data.texto), 
                enlace: data.enlace, 
                imagen: data.imagen, 
                vencimiento: data.vencimiento, 
                icono: data.icono, 
                color: data.color, 
                activo: data.activo, 
                prioridad: data.prioridad, 
            });
            console.log(ret1);
            data.id = ret1.result.insertId;
            modal.mensaje("Publicación marquesina creada con éxito");
        }else{
            let ret1 = await g.safeQuery({
                q: "Marquesina.update", 
                tipo_publicacion: data.tipo_publicacion, 
                tipo_referencia: data.tipo_referencia, 
                referencia: 0, 
                texto: g.str_to_bd(data.texto), 
                enlace: data.enlace, 
                imagen: data.imagen, 
                vencimiento: data.vencimiento, 
                icono: data.icono, 
                color: data.color, 
                activo: data.activo, 
                prioridad: data.prioridad, 
                id: data.id
            });
            modal.mensaje("Publicación marquesina modificada con éxito");
        }
        this.crud.afterSave(data);
        $("[tab-ref='listado']").click();
        this.bandera = false;
        return true;
    }
    async onDelete() {
        if(await modal.pregunta(`¿Seguro de borrar el item seleccionado?`)){
            let ret1 = await g.safeQuery({q: "Marquesina.delete", id: this.crud.element.id});
            this.crud.removeSelected();
        }
    }

}