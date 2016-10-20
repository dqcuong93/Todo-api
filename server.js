var express = require('express');
var bodyParse = require('body-parser');
var _ = require('underscore');
var db = require('./db');
var bcrypt = require('bcrypt');
var middleware = require('./middleware')(db);

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


//GET /todos
//GET with QUERY /todos?completed=true&q=work
app.get('/todos', middleware.requireAuthentication, function (req, res) {
    var query = req.query;
    var where = {
        userId: req.user.get('id')
    };

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        }
    }

    db.todo.findAll({
        where: where
    }).then(function (todos) {
        res.json(todos);
    }, function (e) {
        res.status(500).send();
    });

    //var filteredTodo = todos;
    //
    //if (query.hasOwnProperty('completed') && query.completed === 'true') {
    //    filteredTodo = _.where(filteredTodo, {completed: true});
    //} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
    //    filteredTodo = _.where(filteredTodo, {completed: false});
    //}
    //
    //if (query.hasOwnProperty('q') && query.q.length > 0) {
    //    filteredTodo = _.filter(filteredTodo, function (todo) {
    //        return todo.description.toLowerCase().indexOf(query.q.toLowerCase()) > -1;
    //    })
    //}
    //
    //res.json(filteredTodo);
});


//GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoID = parseInt(req.params.id, 10);

    db.todo.findOne({
        where: {
            id: todoID,
            userId: req.user.get('id')
        }
    }).then(function (todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }).catch(function (e) {
        res.status(500).send();
    });

    //var matchedTodo = _.findWhere(todos, {id: todoID});
    ////var matchedtodo;
    ////
    ////todos.forEach(function (todo) {
    ////    if (todo.id === todoID) {
    ////        matchedtodo = todo;
    ////    }
    ////});
    //
    //if (matchedTodo) {
    //    res.json(matchedTodo);
    //} else {
    //    res.status(404).send();
    //}
});


//POST /todos with body-parser module
app.post('/todos', middleware.requireAuthentication, function (req, res) {
    //pick method is to keep the information that we want
    var body = _.pick(req.body, 'description', 'completed');

    //First way
    //db.todo.create({
    //    description: body.description,
    //    completed: body.completed
    //}).then(function (todo) {
    //    res.status(200).send(todo.toJSON());
    //}).catch(function (e) {
    //    res.status(400).json(e);
    //});

    //Another way
    db.todo.create(body).then(function (todo) {
        req.user.addTodo(todo).then(function () {
            return todo.reload();
        }).then(function (todo) {
            res.json(todo.toJSON());
        })
    }, function (e) {
        res.status(400).json(e);
    });


    //if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    //    return res.status(400).send();
    //}
    //
    ////Trim remove space before and after sentence
    //body.description = body.description.trim();
    //
    //body.id = todoNextID;
    //todos.push(body);
    //todoNextID += 1;
    //res.send(body);
});


//DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoID = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoID,
            userId: req.user.get('id')
        }
    }).then(function (deletedRows) {
        if (deletedRows === 0) {
            res.status(404).send('Data not found');
        } else {
            res.status(204).send('You have deleted ' + deletedRows + ' row(s)');
        }
    }).catch(function (e) {
        res.status(500).send(e);
    });

    //var matchedTodo = _.findWhere(todos, {id: todoID});
    //
    //if (matchedTodo) {
    //    todos = _.without(todos, matchedTodo);
    //    res.status(200).json(matchedTodo);
    //} else {
    //    res.status(404).send('Not found!');
    //}
});


//PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};
    var todoID = parseInt(req.params.id, 10);
    //var matchedTodo = _.findWhere(todos, {id: todoID});

    //var validAttribute = {};
    //if (!matchedTodo) {
    //    return res.status(404).send();
    //}

    //if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    //    validAttribute.completed = body.completed;
    //} else if (body.hasOwnProperty('completed')) {
    //    return res.status(400).send();
    //}
    //
    //if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    //    validAttribute.description = body.description;
    //} else if (body.hasOwnProperty('description')) {
    //    return res.status(400).send();
    //}

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    //_.extend(matchedTodo, validAttribute);
    //res.status(200).json(matchedTodo);

    db.todo.findOne({
        where: {
            id: todoID,
            userId: req.user.get('id')
        }
    }).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                res.send(todo.toJSON());
            }, function (e) {
                res.status(400).json(e);        //400 means invalid synctax
            });
        } else {
            res.status(404).json({
                error: 'Data not found!'
            })
        }
    }, function () {
        res.status(500).send();
    })
});

// POST /users
app.post('/users', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function (user) {
        res.status(200).json(user.toPublicJSON());
    }, function (e) {
        res.status(400).json(e);
    })
});

// POST /users/login
app.post('/users/login', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function (user) {
        var token = user.generateToken('authentincation');
        userInstance = user;

        return db.token.create({
            token: token
        });
    }).then(function (tokenInstance) {
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch(function () {
        res.status(401).send();
    });
});

// DELETE /users/login
app.delete('/users/login', middleware.requireAuthentication, function (req, res) {
    req.token.destroy().then(function () {
        res.status(204).send();
    }).catch(function () {
        res.status(500).send();
    })
});

db.sequelize.sync({force: true}).then(function () {
    app.listen(PORT, function () {
        console.log('server listening on port ' + PORT);
    });
});