class AdminEventos{
    constructor(){
        this.ck = undefined;
        this._ck = false;
        this.bandera = false;
    }
    async ini(){
        
        this.ck = await g.waitCKEDITOR('detalle', {extraPlugins: "youtube,colorbutton"});
        this._ck = true;
        this.ck.setReadOnly(true);
        
        
        imagine.domUploader({dom: $(".imagen"), resizeOnChange: true, imgDefault: "/images/subidas/sin_imagen.jpg", callback: async (file, dom)=>{
            let ret = await imagine.uploadFile({nombre: "imagen.jpg", archivo: file});
            imagine.setValues(dom, "/images/subidas/" + ret);
        }});
        
        $("[name='categoria']").html( g.getOptions({ar: CATEGORIAS_EVENTOS, propText: "label", propId: "id", optionDisabled: true}) );
        
        
        this.crud = new SimpleCRUD({
            list: [],
            searchProps: ["nombre"],
            structure: [
                {
                    label: "Nombre",
                    prop: "nombre"
                }
            ],
            beforeSelect: async item =>{
                console.log(item);
                let nx = await g.safeQuery({q: "Eventos.getById", id: item.id});
                this.parseEvento(nx.result[0]);
                Object.assign(item, nx.result[0]);
            },
            afterSelect: (item) => {
                let _imgs = [];
                item.imagenes.forEach(img=>{
                    _imgs.push("/images/subidas/" + (img || "sin_imagen.jpg"));
                });
                this.agregarFecha(item.fechas);
                eventos.crud.setEnableFields(false);//bloqueo las fechas
                
                imagine.setValues(null, _imgs);
                if(typeof this.ck != "undefined" && this.ck.applicationTitle){ 
                    this.ck.setReadOnly(true);
                    $("[name='llenar_detalle']").prop("disabled", false);
                }
            },
            afterClear: () =>{
                this.limpiarFechas();
                imagine.clearValues();
                if(this.ck && this.ck.applicationTitle){ this.ck.setReadOnly(true); this.ck.setData(""); }
            }
        });
        

        $("[crud='btNew']").click(()=>{
            this.crud.onNew();
            if(g.mobile){ $("[tab-ref='datos']").click(); }
            $("[name='categoria']").val(0);
            $("[name='marquesina']").val(0);
            $("[name='principal']").val(0);
            $("[name='activo']").val(1);
            $("[name='suspendido']").val(0);
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
            let url = g.getUrl(this.crud.element.id, this.crud.element.nombre)
            window.open("https://roqueperezhoy.com.ar/evento/" + url, "_blank")
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
            if(this.crud.element && this.ck){ this.ck.setData(this.crud.element.detalle); }
        })
        
        $("[name='llenar_detalle']").click(ev=>{
            if(!this.crud.element){ return }
            this.ck.setData(this.crud.element.detalle); 
        });
        $("[name='habilitar_detalle']").click(ev=>{
            this.ck.setReadOnly(false);
        });

        $("[name='btAgregarFecha']").click(()=>{
            this.agregarFecha(null);
        });
        
        this.crud.setTable($("#container-main-table"));
        this.crud.list = await this.getListado();
        this.crud.search();
        this.crud.inicialize();
        if(g.mobile == false){ $("[tab-ref]").prop("disabled", true); }
        
        $("[name='subir_foto']").click(()=>{
            this.subir_foto();
        });

        g.closeCortina();
    }
    async getListado(){
        let ret = await g.safeQuery({q: "Eventos.selectLast100"});
        return this.parseEvento(ret.result);
    }
    async getEvento(id){
        let ret = await g.safeQuery({q:"Eventos.getById", id});
        return this.parseEvento(ret.result);
    }
    parseEvento(e){
        let esArray = Array.isArray(e);
        if(!esArray){e = [e];}

        e.forEach(item=>{
            item.id = parseInt(item.id);
            if(item.nombre){item.nombre = g.bd_to_str(item.nombre);}
            if(item.imagenes){item.imagenes = JSON.parse(item.imagenes);}
            if(item.fechas){item.fechas = JSON.parse(item.fechas);}
            if(item.detalle){item.detalle = g.bd_to_str(item.detalle, true);}
        });
        return esArray ? e : e[0]; 
    }
    async onSave() {
        let data = this.crud.getDataToSave();
        if(data.nombre.length < 3){modal.mensaje("Nombre no válido"); this.bandera = false; return;}
        if(!data.categoria){modal.mensaje("Categoría no válido"); this.bandera = false; return;}
        data.precio = parseInt(data.precio);
        if(!data.precio || data.precio < 0) data.precio = 0;
        
        data.poi = -1;
        data.imagenes = imagine.getValues();
        data.detalle = this.ck.getData().trim();
        if(data.detalle.length < 3){modal.mensaje("Detalle no válido"); this.bandera = false; return;}
        data.fechas = this.getFechas();
        if(data.fechas.length == 0){modal.mensaje("El evento debe contener al menos 1 fecha"); this.bandera = false; return;}
        if (this.crud.isNew) {
            let ret1 = await g.safeQuery({
                q:"Eventos.insert", 
                nombre: g.str_to_bd(data.nombre),
                poi: data.poi,
                precio: data.precio,
                fechas: JSON.stringify(data.fechas),
                _fecha_inicio: data.fechas[0],
                _fecha_fin: data.fechas.at(-1),
                detalle: g.str_to_bd(data.detalle, true),
                imagenes: JSON.stringify(data.imagenes),
                categoria: data.categoria,
                activo: data.activo,
                marquesina: data.marquesina,
                principal: data.principal,
                suspendido: data.suspendido,
            });
            console.log(ret1);
            data.id = ret1.result.insertId;
            modal.mensaje("Evento creado con éxito");
        } else {
            let ret1 = await g.safeQuery({
                q: "Eventos.update", 
                nombre: g.str_to_bd(data.nombre),
                poi: data.poi,
                precio: data.precio,
                fechas: JSON.stringify(data.fechas),
                _fecha_inicio: data.fechas[0],
                _fecha_fin: data.fechas.at(-1),
                detalle: g.str_to_bd(data.detalle, true),
                imagenes: JSON.stringify(data.imagenes),
                categoria: data.categoria,
                activo: data.activo,
                marquesina: data.marquesina,
                principal: data.principal,
                suspendido: data.suspendido,
                id: data.id
            });
            modal.mensaje("Evento modificado con éxito");
        }
        g.exec("set_url", {tabla: "evento", _url: g.getUrl(data.id, data.nombre), id: data.id});
        this.crud.afterSave(data);
        $("[tab-ref='listado']").click();
        this.bandera = false;
        return true;
    }
    async onDelete() {
        if(await modal.pregunta(`¿Seguro de borrar el evento <b>${this.crud.element.nombre}</b>?`)){
            let ret1 = await g.safeQuery({q: "Eventos.delete", id: this.crud.element.id});
            this.crud.removeSelected();
        }
    }

    getFechas(){
        let ret = [];
        $("[name='fechas'] tbody input").each((index, ev)=>{
            let v = $(ev).val();
            if(v){ret.push(v)}
        });
        return ret;
    }
    agregarFecha(ar, limpiar = false){
        if(limpiar){ this.limpiarFechas(); }
        
        if(ar == null){ ar = [fechas.toInputDatetime()]; }
        let foo = "";
        ar.forEach(item=>{
            item = fechas.toInputDatetime(item);
            foo += `<tr>
                        <td>
                            <input type='datetime-local' name="" class="form-control form-control-sm" value="${item}">
                        </td>
                        <td>
                            <button class="btn btn-danger btn-sm"  name=""><i class="fas fa-times"></i></button>
                        </td>
                    </tr>`;
        });
        $("[name='fechas'] tbody").append(foo);

        $("[name='fechas'] tbody button").unbind("click");
        $("[name='fechas'] tbody button").click(ev=>{
            if(confirm("¿Seguro de quitar esta fecha?")){
                $(ev.currentTarget).parent().parent().remove();
            }
        });
    }
    limpiarFechas(){
        $("[name='fechas'] tbody").html("");
    }
}