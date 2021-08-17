let estagiarios = [];
let estagiariosIndex;

class Estagiario {

    constructor(codigo, nome, horarios) {
        this.codigo = codigo;
        this.nome = nome;
        this.horarios = horarios;
        this.batidas = [];
    }

    getBatidas(dtInicial, dtFinal) {
        this.batidas = [];
        var DateInicial = new Date(dtInicial);
        var DateFinal = new Date(dtFinal);

        if (DateFinal.getTime() < DateInicial.getTime()) {
            alert('Data final não pode ser menor que a data inicial');
            return;
        }

        // 1 dia = 8,64e+7 millis
        let $dados = $('#dados');

        let html = "";
        let qtDias = (DateFinal.getTime() - DateInicial.getTime()) / 8.64e+7;

        for (let i = 0; i <= qtDias; i++) {

            let newDateMillis = DateInicial.getTime() + 8.64e+7 * i;
            let newDate = new Date(newDateMillis);
            this.batidas.push({
                data: newDate,
                batidas: []
            });
            let dateFormated = newDate.getUTCFullYear() + "-" + ("0" + (newDate.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + newDate.getUTCDate()).slice(-2);
            html += "<tr data-date='" + dateFormated + "'> <td> " + ("0" + newDate.getUTCDate()).slice(-2) + "/" + ("0" + (newDate.getUTCMonth() + 1)).slice(-2) + "/" + ('' + newDate.getUTCFullYear()).slice(-2) + " - " + diasSemana[newDate.getUTCDay()] + " </td></tr>";
        }

        $dados.html(html);
        let objeto = this;
        $.ajax({
            method: 'POST',
            url: '/relatorios/batidas',
            dataType: 'json',
            data: { dtInicial: dtInicial, dtFinal: dtFinal, codigo: this.codigo }
        }).done(function(data) {
            console.log(data);
            if (data.err) {
                alert("Erro ao recuperar dados");
                return;
            }

            for (let batida of data.batidas) {
                for (let index in objeto.batidas) {

                    let dia = objeto.batidas[index].data.getUTCDate();
                    let mes = objeto.batidas[index].data.getUTCMonth();
                    let ano = objeto.batidas[index].data.getUTCFullYear();

                    let batidaDate = new Date(batida.data);

                    if (batidaDate.getDate() == dia && batidaDate.getMonth() == mes && batidaDate.getFullYear() == ano) {

                        objeto.batidas[index].batidas.push({ data: batidaDate, id: batida._id });

                    }

                    for (let value of data.banco) {

                        let valueDate = new Date(value.data);

                        if (valueDate.getDate() == dia && valueDate.getMonth() == mes) {
                            objeto.batidas[index].banco = value;
                            break;
                        }
                    }

                }
            }

            $dados.find('tr').each(function(index, elem) {

                for (let i = 0; i < 6; i++) {
                    if (objeto.batidas[index].batidas[i])
                        $("<td data-id='" + objeto.batidas[index].batidas[i].id + "'>" + ('0' + objeto.batidas[index].batidas[i].data.getHours()).slice(-2) + ":" + ('0' + objeto.batidas[index].batidas[i].data.getMinutes()).slice(-2) + "</td>").appendTo(elem);
                    else
                        $("<td> - </td>").appendTo(elem);
                }

                if (objeto.batidas[index].batidas.length > 0 && objeto.batidas[index].batidas.length % 2 == 0) {

                    var batidas = objeto.batidas[index].batidas;
                    var millisTotal = 0;

                    for (var i = 0; i < batidas.length / 2; i++) {

                        millisTotal += batidas[(i * 2) + 1].data.getTime() - batidas[i * 2].data.getTime();

                    }

                    var minutos = Math.ceil(millisTotal / 60000);
                    var horas = Math.floor(minutos / 60);
                    minutos = minutos - horas * 60;
                    $('<td>' + ("0" + horas).slice(-2) + ':' + ("0" + minutos).slice(-2) + '</td>').appendTo(elem);
                } else {
                    $('<td> - </td>').appendTo(elem);
                }

                if (objeto.batidas[index].banco) {

                    var valorAcumulado = objeto.batidas[index].banco.valorAcumulado;
                    var valorAcumuladoString = convertToTimeString(valorAcumulado < 0 ? valorAcumulado * -1 : valorAcumulado);
                    var valorAcumuladoString = "-" + valorAcumuladoString;
                    $('<td> ' + convertToTimeString(objeto.batidas[index].banco.debito * -1) + ' </td>').appendTo(elem);
                    $('<td> ' + convertToTimeString(objeto.batidas[index].banco.credito) + ' </td>').appendTo(elem);
                    $('<td> ' + valorAcumuladoString + ' <button class="btn btn-primary atualizarBH btn-xs pull-right"><span class="glyphicon glyphicon-refresh"></span></button></td>').appendTo(elem);

                } else {
                    $('<td> - </td>').appendTo(elem);
                    $('<td> - </td>').appendTo(elem);
                    $('<td> - </td>').appendTo(elem);
                }

            });


        });

    }


}