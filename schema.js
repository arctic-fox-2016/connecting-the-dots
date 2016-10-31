import mongoose from 'mongoose'
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
  GraphQLInt
} from 'graphql'

let angkaSchema = new mongoose.Schema({
  counter: Number
})

let Angka = mongoose.model('angka', angkaSchema)

mongoose.connect('localhost:27017/testing-connecting-counter')

let CounterType = new GraphQLObjectType({
  name: 'counter',
  fields: ()=>({
    counter: {
      type: GraphQLInt,
      description: 'current counter'
    }
  })
})

let getCounter = ()=>{
  return new Promise((resolve, reject)=>{
    Angka.find((err,counter)=>{
      if(err){
        reject(err)
      } else {
        resolve(counter)
      }
    })
  })
}

let QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: ()=> ({
    counter: {
      type: new GraphQLList(CounterType),
      resolve: ()=> {
        return getCounter()
      }
    }
  })
})

let MutationInitiate = {
  type: CounterType,
  description: "initiate angka",
  resolve(root){
    let randomNumber = Math.ceil(Math.random()*100)
    let newCounter = new Angka({counter: randomNumber})
    return new Promise((resolve, reject)=>{
      newCounter.save((err,result)=>{
        if(err){
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }
}

let MutationCounter = {
  type: CounterType,
  description: 'counter angka',
  resolve(root){
    return new Promise((resolve,reject)=>{
      Angka.findOne({}, (err,result)=>{
        result.counter = result.counter + 1
        result.save(function(err){
          if(err){
            reject(err)
          } else {
            resolve(result)
          }
        })
      })
    })
  }
}

let MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields:{
    initiate: MutationInitiate,
    counter: MutationCounter
  }
})

let schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
})

export default schema
