var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
    id: 1,
    description: 'go buy some food',
    completed: false
}, {
    id: 2,
    description: 'go to the cinema',
    completed: false
}, {
    id: 3,
    description: 'eat dinner with family',
    completed: true
}];

app.get('/', function (req, res) {
    res.send('Todo api root');
});

//GET todos/
app.get('/todos', function (req, res) {
    res.json(todos);
});

//GET todos/:id
app.get('/todos/:id', function (req, res) {
    var todoID = parseInt(req.params.id, 10);
    var matchedtodo;

    todos.forEach(function (todo) {
        if (todo.id === todoID) {
            matchedtodo = todo;
        }
    });

    if (matchedtodo) {
        res.json(matchedtodo);
    } else {
        res.status(404).send();
    }
});

app.listen(PORT, function () {
    console.log('server listening on port ' + PORT);
});