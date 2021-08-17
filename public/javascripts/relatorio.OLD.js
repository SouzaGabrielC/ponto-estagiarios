$(function() {

    let diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

    let convertToTimeString = function(millis) {

        let minutes = Math.floor(millis / 60000);

        let hours = Math.floor(minutes / 60);
        minutes = minutes - (hours * 60);

        let string = ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);

        return string;

    }

    $.ajax({
        method: 'GET',
        url: '/relatorios/estagiarios',
        dataType: 'json'
    }).done(function(data) {

        if (data.err) {
            alert('Erro ao recuperar dados');
            return;
        }


        if (data.estagiarios.length > 0) {

            for (let estagiario of data.estagiarios) {

                let newEstagiario = new Estagiario(estagiario.codigo, estagiario.nome, estagiario.horarios);

                estagiarios.push(newEstagiario);

            }

            $("#estagiarioField").val(estagiarios[0].nome);
            estagiariosIndex = 0;

        } else {

            $("#estagiarioField").val("Nenhum estágiario");

        }

    });

    $('#btnNext').click(function() {

        estagiariosIndex += 1;
        if (estagiarios.length - 1 < estagiariosIndex) {
            estagiariosIndex = 0;
        }

        $("#estagiarioField").val(estagiarios[estagiariosIndex].nome);

        let dtInicial = $("#dtInicial").val();
        let dtFinal = $("#dtFinal").val();

        if (dtInicial && dtFinal) {
            estagiarios[estagiariosIndex].getBatidas(dtInicial, dtFinal);
        }

    });

    $('#btnPrev').click(function() {

        estagiariosIndex -= 1;
        if (estagiariosIndex < 0) {
            estagiariosIndex = estagiarios.length - 1;
        }

        $("#estagiarioField").val(estagiarios[estagiariosIndex].nome);

        let dtInicial = $("#dtInicial").val();
        let dtFinal = $("#dtFinal").val();

        if (dtInicial && dtFinal) {
            estagiarios[estagiariosIndex].getBatidas(dtInicial, dtFinal);
        }

    });

    $('#formAtualizar').submit(function(event) {

        event.preventDefault();

        let dtInicial = $("#dtInicial").val();
        let dtFinal = $("#dtFinal").val();

        if (dtInicial && dtFinal) {
            estagiarios[estagiariosIndex].getBatidas(dtInicial, dtFinal);
        }


    })
})