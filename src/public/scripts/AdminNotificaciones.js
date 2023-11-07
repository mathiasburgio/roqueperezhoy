class AdminNotificaciones{
    constructor(){
        this.bandera = false;
    }
    async ini(){
        await g.cargar_listados(false, true, true);        
        
        imagine.domUploader({dom: $(".imagen"), resizeOnChange: true, imgDefault: "/images/subidas/sin_imagen.jpg", callback: async (file, dom)=>{
            let ret = await imagine.uploadFile({nombre: "imagen.jpg", archivo: file});
            imagine.setValues(dom, "/images/subidas/" + ret);
        }});
       
        this.crud = new SimpleCRUD({
            list: [],
            searchProps: ["titulo"],
            structure: [
                {
                    label: "Título",
                    prop: "titulo"
                },
                {
                    label: "Enviado",
                    prop: "enviado",
                    right: true,
                    fn: (e, f) =>{
                        return `<span class='badge badge-info'>${parseInt(f.fue_enviado) ? fechas.parse({val: e, formato: fechas.FORMATO.ARG_FECHA_HORA}) : "-"}</span>`;
                    }
                }
            ],
            beforeSelect: async item =>{
            },
            afterSelect: (item) => {
                imagine.setValues(null, ["/images/subidas/" + (item.imagen || "sin_imagen.jpg")]);
            },
            afterClear: () =>{
                imagine.clearValues();
            }
        });
        

        $("[crud='btNew']").click(()=>{
            this.crud.onNew();
            if(g.mobile){ $("[tab-ref='datos']").click(); }
            $("[name='tipo_referencia']").val(0);
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
                    $("[name='titulo']").val(e.titulo.substring(0,100));
                    $("[name='cuerpo']").val( g.stripTags(e.bajada) );
                    $("[name='url']").val("noticia/" + e.url);
                    imagine.setValues(null, [img]);
                }else if(tipo == "evento"){
                    $("[name='titulo']").val(e.nombre.substring(0,100));
                    $("[name='cuerpo']").val( g.stripTags(e.detalle) );
                    $("[name='url']").val("evento/" + e.url);
                    imagine.setValues(null, [img]);
                }else if(tipo == "poi"){
                    $("[name='titulo']").val(e.nombre.substring(0,100));
                    $("[name='cuerpo']").val( g.stripTags(e.detalle) );
                    $("[name='url']").val("comercio/" + e.url);
                    imagine.setValues(null, [img]);
                }
            });
        });


        $("[name='btEnviar']").click(ev=>{
            if(!this.crud.element) return
            if(parseInt(this.crud.element.fue_enviado)){ modal.mensaje("Esta notificacion ya ha sido enviada"); return; }
            
            modal.mostrar({
                titulo: "Notificación",
                cuerpo: "¿Seguro de enviar la notificacion?",
                botones: "no/si",
                fnOcultar2: e =>{
                    if(e){
                        g.exec("send_notification", {id: this.crud.element.id});
                        this.crud.element.fue_enviado = 1;
                        this.crud.element.enviado = new Date();
                        this.crud.updateTableRow();
                    }
                }
            })
            //
        });
        
        this.crud.setTable($("#container-main-table"));
        this.crud.list = await this.getListado();
        this.crud.search();
        this.crud.inicialize();
        if(g.mobile == false){ $("[tab-ref]").prop("disabled", true); }
      
        g.closeCortina();
    }
    async getListado(){
        let ret = await g.safeQuery({q: "Notificaciones.getLast200"});
        ret.result.forEach(item=>{
            item.titulo = g.bd_to_str(item.titulo);
            item.cuerpo = g.bd_to_str(item.cuerpo);
        });
        return ret.result;
    }
    async onSave() {
        let data = this.crud.getDataToSave();
        if(data.titulo.length < 3){modal.mensaje("Título no válido"); this.bandera = false; return;}
        
        data.imagen = imagine.getValues()[0];

        if (this.crud.isNew) {
            let ret1 = await g.safeQuery({
                q: "Notificaciones.insert", 
                titulo: g.str_to_bd(data.titulo),
                cuerpo: g.str_to_bd(data.cuerpo),
                imagen: data.imagen,
                url: data.url
            });
            console.log(ret1);
            data.id = ret1.result.insertId;
            modal.mensaje("Notificacion creada con éxito");
        }
        data.fue_enviado = 0;
        this.crud.afterSave(data);
        $("[tab-ref='listado']").click();
        this.bandera = false;
        return true;
    }
    
}