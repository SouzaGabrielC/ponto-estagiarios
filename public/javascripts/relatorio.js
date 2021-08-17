window.onload = async function () {

    let estagiarios = [],
        estagiariosIndex = 0;

    $('input[name="horario"]').mask('00:00');

    let diasDaSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

    try {

        estagiarios = await Estagiario.getAllEstagiarios();
        $("#estagiarioField").val(estagiarios[estagiariosIndex].nome);

    } catch (error) {
        console.log('Erro ao recuperar estagiarios!');
    }

    let atualizarTabela = async() => {

        let dtInicial = $("#dtInicial").val();
        let dtFinal = $("#dtFinal").val();

        if (!(dtFinal.trim() == "" || dtInicial.trim() == "")) {
            $("#modal-loading").modal('show');
            try {

                let dateInicial = new Date(dtInicial),
                    dateFinal = new Date(dtFinal);

                if (dateFinal.getTime() > dateInicial.getTime()) {

                    let {
                        batidas,
                        bancos
                    } = await estagiarios[estagiariosIndex].getBatidas(dtInicial, dtFinal);

                    let feriados = await Feriado.getFeriados(dtInicial, dtFinal);

                    let qtDias = (dateFinal.getTime() - dateInicial.getTime()) / 8.64e+7;

                    let html = ``;

                    let currentDate = dateInicial;

                    for (let i = 0; i <= qtDias; i++) {

                        let batidasDia = [];

                        currentDate.setDate(currentDate.getDate() + 1);

                        html += `<tr>`;
                        html += `<td>${('0'+currentDate.getDate()).slice(-2)}/${('0'+(currentDate.getMonth()+1)).slice(-2)}/${currentDate.getFullYear()} - ${ diasDaSemana[currentDate.getDay()].slice(0, 3)}</td>`;

                        let hasFeriado = false;

                        for (let feriado of feriados) {

                            let dataInicial = new Date(feriado.dtInicial);
                            let dataFinal = new Date(feriado.dtFinal);

                            if (currentDate.getMonth() == dataInicial.getUTCMonth() || currentDate.getMonth() == dtFinal.getUTCMonth()) {

                                if (currentDate.getDate() >= dataInicial.getUTCDate() && currentDate.getDate() <= dataFinal.getUTCDate()) {
                                    hasFeriado = true;
                                }

                            }

                        }

                        if (hasFeriado) {
                            for (let j = 0; j < 7; j++)
                                html += `<td>Feriado</td>`;

                            let foundBanco = false;

                            for (let banco of bancos) {

                                let bancoDate = new Date(banco.data);

                                if (bancoDate.getUTCDate() == currentDate.getDate() && bancoDate.getUTCMonth() == currentDate.getMonth()) {
                                    html += `<td>${banco.debito}</td>`;
                                    html += `<td>${banco.credito}</td>`;
                                    html += `<td>${banco.valorAcumulado}</td>`;
                                    foundBanco = true;
                                }

                            }

                            if (!foundBanco) {

                                html += `<td> - </td>`;
                                html += `<td> - </td>`;
                                html += `<td> - </td>`;

                            }
                        } else if (estagiarios[estagiariosIndex].horarios[diasDaSemana[currentDate.getDay()] + 'Folga']) {

                            for (let j = 0; j < 7; j++)
                                html += `<td>Folga</td>`;

                            let foundBanco = false;

                            for (let banco of bancos) {

                                let bancoDate = new Date(banco.data);

                                if (bancoDate.getUTCDate() == currentDate.getDate() && bancoDate.getUTCMonth() == currentDate.getMonth()) {

                                    html += `<td>${banco.debito}</td>`;
                                    html += `<td>${banco.credito}</td>`;
                                    html += `<td>${banco.valorAcumulado}</td>`;
                                    foundBanco = true;

                                }

                            }

                            if (!foundBanco) {

                                html += `<td> - </td>`;
                                html += `<td> - </td>`;
                                html += `<td> - </td>`;

                            }


                        } else {

                            for (let batida of batidas) {

                                let batidaDate = new Date(batida.data);

                                if (batidaDate.getDate() == currentDate.getDate() && batidaDate.getMonth() == currentDate.getMonth()) {

                                    html += `<td>${('0'+batidaDate.getHours()).slice(-2)}:${('0'+(batidaDate.getMinutes())).slice(-2)} ${batida.manual ? '<span class="text-danger">*</span>' : ''}</td>`;

                                    batidasDia.push(batidaDate);
                                }
                            }

                            for (let j = 0; j < 6 - batidasDia.length; j++) {

                                html += `<td></td>`;

                            }


                            if (batidasDia.length > 0 && batidasDia.length % 2 == 0) {

                                let millisTotal = 0;

                                for (let j = 0; j < batidasDia.length / 2; j++) {

                                    millisTotal += batidasDia[(j * 2) + 1].getTime() - batidasDia[j * 2].getTime();

                                }

                                html += `<td>${ Time.convertToTimeString(millisTotal) } </td>`;

                            } else {
                                html += `<td> - </td>`;
                            }

                            let foundBanco = false;

                            for (let banco of bancos) {

                                let bancoDate = new Date(banco.data);

                                if (bancoDate.getUTCDate() == currentDate.getDate() && bancoDate.getUTCMonth() == currentDate.getMonth()) {
                                    html += `<td>${banco.debito}</td>`;
                                    html += `<td>${banco.credito}</td>`;
                                    html += `<td>${banco.valorAcumulado}</td>`;
                                    foundBanco = true;
                                }

                            }

                            if (!foundBanco) {

                                html += `<td> - </td>`;
                                html += `<td> - </td>`;
                                html += `<td> - </td>`;

                            }

                            if (batidasDia.length < 6) {

                                html += `<td>
                                        <button class="btn btn-success btn-sm acrescentar-batida" data-dia="${currentDate.getFullYear()}-${("0"+(currentDate.getMonth()+1)).slice(-2)}-${("0"+currentDate.getDate()).slice(-2)}" data-codigo="${estagiarios[estagiariosIndex].codigo}" data-toggle="tooltip" data-placement="top" title="Adicionar Batida"> + </button>
                                    </td>`;

                            }

                            if(foundBanco){
                                html += `<td>
                                <button class="btn btn-primary btn-sm modificar-banco" data-dia="${currentDate.getFullYear()}-${("0"+(currentDate.getMonth()+1)).slice(-2)}-${("0"+currentDate.getDate()).slice(-2)}" data-codigo="${estagiarios[estagiariosIndex].codigo}" data-toggle="tooltip" data-placement="top" title="Modificar Banco de Horas"> <span class="glyphicon glyphicon-adjust"></span> </button>
                            </td>`;
                            }

                        }

                        html += `</tr>`;

                    }

                    $('#dados').html(html);
                    $('[data-toggle="tooltip"]').tooltip();
                } else {
                    alert('Erro! Data inicial maior que data final.');
                }

            } catch (error) {
                console.log(error);
            }
            $("#modal-loading").modal('hide');
        }

    }

    $('#dados').on('click', '.acrescentar-batida', function () {

        $("#batidaModal").find('input[name="data"]').val($(this).attr('data-dia'));
        $("#batidaModal").find('input[name="codigo"]').val($(this).attr('data-codigo'));
        $("#batidaModal").modal('show');

    });

    $('#dados').on('click', '.modificar-banco', function () {

        $("#bancoHorasModal").find('input[name="data"]').val($(this).attr('data-dia'));
        $("#bancoHorasModal").find('input[name="codigo"]').val($(this).attr('data-codigo'));
        $("#bancoHorasModal").modal('show');

    });

    $('#batidaForm').submit(async function (e) {

        e.preventDefault();
        let data = $(this).find('input[name="data"]').val();
        let horario = $(this).find('input[name="horario"]').val();
        let codigo = $(this).find('input[name="codigo"]').val();

        try {
            $("#batidaModal").modal('hide');
            $("#modal-loading2").modal('show');
            let enviado = await Batida.batidaManual(codigo, data, horario);
            $("#modal-loading2").modal('hide');

            if (enviado) {
                atualizarTabela();
            } else {
                alert('Erro ao realizar batida manual');
            }

        } catch (error) {
            console.log(error);
            alert('Erro ao realizar batida manual');
        }

    });

    $('#bancoHorasForm').submit(async function (e) {

        e.preventDefault();
        let data = $(this).find('input[name="data"]').val();
        let horas = $(this).find('input[name="horario"]').val();
        let codigo = $(this).find('input[name="codigo"]').val();
        let tipo = $(this).find('input[name="tipo"]:checked').val();

        try {
            $("#bancoHorasModal").modal('hide');
            $("#modal-loading2").modal('show');
            let enviado = await BancoHoras.alteraValue(codigo, data, horas, tipo == "sum" ? true : false);
            $("#modal-loading2").modal('hide');

            if (enviado) {
                atualizarTabela();
            } else {
                alert('Erro ao realizar alteração banco de horas');
            }



        } catch (error) {
            console.log(error);
            alert('Erro ao realizar alteração banco de horas');
        }

    });

    $('#btnNext').click(function () {
        estagiariosIndex = estagiariosIndex < estagiarios.length - 1 ? estagiariosIndex + 1 : 0;
        $("#estagiarioField").val(estagiarios[estagiariosIndex].nome);
        atualizarTabela();
    });

    $('#btnPrev').click(function () {
        estagiariosIndex = estagiariosIndex > 0 ? estagiariosIndex - 1 : estagiarios.length - 1;
        $("#estagiarioField").val(estagiarios[estagiariosIndex].nome);
        atualizarTabela();
    });

    $('#formAtualizar').submit(function (e) {
        e.preventDefault();
        atualizarTabela();
    });

    $("#imprimir").click(async function () {

        $("#modal-loading2").modal('show');
        let dtInicial = $("#dtInicial").val();
        let dtFinal = $("#dtFinal").val();

        let dataInicial = new Date(dtInicial);
        let dataFinal = new Date(dtFinal);

        if (dataFinal.getTime() > dataInicial.getTime()) {

            let visualInicial = new Date(dtInicial);
            let visualFinal = new Date(dtFinal);

            visualInicial.setDate(visualInicial.getDate() + 1);
            visualFinal.setDate(visualFinal.getDate() + 1);

            let empresa = await Empresa.find();

            let win = window.open('', '_blank');

            var docDefinition = {
                info: {
                    title: `Relatorio ${estagiarios[estagiariosIndex].nome}`,
                    author: 'Vila Rica Ponto'
                },
                content: [],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true
                    },
                    tableHeader: {
                        bold: true,
                        alignment: 'center',
                        fillColor: "#2D4D81",
                        color: "#ffffff"
                    }
                },
                defaultStyle: {
                    columnGap: 20,
                    font: 'OpenSans'
                },
                pageMargins: [20, 15, 20, 30]
            };


            let TopHeader = {
                columns: [{

                        image: 'data:image/png;base64,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',
                        width: 35,
                        height: 35,

                    },
                    [{
                            text: 'APONTAMENTO DE HORAS ESTAGIO',
                            fontSize: 16,
                            bold: true,
                            margin: [0, 0, 0, 4]
                        },
                        {
                            text: `DE ${('0'+visualInicial.getDate()).slice(-2)}/${('0'+(visualInicial.getMonth()+1)).slice(-2)}/${(''+visualInicial.getFullYear()).slice(-2)} ATÉ ${('0'+visualFinal.getDate()).slice(-2)}/${('0'+(visualFinal.getMonth()+1)).slice(-2)}/${(''+visualFinal.getFullYear()).slice(-2)}`,
                            fontSize: 8,
                            margin: [2, 0, 0, 0]
                        }
                    ],
                    {
                        width: '20%',
                        alignment: 'right',
                        text: `Emitido em ${ ('0'+ new Date().getDate()).slice(-2) }/${ ('0'+(new Date().getMonth()+1)).slice(-2) }/${ new Date().getFullYear() }`,
                        fontSize: 7
                    }
                ],
                margin: [0, 0, 0, 20]
            }

            let DownHeader = {
                columns: [],
                margin: [0, 0, 0, 20],
            }


            let HeaderLeft = {
                width: '60%',
                fontSize: 8,
                table: {
                    widths: ['100%'],
                    body: [
                        [`Empresa: ${empresa.nome}`],
                        [`CNPJ: ${empresa.cnpj}`],
                        [`Nome :   ${estagiarios[estagiariosIndex].nome}`],
                        [`Setor :   ${estagiarios[estagiariosIndex].setor}`]
                    ]
                }
            }

            let HeaderRight = {
                width: '40%',
                table: {
                    widths: ['auto', '*', '*', '*', '*', '*', '*'],
                    body: [
                        ['', 'ENT 1', 'SAI 1', 'ENT 2', 'SAI 2', 'ENT 3', 'SAI 3'],
                        ['SEG'],
                        ['TER'],
                        ['QUA'],
                        ['QUI'],
                        ['SEX'],
                        ['SAB'],
                        ['DOM']
                    ]
                },
                fontSize: 7
            }

            for (let horario of estagiarios[estagiariosIndex].horarios.segunda) {
                HeaderRight.table.body[1].push(horario);
            }
            for (let horario of estagiarios[estagiariosIndex].horarios.terca) {
                HeaderRight.table.body[2].push(horario);
            }
            for (let horario of estagiarios[estagiariosIndex].horarios.quarta) {
                HeaderRight.table.body[3].push(horario);
            }
            for (let horario of estagiarios[estagiariosIndex].horarios.quinta) {
                HeaderRight.table.body[4].push(horario);
            }
            for (let horario of estagiarios[estagiariosIndex].horarios.sexta) {
                HeaderRight.table.body[5].push(horario);
            }
            for (let horario of estagiarios[estagiariosIndex].horarios.sabado) {
                HeaderRight.table.body[6].push(horario);
            }
            for (let horario of estagiarios[estagiariosIndex].horarios.domingo) {
                HeaderRight.table.body[7].push(horario);
            }

            DownHeader.columns.push(HeaderLeft);
            DownHeader.columns.push(HeaderRight);

            docDefinition.content.push(TopHeader);
            docDefinition.content.push(DownHeader);

            let Tabela = {

                table: {
                    headerRows: 1,
                    widths: ['14.5%', '8%', '8%', '8%', '8%', '8%', '8%', '12%', '8.5%', '8.5%', '8.5%'],
                    body: [
                        [{
                            text: 'DIA',
                            style: 'tableHeader'
                        }, {
                            text: 'ENT 1',
                            style: 'tableHeader'
                        }, {
                            text: 'SAI 1',
                            style: 'tableHeader'
                        }, {
                            text: 'ENT 2',
                            style: 'tableHeader'
                        }, {
                            text: 'SAI 2',
                            style: 'tableHeader'
                        }, {
                            text: 'ENT 3',
                            style: 'tableHeader'
                        }, {
                            text: 'SAI 3',
                            style: 'tableHeader'
                        }, {
                            text: 'HR. TRABALHADA',
                            style: 'tableHeader'
                        }, {
                            text: 'DEBITO',
                            style: 'tableHeader'
                        }, {
                            text: 'CREDITO',
                            style: 'tableHeader'
                        }, {
                            text: 'SALDO',
                            style: 'tableHeader'
                        }]
                    ]
                },
                fontSize: 7
            }

            let {
                batidas,
                bancos
            } = await estagiarios[estagiariosIndex].getBatidas(dtInicial, dtFinal);

            let feriados = await Feriado.getFeriados(dtInicial, dtFinal);
            let qtDias = (dataFinal.getTime() - dataInicial.getTime()) / 8.64e+7;
            let currentDate = dataInicial;

            for (let i = 0; i <= qtDias; i++) {

                let arrayLinha = [];

                let batidasDia = [];

                currentDate.setDate(currentDate.getDate() + 1);

                arrayLinha.push(`${('0'+currentDate.getDate()).slice(-2)}/${('0'+(currentDate.getMonth()+1)).slice(-2)}/${(''+currentDate.getFullYear()).slice(-2)} - ${ diasDaSemana[currentDate.getDay()].slice(0, 3)}`);

                let hasFeriado = false;

                for (let feriado of feriados) {

                    let dataInicial = new Date(feriado.dtInicial);
                    let dataFinal = new Date(feriado.dtFinal);

                    if (currentDate.getMonth() == dataInicial.getUTCMonth() || currentDate.getMonth() == dtFinal.getUTCMonth()) {

                        if (currentDate.getDate() >= dataInicial.getUTCDate() && currentDate.getDate() <= dataFinal.getUTCDate()) {
                            hasFeriado = true;
                        }

                    }

                }

                if (hasFeriado) {
                    for (let j = 0; j < 7; j++)
                        arrayLinha.push('Feriado');

                    let foundBanco = false;

                    for (let banco of bancos) {

                        let bancoDate = new Date(banco.data);

                        if (bancoDate.getUTCDate() == currentDate.getDate() && bancoDate.getUTCMonth() == currentDate.getMonth()) {
                            arrayLinha.push(banco.debito);
                            arrayLinha.push(banco.credito);
                            arrayLinha.push(banco.valorAcumulado);
                            foundBanco = true;
                        }

                    }

                    if (!foundBanco) {

                        arrayLinha.push(' - ');
                        arrayLinha.push(' - ');
                        arrayLinha.push(' - ');

                    }
                } else if (estagiarios[estagiariosIndex].horarios[diasDaSemana[currentDate.getDay()] + 'Folga']) {

                    for (let j = 0; j < 7; j++)
                        arrayLinha.push('Folga');

                    let foundBanco = false;

                    for (let banco of bancos) {

                        let bancoDate = new Date(banco.data);

                        if (bancoDate.getUTCDate() == currentDate.getDate() && bancoDate.getUTCMonth() == currentDate.getMonth()) {

                            arrayLinha.push(banco.debito);
                            arrayLinha.push(banco.credito);
                            arrayLinha.push(banco.valorAcumulado);
                            foundBanco = true;

                        }

                    }

                    if (!foundBanco) {

                        arrayLinha.push(' - ');
                        arrayLinha.push(' - ');
                        arrayLinha.push(' - ');

                    }


                } else {

                    for (let batida of batidas) {

                        let batidaDate = new Date(batida.data);

                        if (batidaDate.getDate() == currentDate.getDate() && batidaDate.getMonth() == currentDate.getMonth()) {

                            arrayLinha.push(`${('0'+batidaDate.getHours()).slice(-2)}:${('0'+(batidaDate.getMinutes())).slice(-2)} ${batida.manual ? '*' : ''}`);

                            batidasDia.push(batidaDate);
                        }
                    }

                    for (let j = 0; j < 6 - batidasDia.length; j++) {

                        arrayLinha.push('');

                    }


                    if (batidasDia.length > 0 && batidasDia.length % 2 == 0) {

                        let millisTotal = 0;

                        for (let j = 0; j < batidasDia.length / 2; j++) {

                            millisTotal += batidasDia[(j * 2) + 1].getTime() - batidasDia[j * 2].getTime();

                        }

                        arrayLinha.push(`${ Time.convertToTimeString(millisTotal) }`);

                    } else {
                        arrayLinha.push(' - ');
                    }

                    let foundBanco = false;

                    for (let banco of bancos) {

                        let bancoDate = new Date(banco.data);

                        if (bancoDate.getUTCDate() == currentDate.getDate() && bancoDate.getUTCMonth() == currentDate.getMonth()) {
                            arrayLinha.push(banco.debito);
                            arrayLinha.push(banco.credito);
                            arrayLinha.push(banco.valorAcumulado);
                            foundBanco = true;
                        }

                    }

                    if (!foundBanco) {

                        arrayLinha.push(' - ');
                        arrayLinha.push(' - ');
                        arrayLinha.push(' - ');

                    }

                }

                Tabela.table.body.push(arrayLinha);

            }

            docDefinition.content.push(Tabela);

            let Legendas = {
                columns: [{
                    text: '(*) - Batida lançada manualmente',
                    fontSize: 8
                }],
                margin: [0, 0, 0, 50]
            }

            let Footer = {
                columns: [
                    [{
                            text: '_______________________________________'
                        },
                        {
                            text: `${estagiarios[estagiariosIndex].nome}`,
                            fontSize: 10
                        }
                    ],

                    [{
                            text: '_______________________________________'
                        },
                        {
                            text: 'Empresa',
                            fontSize: 10
                        }
                    ]
                ]
            }

            docDefinition.content.push(Legendas);
            docDefinition.content.push(Footer);

            pdfMake.fonts = {
                OpenSans: {
                    normal: 'OpenSans-Regular.ttf',
                    bold: 'OpenSans-Bold.ttf',
                    italics: 'OpenSans-Italic.ttf',
                    bolditalics: 'OpenSans-BoldItalic.ttf'
                }
            }

            let pdfMaked = pdfMake.createPdf(docDefinition);


            if (window.nw) {
                pdfMaked.getDataUrl((data) => {
                    nw.Window.open(data, {}, function (newWin) {
                        win = newWin;
                        $("#modal-loading2").modal('hide');
                        win.maximize();
                    });
                });

            } else {
                $("#modal-loading2").modal('hide');
                pdfMaked.open({}, win);
            }




        } else {
            alert('Erro! Data inicial maior que data final.');
        }
    });

    $("#imprimir-todos").click(async function () {
        $("#modal-loading2").modal('show');
        let dtInicial = $("#dtInicial").val();
        let dtFinal = $("#dtFinal").val();

        let dataInicial = new Date(dtInicial);
        let dataFinal = new Date(dtFinal);

        if (dataFinal.getTime() > dataInicial.getTime()) {

            let visualInicial = new Date(dtInicial);
            let visualFinal = new Date(dtFinal);

            let feriados = await Feriado.getFeriados(dtInicial, dtFinal);
            let empresa = await Empresa.find();
            visualInicial.setDate(visualInicial.getDate() + 1);
            visualFinal.setDate(visualFinal.getDate() + 1);

            let win = window.open('', '_blank');

            var docDefinition = {
                info: {
                    title: `Relatorio Geral`,
                    author: 'Vila Rica Ponto'
                },
                content: [],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true
                    },
                    tableHeader: {
                        bold: true,
                        alignment: 'center',
                        fillColor: "#2D4D81",
                        color: "#ffffff"
                    }
                },
                defaultStyle: {
                    columnGap: 20,
                    font: 'OpenSans'
                },
                pageMargins: [20, 15, 20, 30]
            };

            for (let index in estagiarios) {

                let TopHeader = {
                    columns: [{

                            image: 'data:image/png;base64,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',
                            width: 35,
                            height: 35,

                        },
                        [{
                                text: 'APONTAMENTO DE HORAS ESTAGIO',
                                fontSize: 16,
                                bold: true,
                                margin: [0, 0, 0, 4]
                            },
                            {
                                text: `DE ${('0'+visualInicial.getDate()).slice(-2)}/${('0'+(visualInicial.getMonth()+1)).slice(-2)}/${(''+visualInicial.getFullYear()).slice(-2)} ATÉ ${('0'+visualFinal.getDate()).slice(-2)}/${('0'+(visualFinal.getMonth()+1)).slice(-2)}/${(''+visualFinal.getFullYear()).slice(-2)}`,
                                fontSize: 8,
                                margin: [2, 0, 0, 0]
                            }
                        ],
                        {
                            width: '20%',
                            alignment: 'right',
                            text: `Emitido em ${ ('0'+ new Date().getDate()).slice(-2) }/${ ('0'+(new Date().getMonth()+1)).slice(-2) }/${ new Date().getFullYear() }`,
                            fontSize: 7
                        }
                    ],
                    margin: [0, 0, 0, 20]
                }

                let DownHeader = {
                    columns: [],
                    margin: [0, 0, 0, 20],
                }


                let HeaderLeft = {
                    width: '60%',
                    fontSize: 8,
                    table: {
                        widths: ['100%'],
                        body: [
                            [`Empresa: ${empresa.nome}`],
                            [`CNPJ: ${empresa.cnpj}`],
                            [`Nome :   ${estagiarios[index].nome}`],
                            [`Setor :   ${estagiarios[index].setor}`]
                        ]
                    }
                }

                let HeaderRight = {
                    width: '40%',
                    table: {
                        widths: ['auto', '*', '*', '*', '*', '*', '*'],
                        body: [
                            ['', 'ENT 1', 'SAI 1', 'ENT 2', 'SAI 2', 'ENT 3', 'SAI 3'],
                            ['SEG'],
                            ['TER'],
                            ['QUA'],
                            ['QUI'],
                            ['SEX'],
                            ['SAB'],
                            ['DOM']
                        ]
                    },
                    fontSize: 7
                }

                for (let horario of estagiarios[index].horarios.segunda) {
                    HeaderRight.table.body[1].push(horario);
                }
                for (let horario of estagiarios[index].horarios.terca) {
                    HeaderRight.table.body[2].push(horario);
                }
                for (let horario of estagiarios[index].horarios.quarta) {
                    HeaderRight.table.body[3].push(horario);
                }
                for (let horario of estagiarios[index].horarios.quinta) {
                    HeaderRight.table.body[4].push(horario);
                }
                for (let horario of estagiarios[index].horarios.sexta) {
                    HeaderRight.table.body[5].push(horario);
                }
                for (let horario of estagiarios[index].horarios.sabado) {
                    HeaderRight.table.body[6].push(horario);
                }
                for (let horario of estagiarios[index].horarios.domingo) {
                    HeaderRight.table.body[7].push(horario);
                }

                DownHeader.columns.push(HeaderLeft);
                DownHeader.columns.push(HeaderRight);

                docDefinition.content.push(TopHeader);
                docDefinition.content.push(DownHeader);

                let Tabela = {

                    table: {
                        headerRows: 1,
                        widths: ['14.5%', '8%', '8%', '8%', '8%', '8%', '8%', '12%', '8.5%', '8.5%', '8.5%'],
                        body: [
                            [{
                                text: 'DIA',
                                style: 'tableHeader'
                            }, {
                                text: 'ENT 1',
                                style: 'tableHeader'
                            }, {
                                text: 'SAI 1',
                                style: 'tableHeader'
                            }, {
                                text: 'ENT 2',
                                style: 'tableHeader'
                            }, {
                                text: 'SAI 2',
                                style: 'tableHeader'
                            }, {
                                text: 'ENT 3',
                                style: 'tableHeader'
                            }, {
                                text: 'SAI 3',
                                style: 'tableHeader'
                            }, {
                                text: 'HR. TRABALHADA',
                                style: 'tableHeader'
                            }, {
                                text: 'DEBITO',
                                style: 'tableHeader'
                            }, {
                                text: 'CREDITO',
                                style: 'tableHeader'
                            }, {
                                text: 'SALDO',
                                style: 'tableHeader'
                            }]
                        ]
                    },
                    fontSize: 7
                }

                let {
                    batidas,
                    bancos
                } = await estagiarios[index].getBatidas(dtInicial, dtFinal);


                let qtDias = (dataFinal.getTime() - dataInicial.getTime()) / 8.64e+7;
                let currentDate = new Date(dtInicial);

                for (let i = 0; i <= qtDias; i++) {

                    let arrayLinha = [];

                    let batidasDia = [];

                    currentDate.setDate(currentDate.getDate() + 1);

                    arrayLinha.push(`${('0'+currentDate.getDate()).slice(-2)}/${('0'+(currentDate.getMonth()+1)).slice(-2)}/${(''+currentDate.getFullYear()).slice(-2)} - ${ diasDaSemana[currentDate.getDay()].slice(0, 3)}`);

                    let hasFeriado = false;

                    for (let feriado of feriados) {

                        let dataInicial = new Date(feriado.dtInicial);
                        let dataFinal = new Date(feriado.dtFinal);

                        if (currentDate.getMonth() == dataInicial.getUTCMonth() || currentDate.getMonth() == dtFinal.getUTCMonth()) {

                            if (currentDate.getDate() >= dataInicial.getUTCDate() && currentDate.getDate() <= dataFinal.getUTCDate()) {
                                hasFeriado = true;
                            }

                        }

                    }

                    if (hasFeriado) {
                        for (let j = 0; j < 7; j++)
                            arrayLinha.push('Feriado');

                        let foundBanco = false;

                        for (let banco of bancos) {

                            let bancoDate = new Date(banco.data);

                            if (bancoDate.getUTCDate() == currentDate.getDate() && bancoDate.getUTCMonth() == currentDate.getMonth()) {
                                arrayLinha.push(banco.debito);
                                arrayLinha.push(banco.credito);
                                arrayLinha.push(banco.valorAcumulado);
                                foundBanco = true;
                            }

                        }

                        if (!foundBanco) {

                            arrayLinha.push(' - ');
                            arrayLinha.push(' - ');
                            arrayLinha.push(' - ');

                        }
                    } else if (estagiarios[index].horarios[diasDaSemana[currentDate.getDay()] + 'Folga']) {

                        for (let j = 0; j < 7; j++)
                            arrayLinha.push('Folga');

                        let foundBanco = false;

                        for (let banco of bancos) {

                            let bancoDate = new Date(banco.data);

                            if (bancoDate.getUTCDate() == currentDate.getDate() && bancoDate.getUTCMonth() == currentDate.getMonth()) {

                                arrayLinha.push(banco.debito);
                                arrayLinha.push(banco.credito);
                                arrayLinha.push(banco.valorAcumulado);
                                foundBanco = true;

                            }

                        }

                        if (!foundBanco) {

                            arrayLinha.push(' - ');
                            arrayLinha.push(' - ');
                            arrayLinha.push(' - ');

                        }


                    } else {

                        for (let batida of batidas) {

                            let batidaDate = batida.date_object;

                            if (batidaDate.getDate() == currentDate.getDate() && batidaDate.getMonth() == currentDate.getMonth()) {

                                arrayLinha.push(`${('0'+batidaDate.getHours()).slice(-2)}:${('0'+(batidaDate.getMinutes())).slice(-2)} ${batida.manual ? '*' : ''}`);

                                batidasDia.push(batidaDate);
                            }
                        }

                        for (let j = 0; j < 6 - batidasDia.length; j++) {

                            arrayLinha.push('');

                        }


                        if (batidasDia.length > 0 && batidasDia.length % 2 == 0) {

                            let millisTotal = 0;

                            for (let j = 0; j < batidasDia.length / 2; j++) {

                                millisTotal += batidasDia[(j * 2) + 1].getTime() - batidasDia[j * 2].getTime();

                            }

                            arrayLinha.push(`${ Time.convertToTimeString(millisTotal) }`);

                        } else {
                            arrayLinha.push(' - ');
                        }

                        let foundBanco = false;

                        for (let banco of bancos) {

                            let bancoDate = new Date(banco.data);

                            if (bancoDate.getUTCDate() == currentDate.getDate() && bancoDate.getUTCMonth() == currentDate.getMonth()) {
                                arrayLinha.push(banco.debito);
                                arrayLinha.push(banco.credito);
                                arrayLinha.push(banco.valorAcumulado);
                                foundBanco = true;
                            }

                        }

                        if (!foundBanco) {

                            arrayLinha.push(' - ');
                            arrayLinha.push(' - ');
                            arrayLinha.push(' - ');

                        }

                    }

                    Tabela.table.body.push(arrayLinha);

                }

                docDefinition.content.push(Tabela);

                let Legendas = {
                    columns: [{
                        text: '(*) - Batida lançada manualmente',
                        fontSize: 8
                    }],
                    margin: [0, 0, 0, 50]
                }

                let Footer = {
                    columns: [
                        [{
                                text: '_______________________________________'
                            },
                            {
                                text: `${estagiarios[index].nome}`,
                                fontSize: 10
                            }
                        ],

                        [{

                                text: '_______________________________________'
                            },
                            {
                                text: 'Empresa',
                                fontSize: 10
                            }
                        ]
                    ],
                    pageBreak: 'after'
                }

                docDefinition.content.push(Legendas);
                docDefinition.content.push(Footer);


            }

            pdfMake.fonts = {
                OpenSans: {
                    normal: 'OpenSans-Regular.ttf',
                    bold: 'OpenSans-Bold.ttf',
                    italics: 'OpenSans-Italic.ttf',
                    bolditalics: 'OpenSans-BoldItalic.ttf'
                }
            }

            let pdfMaked = pdfMake.createPdf(docDefinition);


            if (window.nw) {
                pdfMaked.getDataUrl((data) => {
                    nw.Window.open(data, {}, function (newWin) {
                        win = newWin;
                        $("#modal-loading2").modal('hide');
                        win.maximize();
                    });
                });

            } else {
                $("#modal-loading2").modal('hide');
                pdfMaked.open({}, win);
            }

        } else {
            alert('Erro! Data inicial maior que data final.');
        }

    });

};