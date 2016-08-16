var express = require('express');
var bodyParse = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
//var todos = [{
//    id: 1,
//    description: 'go buy some food',
//    completed: false
//}, {
//    id: 2,
//    description: 'go to the movie theater',
//    completed: false
//}, {
//    id: 3,
//    description: 'eat dinner with family',
//    completed: true
//}];
var todos = [];
var todoNextID = 1;

app.use(bodyParse.json());

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
    var matchedTodo = _.findWhere(todos, {id: todoID});
    //var matchedtodo;
    //
    //todos.forEach(function (todo) {
    //    if (todo.id === todoID) {
    //        matchedtodo = todo;
    //    }
    //});

    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

//POST todos/ with body-parser module
app.post('/todos', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400).send();
    }

    body.description = body.description.trim();

    body.id = todoNextID;
    todos.push(body);
    todoNextID += 1;
    res.send(body);
});

app.listen(PORT, function () {
    console.log('server listening on port ' + PORT);
});