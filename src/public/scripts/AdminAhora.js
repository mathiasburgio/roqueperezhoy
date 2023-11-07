class AdminAhora{
    constructor(){
        this.datos = null;
    }
    async ini(){
        
        $("[name='guardar']").click(()=>{
            this.guardar()
        })

        g.safeQuery({q: "Ahora.getAhora"}).then(ret=>{
            let res = ret.result[0] || null;
            this.datos = res;
            $("[name='texto']").val(g.bd_to_str(res.texto) || "")
            $("[name='url']").val(res.url || "")
            $("[name='color']").val(res.color || "primary")
            $("[name='activo']").val(res.activo || 0)
            this.previsualizar()
        });

        $("[name='texto'], [name='color']").change(ev=>{
            this.previsualizar();
        });

        g.closeCortina();
    }
    previsualizar(){
        let data = this.getData()
        $("#ahora .alert").attr("class", "")
        .addClass("alert")
        .css("border-radius", "0")
        .addClass("text-center")
        .addClass(data.color)
        .html(g.bd_to_str(data.texto))
    }
    async guardar(){
        let d = this.getData();
        let ret1 = await g.safeQuery({
            q:"Ahora.update",
            ...d
        });
        if(await modal.pregunta("¿Crear notificación?")){
            let ret2 = await g.safeQuery({
                q: "Notificaciones.insert", 
                titulo: "¡Alerta!",
                cuerpo: d.texto,
                imagen: "compartir_roqueperezhoy.png",
                url: (d.url != "" || d.url != "#" ? "" : d.url.replace("https://roqueperezhoy.com.ar/", ""))
            });
        }
        modal.mensaje("Guardado!");
    }
    getData(){
        let data = {
            texto: g.str_to_bd($("[name='texto']").val()),
            url: $("[name='url']").val(),
            color: $("[name='color']").val(),
            activo: $("[name='activo']").val(),
            idd: (new Date().getTime())
        }
        return data
    }
}