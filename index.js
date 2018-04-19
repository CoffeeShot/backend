const express = require('express')
const fs = require('fs')
const bodyparser = require('body-parser')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
app.use(cors())
app.use(bodyparser.json())
app.use(morgan(':method :url :status :content - :response-time ms'))


morgan.token('content', (req) => JSON.stringify(req.body))

const api = JSON.parse(fs.readFileSync("db.json"))

app.get('/', (req, res) => {
    res.send('<h1>Tervetuloa!</h1>')
})

app.get('/api', (req, res) => {
    res.send('<p>Tarkoititko <em>/api/persons</em> ?</p>')
})

app.get('/api/persons', (req, res) => {
    res.json(api.persons)
})
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = api.persons.find(person => person.id === id )
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})
app.post('/api/persons/', (req, res) => {
    let id = Math.floor(Math.random()*1000)
    const name = req.body["name"]
    const number = req.body["number"]
    const newFile = api.persons
    if (name === null || name.length === 0 || number === null || number.length === 0) {
        console.log('error: name or number empty')
        res.status(411).send({ error: 'name or number empty' })
    } else {
        if (newFile.map(yht => yht["name"]).includes(name)) {
            console.log('error: name must be unique')
            res.status(409).send({ error: 'name must be unique' })
        } else {
            newFile.push(
                {
                    "name": name,
                    "number": number,
                    "id": id
                }
            )
            fs.writeFileSync("db.json", JSON.stringify({"persons": newFile}))
            console.log('yhteystieto vastaanotettu')
            res.status(201).send('<p>yhteystieto vastaanotettu</p>')
        }
    }
})
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const saved = api.persons.filter(person => person.id !== id)
    if (saved) {
        fs.writeFileSync("db.json", JSON.stringify({"persons": saved}))
    } else {
        res.status(204).send('<p>yhteystieto poistettu</p>')
    }
})
app.get('/info', (req, res) => {
    res.send('<h3>Info-sivu</h3>' +
        '<p>puhelinluettelossa on yhteensä '+api.persons.length+' henkilöä.</p>' +
        '<br> Pyyntö tehty: '+new Date().toLocaleString())
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
