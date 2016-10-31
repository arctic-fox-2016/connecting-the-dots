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
import _ from 'lodash'

let Counter = mongoose.model('Counter', {
  id: mongoose.Schema.Types.ObjectId,
  number: Number
})

mongoose.connect('mongodb://localhost:27017/test_connectingthedotsdb', function(err){
  if(err){
    console.log(err)
  } else {
    console.log('MongoDB Connected')
  }
})

let CounterType = new GraphQLObjectType({
  name: 'Counter',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'ID Counter'
    },
    number: {
      type: GraphQLInt,
      description: 'Number of counter'
    }
  })
})

let getAll = () => {
  return new Promise((resolve, reject) => {
    Counter.find((err, counters) => {
      if(err) reject(err)
      else resolve(counters)
    })
  })
}

let QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    counter: {
      type: new GraphQLList(CounterType),
      resolve: () => {
        return getAll()
      }
    }
  })
})

let MutationAdd = {
  type: CounterType,
  description: 'Add a number to counter',
  args: {
    number: {
      name: 'Number of counter',
      type: new GraphQLNonNull(GraphQLInt)
    }
  },
  resolve: (root, args) => {
    let newCounter = new Counter({
      number: _.random(100)
    })
    newCounter.id = newCounter._id
    return new Promise((resolve, reject) => {
      newCounter.save(function(err){
        if(err) reject(err)
        else resolve(newCounter)
      })
    })
  }
}

let MutationEdit = {
  type: CounterType,
  description: 'Edit a number from counter',
  args: {
    id: {
      name: 'ID from counter',
      type: new GraphQLNonNull(GraphQLString)
    },
    number: {
      name: 'Number for counter',
      type: new GraphQLNonNull(GraphQLInt)
    }
  },
  resolve: (root, args) => {
    return new Promise((resolve, reject) => {
      Counter.findById(args.id, (err, counter) => {
        if(err) reject(err)
        else if(!counter) reject('Record not found')
        else {
          counter.number = counter.number + 1
          counter.save(function(err){
            if(err) reject(err)
            else resolve(counter)
          })
        }
      })
    })
  }
}

let MutationDelete = {
  type: CounterType,
  description: 'Delete number from counter',
  args: {
    id: {
      name: 'ID from counter',
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: (root, args) => {
    return new Promise((resolve, reject) => {
      Counter.findById(args.id, (err, counter) => {
        if(err) reject(err)
        else if(!counter) reject('Record not found')
        else {
          counter.remove((err) => {
            if(err) reject(err)
            else resolve(counter)
          })
        }
      })
    })
  }
}

let MutationInitiate = {
  type: CounterType,
  description: "Initialize number",
  resolve(root){
    let newCounter = new Counter({number: _.random(100)})
    newCounter.id = newCounter._id
    return new Promise((resolve, reject)=>{
      newCounter.save((err, result)=>{
        if(err) reject(err)
        else resolve(result)
      })
    })
  }
}

let MutationCounter = {
  type: CounterType,
  description: 'Count number',
  resolve(root){
    return new Promise((resolve, reject)=>{
      Counter.findOne({}, (err, result)=>{
        result.number = result.number + 1
        result.save(function(err){
          if(err) reject(err)
          else resolve(result)
        })
      })
    })
  }
}

let MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    add: MutationAdd,
    edit: MutationEdit,
    delete: MutationDelete,
    initiate: MutationInitiate,
    counter: MutationCounter
  }
})

let schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
})

export default schema
