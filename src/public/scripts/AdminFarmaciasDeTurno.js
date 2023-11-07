class AdminFarmaciasDeTurno{
    constructor(){
        this.bandera = false;
    }
    async ini(){
        await g.cargar_listados(true, false, false);
        g._listados.pois = g._listados.pois.filter(item=>POIS_FARMACIAS.includes(item.id));

        this.crud = new SimpleCRUD({
            list: [],
            searchProps: ["mes"],
            structure: [
                {
                    label: "Fecha",
                    prop: "mes",
                    fn: (e, f)=>{
                        return fechas.MONTH_NAME[f.mes] + " de " + f.anio; 
                    }
                }
            ],
            afterSelect: (item) => {
                let mes_ = item.mes + 1;
                $("[crud='fields'] [name='fecha']").val(item.anio + "-" + (mes_ < 10 ? "0" + mes_ : mes_));
                this.generarDias(item.fechas);
                $("[crud='fields'] [name]").prop("disabled", true);
            },
            afterClear: () =>{
                $("[name='meses']").html("");
            }
        });
        

        $("[crud='btNew']").click(()=>{
            this.crud.onNew();
            if(g.mobile){ $("[tab-ref='datos']").click(); }
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

        $("[name='btGenerar']").click(ev=>{
            this.generarDias();
        });

        this.crud.setTable($("#container-main-table"));
        this.crud.list = await this.getListado();
        this.crud.inicialize();
        this.crud.search();
        if(g.mobile == false){ $("[tab-ref]").prop("disabled", true); }

        g.closeCortina();
    }
    async getListado(){
        let ret = (await g.safeQuery({q: "FarmaciasDeTurno.selectLast20"})).result;
        ret.forEach(item=>{
            item.id = parseInt(item.id);
            item.mes = parseInt(item.mes);
            item.anio = parseInt(item.anio);
            item.fechas = JSON.parse(item.fechas);
        });
        return ret;
    }

    async onSave() {
        let data = this.crud.getDataToSave();
        if(!data.fecha){modal.mensaje("Fecha no válida"); this.bandera = false; return;}
        data.mes = parseInt( data.fecha.split("-")[1] ) -1;
        data.anio = parseInt( data.fecha.split("-")[0] );
        data.fechas = {};
        $("[name='meses'] [name]").each((ind, ev)=>{
            let name = $(ev).attr("name");
            let val = $(ev).val();
            data.fechas[name] = val;
        });
        
        if (this.crud.isNew) {
            let ret1 = await g.safeQuery({
                q: "FarmaciasDeTurno.insert",
                mes: data.mes,
                anio: data.anio,
                fechas: JSON.stringify(data.fechas)
            });
            data.id = ret1.result.insertId;
        } else {
            let ret1 = await g.safeQuery({
                q: "FarmaciasDeTurno.update",
                mes: data.mes,
                anio: data.anio,
                fechas: JSON.stringify(data.fechas),
                id: data.id
            })
        }
        this.crud.afterSave(data);
        $("[tab-ref='listado']").click();
        modal.mensaje("Farmacias guardadas con éxito");
        this.bandera = false;
        return true;
    }
    async onDelete() {
        if(await modal.pregunta(`¿Seguro de borrar los registros de <b>${fechas.MONTH_NAME[this.crud.element.mes] + " de " + this.crud.element.anio}</b>?`)){
            let ret1 = await g.safeQuery({q: "FarmaciasDeTurno.delete", id: this.crud.element.id});
            this.crud.removeSelected();
        }
    }
    generarDias(obj){
        let v = $("[name='fecha']").val();
        if(!v){ return }
        let mesAnio = v.split("-");
        let dias = fechas.days_in_month(parseInt(mesAnio[0]), parseInt(mesAnio[1]));
        
        let options = "<option value='0'>-=SELECCIONAR=-</option>";
        g._listados.pois.forEach(item=>{
            options += `<option value="${item.id}">${item.nombre}</option>`;
        });

        let html = "";
        for(let i = 1; i <= dias; i++){
            html += `<div class='form-group'>
                        <label>Día ${i}</label>
                        <select name="f${i}" class='form-control'>${options}</select>
                    </div>`;
        }
        $("[name='meses']").html(html);
        for(let prop in obj){
            $("[name='meses'] [name='" + prop + "']").val(obj[prop]);
        }
    }
}