var fs = require("fs");
var express = require('express');
var app = express();
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/', function (req, res) {});
app.get('/nusp', function (req, res) {
    var json = {
        'nusp': req.query["data"]
    };
    res.json(json);
    addTimesTamp('nusp');
});

app.get('/mean', function (req, res) {
    addTimesTamp('mean');
    var values = req.query["data"].split(",");
    var sum = 0;
    var i = 0;
    for (i; i < values.length; i++) {
        sum = parseInt(sum) + parseInt(values[i]);
    }

    var json = {
        'mean': sum / (i - 1)
    };
    res.json(json);
});

app.get('/log', function (req, res) {
    addTimesTamp('log');
    res.json(getJson());
});

app.listen(3000, '127.0.0.1', function () {});

function getJson() {
    var jsonFile = fs.readFileSync('data.json').toString();
    jsonFile = JSON.parse(jsonFile);
    return jsonFile;
}

function addTimesTamp(servico) {

    var date = new Date();
    date.toJSON();

    let newJson = [{
        data: date,
        service: servico
    }];
    var open;
    if (!fs.existsSync('data.json'))
        open = fs.openSync('data.json', 'w+');
    else open = fs.openSync('data.json', 'r+');
    if (open == null) {
        alert("Problema ao abrir arquivo");
        return;
    }
    var size = fs.statSync('data.json').size;
    size = parseInt(size);
    if (size == 0) {
        var writeFirst = fs.writeSync(open, JSON.stringify(newJson));
    } else {
        var dados;
        var jsonFile = fs.readFileSync('data.json').toString();
        jsonFile = JSON.parse(jsonFile);
        console.log(jsonFile);
        jsonFile.push(newJson);
        console.log(jsonFile);
        var write = fs.writeSync(open, JSON.stringify(jsonFile), 0, 'utf8');
    }
    var close = fs.closeSync(open);
}
