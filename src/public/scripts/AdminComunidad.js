class AdminComunidad{
    constructor(){
        this.ck = undefined;
        this._ck = false;
        this.bandera = false;
        this.poi = null;
    }
    async ini(){
        await g.cargar_listados(true, false, false);

        this.ck = await g.waitCKEDITOR('detalle', {extraPlugins: "youtube,colorbutton"});
        this._ck = true;
        this.ck.setReadOnly(true);
        
        
        imagine.domUploader({dom: $(".imagen"), resizeOnChange: true, imgDefault: "/images/subidas/sin_imagen.jpg", callback: async (file, dom)=>{
            let ret = await imagine.uploadFile({nombre: "imagen.jpg", archivo: file});
            imagine.setValues(dom, "/images/subidas/" + ret);
        }});
        
        this.crud = new SimpleCRUD({
            list: [],
            searchProps: ["nombre"],
            structure: [
                {
                    label: "Nombre",
                    prop: "nombre"
                },
                {
                    label: "Clicks",
                    prop: "clicks",
                    right: true
                }
            ],
            afterSelect: async (item) => {
                this.poi = await g.getPoi(item.poi);
                $("[name='_poi']").val(this.poi ? this.poi.nombre : "");
                imagine.setValues(null, ["/images/subidas/" + item.imagen]);
                if(this.ck && this.ck.applicationTitle){ 
                    this.ck.setReadOnly(true);
                }
            },
            afterClear: () =>{
                imagine.clearValues();
                if(this.ck && this.ck.applicationTitle){ this.ck.setReadOnly(true); this.ck.setData(""); }
            }
        });
        

        $("[crud='btNew']").click(()=>{
            this.crud.onNew();
            this.poi = null;
            if(g.mobile){ $("[tab-ref='datos']").click(); }
            $("[name='boton']").val(0);
            $("[name='activo']").val(1);
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
        $("[crud='btSave']").click(()=>{
            if(this.bandera == false){
                this.bandera = true;
                this.onSave();
            }
        });

        $("[crud='btAbrir']").click(()=>{
            if(typeof this.crud.element == "undefined"){modal.mensaje("Seleccione un item para realizar esta acción");return;}
            let url = g.getUrl(this.crud.element.id, this.crud.element.nombre)
            window.open("https://roqueperezhoy.com.ar/comunidad/" + url, "_blank")
        });

        $("[tab-ref]").click(ev=>{
            let ref = $(ev.currentTarget).attr("tab-ref");
            $("[tab]").addClass("d-none");
            $("[tab='" + ref + "']").removeClass("d-none");
            if(this.crud.element && this.ck){ this.ck.setData(this.crud.element.detalle); }
        })
        
        $("[name='llenar_detalle']").click(ev=>{
            this.ck.setData(this.crud.element.detalle); 
        });
        $("[name='habilitar_detalle']").click(ev=>{
            this.ck.setReadOnly(false);
        });

        $("[name='btSeleccionarPoi']").click(()=>{
            g.seleccionarObjeto("pois", "nombre", e=>{
                console.log(e);
                
                this.poi = e;
                $("[name='_poi']").val(e ? e.nombre : "");
                $("[name='nombre']").val(e ? e.nombre : "");
                this.ck.setData(e.detalle);
                let img = "/images/subidas/" + (Array.isArray(e.imagenes) ? e.imagenes[0] : JSON.parse(e.imagenes)[0]);
                imagine.setValues(null, [img]);
            })
        });
        
        this.crud.setTable($("#container-main-table"));
        this.crud.list = await this.getListado();
        this.crud.search();
        this.crud.inicialize();
        if(g.mobile == false){ $("[tab-ref]").prop("disabled", true); }

        g.closeCortina();
    }
    async getListado(){
        let ret = await g.safeQuery({q: "Muro.selectLast100"});
        ret.result.forEach(p=>{
            p.nombre = g.bd_to_str(p.nombre);
            p.detalle = g.bd_to_str(p.detalle, true);
        });
        return ret.result;
    }
    
    async onSave() {
        let data = this.crud.getDataToSave();
        if(data.nombre.length < 3){modal.mensaje("Nombre no válido"); this.bandera = false; return;}
        if(data.boton == 0){modal.mensaje("Botón no válido"); this.bandera = false; return;}
        data.imagen = imagine.getValues()[0];
        data.detalle = this.ck.getData().trim();

        if (this.crud.isNew) {
            let ret1 = await g.safeQuery({
                q:"Muro.insert", 
                nombre: g.str_to_bd(data.nombre),
                poi: this.poi ? this.poi.id : 0,
                detalle: g.str_to_bd(data.detalle, true),
                imagen: data.imagen,
                boton: data.boton,
                activo: data.activo,

            });
            console.log(ret1);
            data.id = ret1.result.insertId;
            data.clicks = 0;
            data.compartido = 0;
            modal.mensaje("Publicación creada con éxito");
        } else {
            let ret1 = await g.safeQuery({
                q: "Muro.update", 
                nombre: g.str_to_bd(data.nombre),
                poi: this.poi ? this.poi.id : 0,
                detalle: g.str_to_bd(data.detalle, true),
                imagen: data.imagen,
                boton: data.boton,
                activo: data.activo,
                id: data.id
            });
            modal.mensaje("Publicación modificada con éxito");
        }
        g.exec("set_url", {tabla: "publicacion_muro", _url: g.getUrl(data.id, data.nombre), id: data.id});
        this.crud.afterSave(data);
        $("[tab-ref='listado']").click();
        this.bandera = false;
        return true;
    }
    async onDelete() {
        if(await modal.pregunta(`¿Seguro de borrar la publicación <b>${this.crud.element.nombre}</b>?`)){
            let ret1 = await g.safeQuery({q: "Muro.delete", id: this.crud.element.id});
            this.crud.removeSelected();
        }
    }
}