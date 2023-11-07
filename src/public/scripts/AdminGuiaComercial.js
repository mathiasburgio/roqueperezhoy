class AdminGuiaComercial{
    constructor(){
        this.ck = undefined;
        this._ck = false;
        this.aux_dbl_click = false;
        this.mapa = undefined;
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

        $("[name='categoria_1']").html( g.getOptions({ar: CATEGORIAS_POIS, propText: "nombre", propId: "id", optionDisabled: true}) );
        $("[name='categoria_2']").html( g.getOptions({ar: CATEGORIAS_POIS, propText: "nombre", propId: "id", optionDisabled: true}) );
        $("[name='categoria_3']").html( g.getOptions({ar: CATEGORIAS_POIS, propText: "nombre", propId: "id", optionDisabled: true}) );

        let dias_horarios = "";
        fechas.DAY_OF_WEEK.forEach((item, ind)=>{
            dias_horarios += `  <tr idd="${ind}">
                                    <td>
                                        ${item}
                                    </td>
                                    <td>
                                        <input type="time" name="" class="form-control form-control-sm">
                                    </td>
                                    <td>
                                        <input type="time" name="" class="form-control form-control-sm">
                                    </td>
                                    <td>
                                        <input type="time" name="" class="form-control form-control-sm">
                                    </td>
                                    <td>
                                        <input type="time" name="" class="form-control form-control-sm">
                                    </td>
                                </tr>`;
        });
        $("[name='dias_horarios'] tbody").html(dias_horarios);

        this.crud = new SimpleCRUD({
            list: [],
            searchProps: ["nombre", "propietario"],
            structure: [
                {
                    label: "",
                    prop: "---",
                    fn: (e, f)=>{
                        let diff = Math.abs(fechas.diff_days(new Date(), f.ultima_actualizacion));
                        console.log(diff)
                        let color = "success";
                        if(diff > 90){color = "danger";}
                        else if(diff > 45){color = "warning";}

                        return "<small><i class='fas fa-circle text-" + color + "'></i></small>"; 
                    }
                },
                {
                    label: "Nombre",
                    prop: "nombre"
                },
                {
                    label: "Propietario",
                    prop: "propietario"
                }
            ],
            beforeSelect: (item)=>{
                return new Promise(async resolve=>{
                    let nx = await g.safeQuery({q: "Pois.getById", id: item.id});
                    this.parsePoi(nx.result[0]);
                    Object.assign(item, nx.result[0]);
                    resolve(item);
                })
            },
            afterSelect: (item) => {
                console.log(item);
                let _imgs = [];
                item.imagenes.forEach(img=>{
                    _imgs.push("/images/subidas/" + (img || "sin_imagen.jpg"));
                });
                imagine.setValues(null, _imgs);

                $("[name='ultima_actualizacion']").val( fechas.parse({val: item.ultima_actualizacion, formato: fechas.FORMATO.ARG_FECHA_HORA}) );
                if(typeof this.ck != "undefined" && this.ck.applicationTitle){ 
                    this.ck.setReadOnly(true);
                    $("[name='llenar_detalle']").prop("disabled", false);
                }

                item.datos_de_contacto.forEach(item=>{
                    this.agregar_dato_de_contacto(item[0], item[1]);
                });

                item.dias_horarios.forEach((item, index)=>{
                    let r = $("[name='dias_horarios'] tbody tr:eq(" + index + ")");
                    r.find("input:eq(0)").val(item[0] || null);
                    r.find("input:eq(1)").val(item[1] || null);
                    r.find("input:eq(2)").val(item[2] || null);
                    r.find("input:eq(3)").val(item[3] || null);
                });
                $("[name='datos_de_contacto'] select, [name='datos_de_contacto'] input").prop("disabled", true);
                if(typeof item.geo == "object"){$("[crud='fields'] [name='geo']").val(JSON.stringify(item.geo)); }
            },
            afterClear: () =>{
                imagine.clearValues();

                if(this._ck){ this.ck.setReadOnly(true); this.ck.setData(""); }
                $("[name='datos_de_contacto'] tbody").html("")
                $("[name='dias_horarios'] input").val(null)
            }
        });
        

        $("[crud='btNew']").click(()=>{
            this.crud.onNew();
            $("[name='fecha']").val( fechas.toInputDatetime() );
            $("[name='categoria_1']").val(0);
            $("[name='categoria_2']").val(0);
            $("[name='categoria_3']").val(0);
            $("[name='local_al_publico']").val(1);
            $("[name='take_away']").val(0);
            $("[name='delivery']").val(0);
            $("[name='activo']").val(1);
            if(g.mobile){ $("[tab-ref='datos']").click(); }
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
            window.open("https://roqueperezhoy.com.ar/comercio/" + url, "_blank")
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
                this.crud.search(v);
            }
        });

        $("[tab-ref]").click(ev=>{
            let ref = $(ev.currentTarget).attr("tab-ref");
            $("[tab]").addClass("d-none");
            $("[tab='" + ref + "']").removeClass("d-none");
            if(this.crud.element && this.ck){ this.ck.setData(this.crud.element.detalle); }
        })

        $("[name='geo']").click(ev=>{
            this.seleccionar_en_mapa();
        });

        $("[name='dias_horarios'] tbody tr").click(ev=>{
            
            if(this.aux_dbl_click){
                let r = $(ev.currentTarget);
                let ind = parseInt(r.attr("idd"))
                if( ind === 0){
                    r.find("input:eq(0)").val("08:00");
                    r.find("input:eq(1)").val("12:00");
                    r.find("input:eq(2)").val("17:00");
                    r.find("input:eq(3)").val("21:00");
                }else{
                    let r2 = $("[name='dias_horarios'] tbody tr:eq(" + (ind - 1) + ")");
                    r.find("input:eq(0)").val(r2.find("input:eq(0)").val());
                    r.find("input:eq(1)").val(r2.find("input:eq(1)").val());
                    r.find("input:eq(2)").val(r2.find("input:eq(2)").val());
                    r.find("input:eq(3)").val(r2.find("input:eq(3)").val());
                }
            }
            setTimeout(()=>{
                this.aux_dbl_click = false;
            },200);
            this.aux_dbl_click = true;

            
        });

        $("[name='agregar_dato_de_contacto']").click(()=>{
            this.agregar_dato_de_contacto();
        });
        
        $("[name='llenar_detalle']").click(ev=>{
            if(!this.crud.element){ return }
            this.ck.setData(this.crud.element.detalle); 
        });

        this.crud.setTable($("#container-main-table"));
        this.crud.list = await this.getListado();
        this.crud.search();
        this.crud.inicialize();
        if(g.mobile == false){ $("[tab-ref]").prop("disabled", true); }

        g.closeCortina();
    }

    async getListado(){
        let ret = await g.safeQuery({q: "Pois.selectAll" });
        ret.result.forEach(px=>{
            px.nombre = g.bd_to_str(px.nombre)
            px.propietario = g.bd_to_str(px.propietario)
        })
        return ret.result;
    }
    async getPoi(id){
        let ret = await g.safeQuery({q: "Pois.getById", id});
        return this.parsePoi(ret.result[0]);
    }
    parsePoi(e){
        let esArray = Array.isArray(e);
        if(!esArray){e = [e];}

        e.forEach(item=>{
            item.id = parseInt(item.id);
            item.nombre = g.bd_to_str(item.nombre);
            item.propietario = g.bd_to_str(item.propietario);
            item.detalle = g.bd_to_str(item.detalle, true);
            item.direccion = g.bd_to_str(item.direccion);
            item.local_al_publico = parseInt(item.local_al_publico);
            item.geo = item.geo != "" ? JSON.parse(item.geo) : "";
            item.imagenes = JSON.parse(item.imagenes);
            item.dias_horarios = JSON.parse(item.dias_horarios);
            item.datos_de_contacto = JSON.parse(item.datos_de_contacto);
            item.delivery = parseInt(item.delivery);
            item.take_away = parseInt(item.take_away);
            item.activo = parseInt(item.activo);
        });
        return esArray ? e : e[0]; 
    }
    async onSave() {
        let data = this.crud.getDataToSave();
        if(data.nombre.length < 3){modal.mensaje("Nombre no válido"); this.bandera = false; return;}
        if(data.propietario.length < 3){modal.mensaje("Propietario no válido"); this.bandera = false; return;}
        if(!data.categoria_1){modal.mensaje("El POI debe contener al menos categoría 1"); this.bandera = false; return;}

        data.imagenes = imagine.getValues();
        data.detalle = this.ck.getData().trim();
        if(data.detalle.length < 3){modal.mensaje("Detalle no válido"); this.bandera = false; return;}
        
        data.dias_horarios = [];
        $("[name='dias_horarios'] tbody tr").each((ind, ev)=>{
            data.dias_horarios.push([
                $(ev).find("input:eq(0)").val(),
                $(ev).find("input:eq(1)").val(),
                $(ev).find("input:eq(2)").val(),
                $(ev).find("input:eq(3)").val(),
            ])
        });

        data.datos_de_contacto = [];
        $("[name='datos_de_contacto'] tbody tr").each((ind, ev)=>{
            data.datos_de_contacto.push([
                $(ev).find("select").val(),
                $(ev).find("input").val(),
            ])
        });
        
        if (this.crud.isNew) {
            let ret1 = await g.safeQuery({
                q: "Pois.insert", 
                nombre: g.str_to_bd(data.nombre),
                propietario: g.str_to_bd(data.propietario),
                detalle: g.str_to_bd(data.detalle, true),
                direccion: g.str_to_bd(data.direccion),
                local_al_publico: data.local_al_publico || 0,
                geo: data.geo,
                categoria_1: data.categoria_1 || 0,
                categoria_2: data.categoria_2 || 0,
                categoria_3: data.categoria_3 || 0,
                imagenes: JSON.stringify(data.imagenes),
                datos_de_contacto: JSON.stringify(data.datos_de_contacto),
                dias_horarios: JSON.stringify(data.dias_horarios),
                delivery: data.delivery || 0,
                take_away: data.take_away || 0,
                activo: data.activo || 0,
                auxiliar: "{}"
            });
            data.id = ret1.result.insertId;
            modal.mensaje("POI creado con éxito");
        } else {
            let ret1 = await g.safeQuery({
                q: "Pois.update", 
                nombre: g.str_to_bd(data.nombre),
                propietario: g.str_to_bd(data.propietario),
                detalle: g.str_to_bd(data.detalle, true),
                direccion: g.str_to_bd(data.direccion),
                local_al_publico: data.local_al_publico || 0,
                geo: data.geo,
                categoria_1: data.categoria_1 || 0,
                categoria_2: data.categoria_2 || 0,
                categoria_3: data.categoria_3 || 0,
                imagenes: JSON.stringify(data.imagenes),
                datos_de_contacto: JSON.stringify(data.datos_de_contacto),
                dias_horarios: JSON.stringify(data.dias_horarios),
                delivery: data.delivery || 0,
                take_away: data.take_away || 0,
                activo: data.activo || 0,
                auxiliar: "{}",
                id: data.id
            });
            modal.mensaje("POI modificado con éxito");
        }
        data.ultima_actualizacion = new Date();
        this.crud.afterSave(data);
        g.exec("set_url", {tabla: "poi", _url: g.getUrl(data.id, data.nombre), id: data.id});
        $("[tab-ref='listado']").click();
        this.bandera = false;
        return true;
    }
    async onDelete() {
        if(await modal.pregunta(`¿Seguro de borrar el POI <b>${this.crud.element.nombre} - ${this.crud.element.propietario}</b>?`)){
            let ret1 = await g.safeQuery({q: "Pois.delete", id: this.crud.element.id});
            this.crud.removeSelected();
        }
    }
    agregar_dato_de_contacto(tipo, valor){
        let foo = `<tr>
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
                            <input type='text' class='form-control form-control-sm' name="">
                        </td>
                    </tr>`;
        $("[name='datos_de_contacto'] tbody").append(foo);
        if(tipo && valor){
            let r = $("[name='datos_de_contacto'] tbody tr").last();
            r.find("select").val(tipo);
            r.find("input").val(valor);
        }
    }
    seleccionar_en_mapa(){
        let lat = -35.3963182;
        let lng = -59.3315036;

        if(this.crud.element && this.crud.element.geo){
            lat = this.crud.element.geo.lat;
            lng = this.crud.element.geo.lng;
        }

        modal.mostrar({
            titulo: "Mapa",
            cuerpo: "<div class='mapa' style='height: 50vh'></div>",
            botones: "volver"
        });

        this.mapa = new google.maps.Map(document.querySelector("#modal .mapa"), {
            center: { lat: lat, lng: lng },
            zoom: 15,
        });

        if(this.crud.element && this.crud.element.geo){
            let marker = new google.maps.Marker({
                position: this.crud.element.geo,
                map: this.mapa,
            });
        };

        google.maps.event.addListener(this.mapa, 'click', function(event) {
            $("[name='geo']").val(JSON.stringify(event.latLng));
            modal.ocultar();
        });
    }
}