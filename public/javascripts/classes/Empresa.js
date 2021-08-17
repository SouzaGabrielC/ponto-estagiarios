
class Empresa{

    static find(){

        return new Promise((resolve, reject)=>{

            $.ajax({
                url: '/relatorios/empresa',
                method: 'GET',
                dataType:'JSON'
            }).done(function (data) {
                
                resolve(data.empresa);

            }).fail(function(){
                reject();
            })

        });

    }

}