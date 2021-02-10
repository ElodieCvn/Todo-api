const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { request } = require('express');
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost/todos', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const port = 3000;
const db = mongoose.connection;

app.use(bodyParser.json());
app.use(cors({origin: 'http://localhost:8080'}));

const Todo = mongoose.model('Todo', new Schema({
    content: { type: String, required: true},
    doneAt: Date
}, { timestamps: true}));

db.once('open', () => {
  console.log('Db is open');
})

db.on('error', console.error.bind(console));

app.get('/', (req, res) => {
  res.send("Coucou\r\n");
});

app.get('/todos', async(req, res) => {
    try{
        const todos = await Todo.find();
        res.send(todos);
    } catch({message}){
        res.status(500).send({message});
    }
   
});

app.post('/todos', async(req, res) =>{
    try {
        const { content } = req.body;
    let todo = new Todo({content});
    todo = await todo.save();
    res.send(todo);
    }catch({message}){
        res.status(500).send({ message })
    }
});

app.delete('/todos/:id', async (req,res) => {
    try{
        const { id } = req.params;
        const todo = await Todo.findByIdAndRemove(id);
        if(!todo) res.status(404).send();
        else res.send(todo);
    }catch({message, kind, name}){
        if(kind === 'ObjectId' || name === 'NotFound') res.status(404).send();
        else res.status(500).send({ message })
    }
});

app.put('/todos/:id', async (req,res) => {
    try{
        const { id } = req.params;
        const { content, doneAt } = req.body;
        const todo = await Todo.findByIdAndUpdate(id, { content, doneAt });
        if(!todo) res.status(404).send();
        else res.send(todo);
    }catch({message, kind, name}){
        if(kind === 'ObjectId' || name === 'NotFound') res.status(404).send();
        else res.status(500).send({ message })
    }
});

app.listen(port, () => {
  console.log('Server is listening...');
})