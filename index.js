// const morgan = require('morgan')
// morgan('tiny')
require('dotenv').config()
const express = require('express')
const app = express()

app.use(express.static('dist'))

app.use(express.json())

const Person = require('./models/person')
// morgan.token('body', (req, res) => req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : 'No data')

// app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


let phonebook = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

Person.find({}).then(persons => {
    if(persons.length === 0){
        phonebook.forEach(personObj => {
            const person = new Person({
                name: personObj.name,
                number: personObj.number
            })
            
            person.save()
        })
    }
})

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    const date = new Date()
    Person.find({}).then(persons => {
        response.send(`<p>Phonebook has info for ${persons.length} people</p><br/><p>${date.toString()}</p>`)
    })
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndUpdate(request.params.id, request.body, {new: true})
    .then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const person = new Person({
        name: request.body.name,
        number: request.body.number
    })

    person.save()
    .then(result => {
        response.json(result)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    if(error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }else if(error.name === 'ValidationError'){
        return response.status(400).send({error: error.message})
    }

    next(error)
}

app.use(errorHandler)

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)