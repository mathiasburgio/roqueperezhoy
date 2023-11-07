class Login{
    constructor(){

    }
    ini(){
        $("#btIniciar").click(()=>{
            let mail = $("[type='email']").val();
            let contrasena = $("[type='password']").val();
            g.exec("login", {mail, contrasena}).then(ret=>{
                console.log(ret);
                if(ret.status == 1){
                    window.location.href = "/admin_inicio";
                }else{
                    alert(ret.message);
                }
            });
        });
    }
}