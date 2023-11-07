class AdminPublicidades{
    constructor(){
        this.bandera = false;
        this.id_ref = 0;
    }
    async ini(){
        await g.cargar_listados(true, true, true);        
        
        imagine.domUploader({dom: $(".imagen"), resizeOnChange: true, imgDefault: "/images/subidas/sin_imagen.jpg", callback: async (file, dom)=>{
            let ret = await imagine.uploadFile({nombre: "imagen.jpg", archivo: file});
            imagine.setValues(dom, "/images/subidas/" + ret);
        }});
        
        $("[name='pid']").html( g.getOptions({ar: PUBLICIDADES, propText: "nombre", propId: "id", optionDisabled: true}) );

        this.crud = new SimpleCRUD({
            list: [],
            searchProps: ["nombre"],
            structure: [
                {
                    label: "Nombre",
                    prop: "nombre",
                    fn: (e,f)=>{
                        return `<span class='badge badge-primary'>${f.prioridad}</span>` + e
                    }
                },
                {
                    label: "",
                    prop: "compartida",
                    right: true,
                    fn: (e, f) =>{
                        return `<span class='badge badge-info'><i class='fas fa-share-alt'></i> ${parseInt(e) || 0}</span>`;
                    }
                }
            ],
            beforeSelect: async item =>{
            },
            afterSelect: (item) => {
                imagine.setValues(null, ["/images/subidas/" + (item.imagen || "sin_imagen.jpg")]);
                console.log(item);
                $("[name='btCompartir']").prop("disabled", (item.px?.compartir ? false : true));
            },
            afterClear: () =>{
                imagine.clearValues();
            }
        });
        

        $("[crud='btNew']").click(()=>{
            this.crud.onNew();
            if(g.mobile){ $("[tab-ref='datos']").click(); }
            $("[name='pid']").val(0);
            $("[name='dias']").val(7);
            $("[crud='fields'] [name='prioridad']").val(3)
        });
        
        $("[crud='btModify']").click(()=>{
            if(!this.crud.element){ modal.mensaje("Para modificar primero debe seleccionar un item"); return; }
            this.crud.onModify();
            if(g.mobile){ $("[tab-ref='datos']").click(); }
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
            let pid = $("[name='pid']").val();
            let px = PUBLICIDADES.find(p=>p.id === parseInt(pid))
            console.log(px);
            let lista = [];
            let prop = ""
            if(px.grupo == "noticia"){ lista = "noticias"; prop = "titulo"; }
            else if(px.grupo == "evento"){ lista = "eventos"; prop = "nombre"; }
            else if(px.grupo == "poi"){ lista = "pois"; prop = "nombre"; }
            else{ modal.mensaje("...Nada que seleccionar"); return;}
            g.seleccionarObjeto(lista, prop, e =>{
                console.log(e)
                this.id_ref = e.id;
                let fx = new Date();
                fx = fx.getDate() + "-" + fechas.MONTH_NAME[fx.getMonth()]
                let img = "/images/subidas/" + (Array.isArray(e.imagenes) ? e.imagenes[0] : JSON.parse(e.imagenes)[0]);
                if(px.grupo == "noticia"){
                    $("[name='nombre']").val(fx + " _ " + e.titulo.substring(0,100));
                    $("[name='texto_redes']").val(e.detalle);
                    $("[name='enlace']").val("https://roqueperezhoy.com.ar/noticia/" + e.url);
                    imagine.setValues(null, [img]);
                }else if(px.grupo == "evento"){
                    $("[name='nombre']").val(fx + " _ " + e.nombre.substring(0,100));
                    $("[name='texto_redes']").val(g.stripTags( e.detalle ));
                    $("[name='enlace']").val("https://roqueperezhoy.com.ar/evento/" + e.url);
                    imagine.setValues(null, [img]);
                }else if(px.grupo == "poi"){
                    $("[name='nombre']").val(fx + " _ " + e.nombre.substring(0,100));
                    $("[name='texto_redes']").val( g.stripTags( e.detalle ));
                    $("[name='enlace']").val("https://roqueperezhoy.com.ar/guia-comercial/comercio/" + e.url);
                    imagine.setValues(null, [img]);
                }
            });
        });

        $("[name='btResumen']").click(()=>{
            this.modalResumen();
        });

        $("[name='btCompartir']").click(async ev=>{
            this.crud.element.compartida++;
            this.crud.updateTableRow();
            await g.safeQuery({ q:"Publicidades.addCompartida", id: this.crud.element.id});
            window.open("https://roqueperezhoy.com.ar/publicidad/" + this.crud.element.url + "?admin");
        });
        
        this.crud.setTable($("#container-main-table"));
        this.crud.list = await this.getListado();
        this.crud.search();
        this.crud.inicialize();
        if(g.mobile == false){ $("[tab-ref]").prop("disabled", true); }
        
        $("[name='prefijo']").change(ev=>{
            $("[name='enlace']").val($(ev.currentTarget).val());
        });

        $("[name='fecha_inicio'], [name='dias']").change(ev=>{
            this.calcularPrecio();
        });

        g.closeCortina();
    }
    async getListado(){
        let ret = await g.safeQuery({q: "Publicidades.selectAll"});
        ret.result.forEach(item=>{
            item.nombre = g.bd_to_str(item.nombre);
            item.texto_redes = g.bd_to_str(item.texto_redes, true);
            item.px = PUBLICIDADES.find(p=>p.id === parseInt(item.pid));
        });
        return ret.result;
    }
    async onSave() {
        let data = this.crud.getDataToSave();
        if(data.nombre.length < 3){modal.mensaje("Nombre no válido"); this.bandera = false; return;}
        data.imagen = imagine.getValues()[0];
        data.enlace = data.enlace || "#"
        data.dias = parseInt(data.dias);

        if(!data.dias || data.dias <= 0){modal.mensaje("Días de actividad no válido"); this.bandera = false; return;}

        let px = PUBLICIDADES.find(p=>p.id === parseInt(data.pid))

        if(px.id === 23 || px.id === 24){//POI de prueba
            if(parseInt(data.dias) > 30){
                modal.mensaje("Publicidad gratis como máximo permite 30 días."); 
                this.bandera = false; 
                return;
            }
        }else{
            if(parseInt(data.valor) == 0){
                modal.mensaje("Valor no válido."); 
                this.bandera = false; 
                return;
            }
        }

        if(!data.fecha_inicio){modal.mensaje("Fecha inicio no válido"); this.bandera = false; return;}
        if(!data.fecha_fin){modal.mensaje("Fecha fin no válido"); this.bandera = false; return;}


        if (this.crud.isNew) {
            let ret1 = await g.safeQuery({
                q:"Publicidades.insert", 
                nombre: g.str_to_bd(data.nombre),
                pid: px.id,
                id_ref: this.id_ref,
                imagen: data.imagen,
                texto_redes: g.str_to_bd(data.texto_redes, true),
                enlace: data.enlace,
                fecha_inicio: data.fecha_inicio,
                dias: data.dias,
                fecha_fin: data.fecha_fin,
                valor: data.valor,
                prioridad: data.prioridad
            });
            console.log(ret1);
            data.id = ret1.result.insertId;
            modal.mensaje("Publicidad creada con éxito");
        }else{
            let ret1 = await g.safeQuery({
                q:"Publicidades.modify", 
                id: this.crud.element.id,
                nombre: g.str_to_bd(data.nombre),
                pid: px.id,
                id_ref: this.id_ref,
                imagen: data.imagen,
                texto_redes: g.str_to_bd(data.texto_redes, true),
                enlace: data.enlace,
                fecha_inicio: data.fecha_inicio,
                dias: data.dias,
                fecha_fin: data.fecha_fin,
                valor: data.valor,
                prioridad: data.prioridad
            });
            console.log(ret1);
            modal.mensaje("Publicidad guardada con éxito");
        }
        g.exec("set_url", {tabla: "publicidad", _url: g.getUrl(data.id, data.nombre), id: data.id});
        this.crud.afterSave(data);
        $("[tab-ref='listado']").click();
        this.bandera = false;
        return true;
    }
    calcularPrecio(){
        try{
            let inicio = $("[name='fecha_inicio']").val();
            let dias = parseInt($("[name='dias']").val()) || 0;
            if(dias < 0) dias = 0;
            
            let fx = new Date(inicio);
            fx.setDate(fx.getDate() + dias);
            
            let pid = $("[name='pid']").val();
            let px = PUBLICIDADES.find(p=>p.id === parseInt(pid))
            let valor = parseInt(dias * px.precio / px.duracion);

            $("[name='fecha_fin']").val(fechas.parse({val: fx, formato: fechas.FORMATO.USA_FECHA}));
            $("[name='valor']").val(valor);
        }catch(err){
            alert(err);
        }
    }
    modalResumen(){
        let foo = $("#modal_resumen").html();
        modal.mostrar({
            titulo: "Resumen",
            cuerpo: foo,
            tamano: "modal-lg",
            botones: "volver"
        });

        
        $("#modal input").change(async ev=>{
            let v = $(ev.currentTarget).val();
            if(!v){return false;}
            let anio = v.split("-")[0];
            let mes = v.split("-")[1];
            let ret = await g.safeQuery({q: "Publicidades.getResumen", mes, anio});
            let obj = {};
            ret.result.forEach(item=>{
                item.px = PUBLICIDADES.find(p=>p.id === item.pid);
                if(typeof obj[px.nombre] == "undefined"){ 
                    obj[px.nombre] = {
                        valor: item.valor,
                        cantidad: 1
                    }
                }else{
                    obj[px.nombre].cantidad++;
                    obj[px.nombre].valor += item.valor;
                }
            })

            let total = 0;
            let suma_cantidad = 0;
            let tbody = "";
            for(let prop in obj){
                tbody += `<tr>
                            <td>${prop}</td>
                            <td class="text-right">${ g.decimales(obj[prop].cantidad) }</td>
                            <td class="text-right">${ g.decimales(obj[prop].valor) }</td>
                        </tr>`;
                total += g.decimales(obj[prop].valor);
                suma_cantidad += g.decimales(obj[prop].cantidad);
            }

            $("#modal tbody").html(tbody);
            $("#modal tfoot td:eq(1)").html(suma_cantidad);
            $("#modal tfoot td:eq(2)").html(total);
        });

        let fx = fechas.parse({val: new Date()});
        $("#modal input").val(fx.anio + "-" + fx.mes);
        $("#modal input").change();
    }
}