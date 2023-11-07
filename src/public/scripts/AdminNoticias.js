class AdminNoticias{
    constructor(){
        this.ck = undefined;
        this._ck = false;
        this.bandera = false;
    }
    async ini(){
        
        this.ck = await g.waitCKEDITOR('detalle', {extraPlugins: "youtube,colorbutton, _publi"});
        this._ck = true;
        this.ck.setReadOnly(true);
        
        imagine.domUploader({dom: $(".imagen"), resizeOnChange: true, imgDefault: "/images/subidas/sin_imagen.jpg", callback: async (file, dom)=>{
            let ret = await imagine.uploadFile({nombre: "imagen.jpg", archivo: file});
            imagine.setValues(dom, "/images/subidas/" + ret);
        }});
        
        $("[name='categoria']").html( g.getOptions({ar: CATEGORIAS_NOTICIAS, propText: "label", propId: "id", optionDisabled: true}) );
        
        
        this.crud = new SimpleCRUD({
            list: [],
            searchProps: ["titulo"],
            structure: [
                {
                    label: "Fecha",
                    prop: "fecha",
                    fn: e=>{
                        let fx = fechas.parse({val: e, formato: fechas.FORMATO.ARG_FECHA_HORA});
                        return "<small>" + fx + "</small>"; 
                    }
                },
                {
                    label: "Título",
                    prop: "titulo"
                }
            ],
            beforeSelect: async item =>{
                console.log(item);
                let nx = await g.safeQuery({q: "Noticias.getById", id: item.id});
                this.parseNoticia(nx.result[0]);
                Object.assign(item, nx.result[0]);
                console.log(nx);
                
            },
            afterSelect: (item) => {
                let _imgs = [];
                item.imagenes.forEach(img=>{
                    _imgs.push("/images/subidas/" + (img || "sin_imagen.jpg"));
                });
                imagine.setValues(null, _imgs);
                $("[name='fecha']").val( fechas.toInputDatetime( item.fecha ) );
                if(this.ck && this.ck.applicationTitle){ 
                    this.ck.setReadOnly(true);
                    $("[name='llenar_detalle']").prop("disabled", false);
                }
            },
            afterClear: () =>{
                imagine.clearValues();
                if(this.ck && this.ck.applicationTitle){ this.ck.setReadOnly(true); this.ck.setData(""); }
            }
        });
        

        $("[crud='btNew']").click(()=>{
            this.crud.onNew();
            if(g.mobile){ $("[tab-ref='datos']").click(); }
            $("[name='fecha']").val( fechas.toInputDatetime() );
            $("[name='categoria']").val(0);
            $("[name='marquesina']").val(0);
            $("[name='principal']").val(0);
            $("[name='activa']").val(1);
            if(this.ck && this.ck.applicationTitle){ this.ck.setReadOnly(false); }
        });
        $("[crud='btModify']").click(()=>{
            if(typeof this.crud.element == "undefined"){modal.mensaje("Seleccione un item para realizar esta acción");return;}
            this.crud.onModify();
            if(g.mobile){ $("[tab-ref='datos']").click(); }
            if(this.ck && this.ck.applicationTitle){ this.ck.setReadOnly(false); }
        });
        $("[crud='btDelete']").click(()=>{
            if(typeof this.crud.element == "undefined"){modal.mensaje("Seleccione un item para realizar esta acción");return;}
            this.onDelete();
        });
        $("[crud='btAbrir']").click(()=>{
            if(typeof this.crud.element == "undefined"){modal.mensaje("Seleccione un item para realizar esta acción");return;}
            let url = g.getUrl(this.crud.element.id, this.crud.element.titulo)
            window.open("https://roqueperezhoy.com.ar/noticia/" + url, "_blank")
        });
        $("[crud='btSave']").click(()=>{
            if(this.bandera == false){
                this.bandera = true;
                this.onSave();
            }
        });

        $("[crud='txSearch']").keyup(async (ev)=>{
            if(ev.keyCode == 13){
                let v = $(ev.currentTarget).val();
                this.crud.list = await this.buscar(v);
                this.crud.search();
            }
        });

        $("[tab-ref]").click(ev=>{
            let ref = $(ev.currentTarget).attr("tab-ref");
            $("[tab]").addClass("d-none");
            $("[tab='" + ref + "']").removeClass("d-none");
            if(this.crud.element && this.ck){ this.ck.setData(this.crud.element.detalle); }
        })
        
        $("[name='llenar_detalle']").click(ev=>{
            if(!this.crud.element){ return }
            this.ck.setData(this.crud.element.detalle); 
        });
        $("[name='habilitar_detalle']").click(ev=>{
            this.ck.setReadOnly(false);
        });
        
        this.crud.setTable($("#container-main-table"));
        this.crud.list = await this.getListado();
        this.crud.search();
        this.crud.inicialize();
        if(g.mobile == false){ $("[tab-ref]").prop("disabled", true); }
        
        $("[name='subir_foto']").click(()=>{
            this.subir_foto();
        });
        
        $("[name='subir_fotov2']").click(()=>{
            g.subirImagenV2();
        });

        g.closeCortina();
    }
    async getListado(){
        let ret = await g.safeQuery({q: "Noticias.selectLast100"});
        return this.parseNoticia(ret.result);
    }
    async getNoticia(id){
        let ret = await g.safeQuery({q:"Noticias.getById", id});
        return this.parseNoticia(ret.result);
    }
    async buscar(titulo){
        let ret = await g.safeQuery({q: "Noticias.getByTitulo", titulo});
        return this.parseNoticia(ret.result);
    }
    parseNoticia(e){
        let esArray = Array.isArray(e);
        if(!esArray){e = [e];}

        e.forEach(item=>{
            item.id = parseInt(item.id);
            item.titulo = g.bd_to_str(item.titulo)
            item.bajada = g.bd_to_str(item.bajada)
            item.pie_de_foto = g.bd_to_str(item.pie_de_foto)
            item.imagenes = JSON.parse(item.imagenes);
            item.detalle = g.bd_to_str(item.detalle, true);
            item.activa = parseInt(item.activa);
        });
        return esArray ? e : e[0]; 
    }
    async onSave() {
        let data = this.crud.getDataToSave();
        if(data.titulo.length < 3){modal.mensaje("Título no válido"); this.bandera = false; return;}
        if(!data.categoria){modal.mensaje("Categoría no válido"); this.bandera = false; return;}
        
        data.imagenes = imagine.getValues();
        data.detalle = this.ck.getData().trim();
        if(data.detalle.length < 3){modal.mensaje("Detalle no válido"); this.bandera = false; return;}

        data.tags = data.tags.split(";").map(t=>g.onlyAlphanumeric(t, true)).join(";")
        
        if (this.crud.isNew) {
            let ret1 = await g.safeQuery({
                q:"Noticias.insert", 
                titulo: g.str_to_bd(data.titulo),
                bajada: g.str_to_bd(data.bajada),
                fecha: data.fecha,
                detalle: g.str_to_bd(data.detalle, true),
                imagenes: JSON.stringify(data.imagenes),
                pie_de_foto: g.str_to_bd(data.pie_de_foto),
                video: data.video,
                categoria: data.categoria,
                tags: data.tags,
                autor: data.autor,
                fuente: data.fuente,
                activa: data.activa,
                marquesina: data.marquesina,
                principal: data.principal
            });
            console.log(ret1);
            data.id = ret1.result.insertId;
            
            modal.mensaje("Noticia creada con éxito");
        } else {
            let ret1 = await g.safeQuery({
                q: "Noticias.update", 
                titulo: g.str_to_bd(data.titulo),
                bajada: g.str_to_bd(data.bajada),
                fecha: data.fecha,
                detalle: g.str_to_bd(data.detalle, true),
                imagenes: JSON.stringify(data.imagenes),
                pie_de_foto: g.str_to_bd(data.pie_de_foto),
                video: data.video,
                categoria: data.categoria,
                tags: data.tags,
                autor: data.autor,
                fuente: data.fuente,
                activa: data.activa,
                marquesina: data.marquesina,
                principal: data.principal,
                id: data.id
            });
            modal.mensaje("Noticia modificada con éxito");
        }
        this.crud.afterSave(data);
        g.exec("set_url", {tabla: "noticia", _url: g.getUrl(data.id, data.titulo), id: data.id});
        $("[tab-ref='listado']").click();
        this.bandera = false;
        return true;
    }
    async onDelete() {
        if(await modal.pregunta(`¿Seguro de borrar la noticia <b>${this.crud.element.titulo}</b>?`)){
            let ret1 = await g.safeQuery({q: "Noticias.delete", id: this.crud.element.id});
            this.crud.removeSelected();
        }
    }

    subir_foto(){

        modal.mostrar({
            titulo: "Subir foto",
            cuerpo: `<div name='imagen-modal'></div><input class=" mt-3 form-control" type="text" readonly>`,
            botones: "volver"
        });

        let imagine2 = new Imagine();
        imagine2.domUploader({dom: $("#modal [name='imagen-modal']"), width:"250px", height:"250px", resizeOnChange: true, imgDefault: "/images/subidas/sin_imagen.jpg", callback: async (file, dom)=>{
            let ret = await imagine.uploadFile({nombre: "imagen.jpg", archivo: file});
            imagine2.setValues(dom, "/images/subidas/" + ret);
            $("#modal [type='text']").val( "https://roqueperezhoy.com.ar/images/subidas/" + ret );
        }});

        $("#modal [type='text']").click(ev=>{
            let v = $(ev.currentTarget).val();
            if(v != ""){
                navigator.clipboard.writeText(v);
                modal.ocultar();
            }
        })
    }
}