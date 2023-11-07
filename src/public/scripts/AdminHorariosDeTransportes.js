class AdminHorariosDeTransportes{
    constructor(){
        this.bandera = false;
        this._poi_transporte = null;
        this._poi_origen = null;
        this._poi_destino = null;
    }
    async ini(){
        await g.cargar_listados(true, false, false);
        
        imagine.domUploader({dom: $(".imagen"), resizeOnChange: true, imgDefault: "/images/subidas/sin_imagen.jpg", callback: async (file, dom)=>{
            let ret = await imagine.uploadFile({nombre: "imagen.jpg", archivo: file});
            imagine.setValues(dom, "/images/subidas/" + ret);
        }});
    
        this.crud = new SimpleCRUD({
            list: [],
            searchProps: ["origen"],
            structure: [
                {
                    label: "Transporte",
                    prop: "poi_transporte",
                    fn: (e, f) =>{
                        return f._poi_transporte ? f._poi_transporte.nombre : "???" 
                    }
                },
                {
                    label: "Origen",
                    prop: "origen"
                },
                {
                    label: "Destino",
                    prop: "destino"
                }
            ],
            afterSelect: (item) => {
                this.agregarFecha(item.dias_horarios);
                this.crud.setEnableFields(false);//bloqueo las fechas
                $("[name='_poi_transporte']").val(item._poi_transporte ? item._poi_transporte.nombre : "");
                $("[name='_poi_origen']").val(item._poi_origen ? item._poi_origen.nombre : "");
                $("[name='_poi_destino']").val(item._poi_destino ? item._poi_destino.nombre : "");
                this._poi_transporte = item._poi_transporte;
                this._poi_origen = item._poi_origen;
                this._poi_destino = item._poi_destino;
                
                imagine.setValues(null, ["/images/subidas/" +(item.imagen || "sin_imagen.jpg")]);
            },
            afterClear: () =>{
                this.limpiarFechas();
                this._poi_transporte = null;
                this._poi_origen = null;
                this._poi_destino = null;
                imagine.clearValues();
            }
        });
        

        $("[crud='btNew']").click(()=>{
            this.crud.onNew();
            if(g.mobile){ $("[tab-ref='datos']").click(); }
            $("[name='activo']").val(1);
            this._poi_transporte = null;
            this._poi_origen = null;
            this._poi_destino = null;
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

        $("[name='btAgregarFecha']").click(()=>{
            this.agregarFecha(null);
        });

        $("[name='btSeleccionarPoi']").click((ev)=>{
            let field = $(ev.currentTarget).attr("field");
            g.seleccionarObjeto("pois", "nombre", e =>{
                console.log(e);
                this[field] = e;
                $("[name='" + field + "']").val(e ? e.nombre : "");
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
        let ret = await g.safeQuery({q: "HorariosDeTransportes.selectAll"});
        ret.result.forEach(async item=>{
            item.id = parseInt(item.id);
            item.origen = g.bd_to_str(item.origen)
            item.destino = g.bd_to_str(item.destino)
            item.dias_horarios = JSON.parse(item.dias_horarios);
            item._poi_transporte = g._listados.pois.find(px=>px.id == item.poi_transporte);
            item._poi_origen = g._listados.pois.find(px=>px.id == item.poi_origen);
            item._poi_destino = g._listados.pois.find(px=>px.id == item.poi_destino);
        });
        return ret.result;
    }
    async onSave() {
        let data = this.crud.getDataToSave();
        
        data.poi_transporte = this._poi_transporte ? this._poi_transporte.id : -1;
        if(data.poi_transporte == -1){modal.mensaje("POI transporte no válido"); this.bandera = false; return;}
        data._poi_transporte = this._poi_transporte;

        data.poi_origen = this._poi_origen ? this._poi_origen.id : -1;
        //if(data.poi_origen == -1){modal.mensaje("POI origen no válido"); this.bandera = false; return;}
        data._poi_origen = this._poi_origen;

        data.poi_destino = this._poi_destino ? this._poi_destino.id : -1;
        //if(data.poi_destino == -1){modal.mensaje("POI destino no válido"); this.bandera = false; return;}
        data._poi_destino = this._poi_destino;

        data.dias_horarios = this.getFechas();
        if(data.dias_horarios.length == 0){modal.mensaje("Debe agregar al menos 1 fecha"); this.bandera = false; return;}
        
        if(data.origen.length == 0){modal.mensaje("Origen no puede quedar vacio"); this.bandera = false; return;}
        if(data.destino.length == 0){modal.mensaje("Destino no puede quedar vacio"); this.bandera = false; return;}
        data.imagen = imagine.getValues()[0];
        
        if (this.crud.isNew) {
            let ret1 = await g.safeQuery({
                q:"HorariosDeTransportes.insert", 
                poi_transporte: data.poi_transporte,
                origen: g.str_to_bd(data.origen),
                poi_origen: data.poi_origen,
                destino: g.str_to_bd(data.destino),
                poi_destino: data.poi_destino,
                dias_horarios: JSON.stringify(data.dias_horarios),
                imagen: data.imagen,
                activo: data.activo,
            });
            console.log(ret1);
            data.id = ret1.result.insertId;
            modal.mensaje("Registro creado con éxito");
        } else {
            let ret1 = await g.safeQuery({
                q: "HorariosDeTransportes.update", 
                poi_transporte: data.poi_transporte,
                origen: g.str_to_bd(data.origen),
                poi_origen: data.poi_origen,
                destino: g.str_to_bd(data.destino),
                poi_destino: data.poi_destino,
                dias_horarios: JSON.stringify(data.dias_horarios),
                imagen: data.imagen,
                activo: data.activo,
                id: data.id
            });
            modal.mensaje("Registro modificado con éxito");
        }
        g.exec("set_url", {tabla: "horario_de_transporte", _url: g.getUrl(data.id, data.origen + "-" + data.destino), id: data.id});
        this.crud.afterSave(data);
        $("[tab-ref='listado']").click();
        this.bandera = false;
        return true;
    }
    async onDelete() {
        if(await modal.pregunta(`¿Seguro de borrar el registro?`)){
            let ret1 = await g.safeQuery({q: "HorariosDeTransportes.delete", id: this.crud.element.id});
            this.crud.removeSelected();
        }
    }

    getFechas(){
        let ret = [];
        $("[name='dias_horarios'] tbody tr").each((index, ev)=>{
            ret.push([
                $(ev).find("select").val(),
                $(ev).find("input:eq(0)").val(),
                $(ev).find("input:eq(1)").val(),
                $(ev).find("input:eq(2)").val(),
            ]);
        });
        return ret;
    }
    agregarFecha(ar, limpiar = false){
        if(limpiar){ this.limpiarFechas(); }
        
        if(ar == null){ ar = [["1,5", null, null, null]]; }
        
        let dias_semana = g.getOptions({ar: DIAS_SEMANA, propId: "val", propText: "label"})
        ar.forEach(item=>{
            let foo = ` <tr>
                            <td>
                                <select class="form-control form-control-sm" name="" placeholder="Días">
                                    ${dias_semana}
                                </select>
                            </td>
                            <td>
                                <input type='time' name="" class="form-control form-control-sm" placeholder="Salida">
                            </td>
                            <td>
                                <input type='time' name="" class="form-control form-control-sm" placeholder="Llegada">
                            </td>
                            <td>
                                <input type='number' name="" class="form-control form-control-sm" placeholder="Precio">
                            </td>
                            <td>
                                <button class="btn btn-danger btn-sm" name=""><i class="fas fa-times"></i></button>
                            </td>
                        </tr>`;
            $("[name='dias_horarios'] tbody").append(foo);
            let tr = $("[name='dias_horarios'] tbody tr").last();
            tr.find("select:eq(0)").val(item[0]);
            tr.find("input:eq(0)").val(item[1]);
            tr.find("input:eq(1)").val(item[2]);
            tr.find("input:eq(2)").val(item[3]);
        });

        $("[name='dias_horarios'] tbody button").unbind("click");
        $("[name='dias_horarios'] tbody button").click(ev=>{
            if(confirm("¿Seguro de quitar esta fecha?")){
                $(ev.currentTarget).parent().parent().remove();
            }
        });
    }
    limpiarFechas(){
        $("[name='dias_horarios'] tbody").html("");
    }
}