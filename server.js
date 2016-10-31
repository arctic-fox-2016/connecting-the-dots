import express from 'express'
import bodyParser from 'body-parser'
import schema from './schema.js'
import {graphql} from 'graphql'
import GraphQLHTTP from 'express-graphql'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res, next) => {
  let query = '{counter {id number}}'
  graphql(schema, query).then(result => {
    res.json(result)
  })
})

app.post('/', (req, res, next) => {
  let query = `mutation{add (number:${req.body.number}) {id number}}`
  graphql(schema, query).then(result => {
    res.json(result)
  })
})

app.put('/', (req, res, next) => {
  let query = `mutation{edit (id:"${req.body.id}", number:${req.body.number}) {id number}}`
  graphql(schema, query).then(result => {
    res.json(result)
  })
})

app.delete('/', (req, res, next) => {
  let query = `mutation{delete (id:"${req.body.id}") {id number}}`
  graphql(schema, query).then(result => {
    res.json(result)
  })
})

app.get('/init', (req, res, next) => {
  let query = 'mutation {initiate {id number}}'
  graphql(schema, query).then(result => {
    res.json(result)
  })
})

app.get('/counter', function(req,res){
  let query = 'mutation {counter {counter}}'
  graphql(schema, query).then((result)=>{
    res.json(result)
  })
})

app.use('/graphql', GraphQLHTTP({
  schema: schema,
  pretty: true,
  graphiql: true
}))

app.listen(3000, (err) => {
  if(err) console.log(err)
  else console.log('Server is running')
})
