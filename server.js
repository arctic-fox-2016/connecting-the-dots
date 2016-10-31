import express from 'express'
import schema from './schema.js'
import {graphql} from 'graphql'
import GraphQLHTTP from 'express-graphql'
import bodyParser from 'body-parser'

const app = express()

app.use(bodyParser())

app.use('/graphql', GraphQLHTTP({
  schema: schema,
  pretty: true,
  graphiql: true
}))

app.get('/', function(req,res){
  let query = '{counter {counter}}'
  graphql(schema, query).then((result)=>{
    res.json(result)
  })
})

app.get('/counter', function(req,res){
  let query = 'mutation {counter {counter}}'
  graphql(schema, query).then((result)=>{
    res.json(result)
  })
})

app.listen(3000, ()=>{
  console.log('server is running')
})
