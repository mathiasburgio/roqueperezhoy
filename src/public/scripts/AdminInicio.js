class AdminInicio{
    constructor(){
    }
    async ini(){
        this.tablaProgreso();

        const fnFila = (detalle, valor) =>{
            return `<tr>
                        <td>${detalle}</td>
                        <td class="text-right">${valor}</td>
                    </tr>`
        }

        $.get({
            url: "/admin_inicio_get_info"
        }).done(ret=>{
            $("[name='tabla-general']").append(fnFila("BD Noticias", ret.bd_noticias))
            $("[name='tabla-general']").append(fnFila("BD Eventos", ret.bd_eventos))
            $("[name='tabla-general']").append(fnFila("BD Pois", ret.bd_pois))
            $("[name='tabla-general']").append(fnFila("BD Publicaciones comunidad", ret.bd_publicaciones_muro))
            $("[name='tabla-general']").append(fnFila("BD Registros notificaciones", ret.bd_registro_notificaciones))
            $("[name='tabla-general']").append(fnFila("POIS 60 días sin verificar", ret.bd_pois_60_dias))
            $("[name='tabla-general']").append(fnFila("...", ""))
            $("[name='tabla-general']").append(fnFila("Fecha CACHE", fechas.parse({val: ret.fecha, formato: fechas.FORMATO.ARG_FECHA_HORA})))
            $("[name='tabla-general']").append(fnFila("CACHE Eventos", ret.cache_eventos))
            $("[name='tabla-general']").append(fnFila("CACHE Marquesina", ret.cache_marquesina))
            $("[name='tabla-general']").append(fnFila("CACHE Noticias", ret.cache_noticias))
            $("[name='tabla-general']").append(fnFila("CACHE Pois", ret.cache_pois))
            $("[name='tabla-general']").append(fnFila("CACHE Publicaciones comunidad", ret.cache_publicacionesMuro))
            $("[name='tabla-general']").append(fnFila("CACHE Publicidades", ret.cache_publicidades))
            $("[name='tabla-general']").append(fnFila("...", ""))
            $("[name='tabla-general']").append(fnFila("VISITAS (mes actual)", ""))
            ret.bd_visitas_mes_actual.forEach(row=>{
                $("[name='tabla-general']").append(fnFila(row.seccion, row.cantidad))
            });
            $("[name='tabla-general']").append(fnFila("...", ""))
            $("[name='tabla-general']").append(fnFila("VISITAS (mes anterior)", ""))
            ret.bd_visitas_mes_anterior.forEach(row=>{
                $("[name='tabla-general']").append(fnFila(row.seccion, row.cantidad))
            });
            console.log(ret);

            if(ret.ahora.activo == 0){
                $("#inicio .alert").remove();
            }else{
                $("#inicio .alert").addClass(ret.ahora.color)
                $("#inicio .alert").html(g.bd_to_str(ret.ahora.texto))
            }

        });

        $("[name='subir_imagenv2']").click(()=> g.subirImagenV2() );

        $("[name='actualizar_cache']").click(async ()=>{
            modal.esperando("Actualizando cache...");
            await g.exec("cachear");
            setTimeout(()=>{
                window.location.reload();
            },1500);
        });

        g.closeCortina();
    }
    
    tablaProgreso(){
        /*
        completado:
            0- nada hecho/recien empezado
            1- a medias
            2- 100% terminado
        */
        let faltante = [
            {tipo: "Verificar llave Google Maps", completado: 0, nota: ""},
            {tipo: "Verificar llave Google Analytics", completado: 0, nota: ""},
            {tipo: "Cargar noticias viejas", completado: 2, nota: ""},
            {tipo: "Verificar notificaciones", completado: 0, nota: ""},
            
        ];

        let completados = 0;
        let tbody = "";
        faltante.forEach((item, index)=>{
            let color = "dark";
            if(item.completado > 0){
                completados += item.completado;
                if(item.completado === 1){ color = "warning";}
                if(item.completado === 2){ color = "success";}
            }

            tbody += ` <tr index="${index}">
                            <td>${item.tipo}</td>
                            <td class="text-right"><i class="fas fa-check-circle text-${color}"></i></td>
                            <td class="text-right"><button class="btn btn-sm btn-info" ${item.nota ? "" : "disabled"}>Info</button></td>
                        </tr>`;
        });
        $("[name='tabla-progreso'] tbody").html(tbody);
        $("[name='tabla-progreso'] tbody button").click((ev)=>{
            let row = $(ev.currentTarget).parent().parent();
            let index = parseInt(row.attr("index"));
            modal.mensaje(faltante[index].nota);
        });

        let completado = (completados * 100 / (faltante.length * 2)).toFixed(2);
        $(".progress-bar")
        .css("width", completado + "%")
        .attr("aria-valuenow", completado)
        .html(completado + "%");

        

        $("[name='respaldar']").click(ev=>{
            this.modalRespaldar();
        })
        
    }
    modalRespaldar(){
        let fox = `<button class='btn btn-primary btn-block my-2' name='generar-dump'><i class='fas fa-database'></i> Generar dump.sql</button>
        <a href='/descargar-dump' target='_blank' class='btn btn-primary btn-block my-2 disabled'><i class='fas fa-database'></i> Descargar dump</a>
        <button class='btn btn-warning btn-block my-2 mt-4' name='generar-images'><i class='fas fa-image'></i> Generar images.zip</button>
        <a href='/descargar-images' target='_blank' class='btn btn-warning btn-block my-2 disabled'><i class='fas fa-image'></i> Descargar images</a>`
        modal.mostrar({
            titulo: "Respaldar",
            cuerpo: fox,
            botones: "volver"
        })

        $("#modal [name='generar-dump']").click(()=>{
            $("#modal [name='generar-dump']").prop("disabled", true);
            g.exec("respaldar_bd", {}).then(ret=>{
                $("#modal a:eq(0)").removeClass("disabled");
            });
        });
        $("#modal [name='generar-images']").click(()=>{
            $("#modal [name='generar-images']").prop("disabled", true);
            g.exec("respaldar_imgs", {}).then(ret=>{
                $("#modal a:eq(1)").removeClass("disabled");
            });
        });
    }
}