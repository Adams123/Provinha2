var fs = require("fs");
var express = require('express');
var app = express();

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-type', 'application/json');
    next();
});

app.get('/', function (req, res) {});
app.get('/nusp', function (req, res) { //exibe nusp
    addTimesTamp('nusp');
    var json = {
        'nusp': "6791943"
    };
    res.json(json);
});

app.get('/median', function (req, res) { //calcula mediana
    addTimesTamp('median');
    let values = req.query["data"].split(","); //pega o resultado da querystring e separa por ','
    for (var i = 0; i < values.length; i++) { //converte a string para inteiros, para trabalhar mais facilmente
        values[i] = parseInt(values[i]);
    }
    values.sort(ordena);
    let meio = parseInt(values.length / 2);
    var json;
    var mediana;
    if (values.length % 2 == 1) { //impar
        mediana = values[meio];
    } else { //par
        mediana = parseInt(values[meio - 1]) + parseInt(values[meio]);
        mediana = mediana / 2;
    }
    json = {
        "median": mediana.toString(),
    };
    res.json(json);
});

app.get('/log', function (req, res) {
    addTimesTamp('log');
    res.json(getJson());
});

app.listen(3000, '127.0.0.1', function () {}); //escuta endereço 127.0.0.1:3000

function getJson() { //le todo o arquivo de dados
    var jsonFile = fs.readFileSync('data.json').toString();
    jsonFile = JSON.parse(jsonFile);
    return jsonFile;
}


/*
Dado um servico, pega a data no formato especificado e adiciona no arquivo data.json. Caso já exista dados dentro dele, le todo o arquivo, adiciona novo dado e reescreve. Optou-se desta forma para necessitar de menos manipulação de arquivo
*/
function addTimesTamp(servico) {

    var date = new Date();
    date.toJSON(); //formata a data para o jeito especificado

    let newJson = { //json para insercoes
        data: date,
        service: servico
    };

    let newArrayJson = [];
    var open;
    if (!fs.existsSync('data.json')) //caso nao exista o arquivo cria um
        open = fs.openSync('data.json', 'w+');
    else open = fs.openSync('data.json', 'r+'); //caso exista abre para leitura e escrita
    if (open == null) {
        alert("Problema ao abrir arquivo");
        return;
    }
    var size = fs.statSync('data.json').size;
    size = parseInt(size);
    if (size == 0) { //arquivo nao existe
        newArrayJson.push(newJson);
        var writeFirst = fs.writeSync(open, JSON.stringify(newArrayJson));
    } else if (size <= 5) { //arquivo existe mas esta vazio, normalmente tem size=2, mas pode variar dependendo do SO
        newArrayJson.push(newJson);
        var writeFirst = fs.writeSync(open, JSON.stringify(newArrayJson), 0, 'utf8');
    } else { //arquivo existe e ja existe log nele
        var dados;
        var jsonFile = fs.readFileSync('data.json').toString();
        jsonFile = JSON.parse(jsonFile);
        jsonFile.push(newJson);
        var write = fs.writeSync(open, JSON.stringify(jsonFile), 0, 'utf8');
    }
    var close = fs.closeSync(open);
}

function ordena(a, b) {
    return a - b;
}
