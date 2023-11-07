class AdminTelefonosUtiles{
    constructor(){
        this.bandera = false;
        this._poi = null;
    }
    async ini(){
        await g.cargar_listados(true, false, false);    
    
        this.crud = new SimpleCRUD({
            list: [],
            searchProps: ["id"],
            structure: [
                {
                    label: "Nombre",
                    prop: "nombre"
                },
                {
                    label: "Nota",
                    prop: "nota",
                    fn: e =>{
                        if(e){
                            return "<span class='badge badge-info'>Si</span>";
                        }
                        return "";
                    }
                }
            ],
            afterSelect: (item) => {
                this.agregarDatoDeContacto(item.datos_de_contacto);
                this.crud.setEnableFields(false);//bloqueo las fechas
                $("[name='_poi']").val(item._poi ? item._poi.nombre : "");
                this._poi = item._poi;
            },
            afterClear: () =>{
                this.limpiarDatosDeContacto();
                this._poi = null;
            }
        });
        

        $("[crud='btNew']").click(()=>{
            this.crud.onNew();
            if(g.mobile){ $("[tab-ref='datos']").click(); }
            $("[name='activo']").val(1);
            this._poi = null;
        });
        $("[crud='btModify']").click(()=>{
            if(typeof this.crud.element == "undefined"){modal.mensaje("Seleccione un item para realizar esta acción");return;}
            this.crud.onModify();
            if(g.mobile){ $("[tab-ref='datos']").click(); }
            $("[name='btSeleccionarPoi']").prop("disabled", true);
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

        $("[name='btAgregarDatoDeContacto']").click(()=>{
            this.agregarDatoDeContacto(null);
        });

        $("[name='btSeleccionarPoi']").click((ev)=>{
            g.seleccionarObjeto("pois", "nombre", e =>{
                console.log(e)
                this._poi = e;
                $("[name='_poi']").val("");
                if(e){
                    $("[name='_poi']").val(e.nombre);
                    $("[name='nombre']").val(e.nombre);
                    if(typeof e.datos_de_contacto == "string"){e.datos_de_contacto = JSON.parse(e.datos_de_contacto);}
                    let mapa = [];
                    e.datos_de_contacto.map(dc=>{
                        mapa.push( [""].concat(dc) );
                    },mapa);
                    this.agregarDatoDeContacto(mapa);
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
        let ret = await g.safeQuery({q: "TelefonosUtiles.selectAll"});
        ret.result.forEach(async item=>{
            item.id = parseInt(item.id);
            item.nombre = g.bd_to_str(item.nombre)
            item.nota = g.bd_to_str(item.nota)
            item.datos_de_contacto = JSON.parse(item.datos_de_contacto);
            item._poi = g._listados.pois.find(p=>p.id === item.poi)
        });
        return ret.result;
    }
    async onSave() {
        let data = this.crud.getDataToSave();
        
        data.poi = this._poi ? this._poi.id : -1;
        if(data.poi == -1){modal.mensaje("POI no válido"); this.bandera = false; return;}
        data._poi = this._poi;

        data.datos_de_contacto = this.getDatosDeContacto();
        if(data.datos_de_contacto.length == 0){modal.mensaje("Debe agregar al menos 1 dato de contacto"); this.bandera = false; return;}
        
        if (this.crud.isNew) {
            let ret1 = await g.safeQuery({
                q:"TelefonosUtiles.insert", 
                poi: data.poi,
                nombre: g.str_to_bd(data.nombre),
                nota: g.str_to_bd(data.nota),
                datos_de_contacto: JSON.stringify(data.datos_de_contacto),
                activo: data.activo,
            });
            console.log(ret1);
            data.id = ret1.result.insertId;
            modal.mensaje("Registro creado con éxito");
        } else {
            let ret1 = await g.safeQuery({
                q: "TelefonosUtiles.update", 
                poi: data.poi,
                nombre: g.str_to_bd(data.nombre),
                nota: g.str_to_bd(data.nota),
                datos_de_contacto: JSON.stringify(data.datos_de_contacto),
                activo: data.activo,
                id: data.id
            });
            modal.mensaje("Registro modificado con éxito");
        }
        this.crud.afterSave(data);
        $("[tab-ref='listado']").click();
        this.bandera = false;
        return true;
    }
    async onDelete() {
        if(await modal.pregunta(`¿Seguro de borrar el registro?`)){
            let ret1 = await g.safeQuery({q: "TelefonosUtiles.delete", id: this.crud.element.id});
            this.crud.removeSelected();
        }
    }
    getDatosDeContacto(){
        let ret = [];
        $("[name='datos_de_contacto'] tbody tr").each((index, ev)=>{
            ret.push([
                $(ev).find("input:eq(0)").val(),
                $(ev).find("select").val(),
                $(ev).find("input:eq(1)").val(),
            ]);
        });
        return ret;
    }
    agregarDatoDeContacto(ar, limpiar = false){
        if(limpiar){ this.limpiarDatosDeContacto(); }
        
        if(!ar){ ar = [["", "Teléfono", ""]]; }
        ar.forEach(item=>{
            let foo = ` <tr>
                            <td>
                                <input type='text' name="" class="form-control form-control-sm" placeholder="Departamento">
                            </td>
                            <td>
                                <select class='form-control form-control-sm' name="">
                                    <option value="Teléfono">Teléfono</option>
                                    <option value="Teléfono2">Teléfono (con Whatsapp)</option>
                                    <option value="Mail">Mail</option>
                                    <option value="Web">Web</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="Instagram">Instagram</option>
                                </select>
                            </td>
                            <td>
                                <input type='text' name="" class="form-control form-control-sm" placeholder="Valor">
                            </td>
                            <td>
                                <button class="btn btn-danger btn-sm" name=""><i class="fas fa-times"></i></button>
                            </td>
                        </tr>`;


            $("[name='datos_de_contacto'] tbody").append(foo);
            let tr = $("[name='datos_de_contacto'] tbody tr").last();
            tr.find("input:eq(0)").val(item[0]);
            tr.find("select:eq(0)").val(item[1]);
            tr.find("input:eq(1)").val(item[2]);
        });

        $("[name='datos_de_contacto'] tbody button").unbind("click");
        $("[name='datos_de_contacto'] tbody button").click(ev=>{
            if(confirm("¿Seguro de quitar el registro?")){
                $(ev.currentTarget).parent().parent().remove();
            }
        });
    }
    limpiarDatosDeContacto(){
        $("[name='datos_de_contacto'] tbody").html("");
    }
}