class FrontPublicidad{
    constructor(){
        this.datos = null
    }
    ini(){
        try{
            this.datos = JSON.parse(DATOS)
            console.log(this.datos);

            if(window.location.href.indexOf("?admin") > -1){
                $("[name='copiar_detalle']").removeClass("d-none");
                $("[name='copiar_publicidad']").removeClass("d-none");
            }

            $("[name='texto_redes']").html( g.bd_to_str(this.datos.texto_redes));
            $("[name='imagen']").attr("src", "/images/subidas/" + this.datos.imagen);
            $("[name='contactar']").attr("href", this.datos.enlace);

            $("[name='copiar_detalle']").click(()=>{
                navigator.clipboard.writeText( g.bd_to_str(this.datos.texto_redes) );
                g.toast("Detalle copiado")
            })
            $("[name='copiar_publicidad']").click(()=>{
                navigator.clipboard.writeText( window.location.href.split("?")[0] );
                g.toast("Publicidad copiada")
            })

            
            g.closeCortina();
        }catch(ex){
            console.error(ex)
        }
    }
}
