import { GraphQLClient } from 'graphql-request'
import dotenv from 'dotenv'
import neo4j from '../../bootstrap/neo4j'

export const seedServerHost = 'http://127.0.0.1:4001'

dotenv.config()

const driver = neo4j().getDriver()

const builders = {
  'badge': require('./badges.js').default,
  'user': require('./users.js').default,
  'organization': require('./organizations.js').default,
  'post': require('./posts.js').default,
  'comment': require('./comments.js').default,
  'category': require('./categories.js').default,
  'tag': require('./tags.js').default,
  'report': require('./reports.js').default
}

const relationBuilders = {
  'user': require('./users.js').relate,
  'organization': require('./organizations.js').relate,
  'post': require('./posts.js').relate,
  'comment': require('./comments.js').relate
}

const buildMutation = (model, parameters) => {
  return builders[model](parameters)
}

const buildRelationMutation = (model, type, parameters) => {
  return relationBuilders[model](type, parameters)
}

const create = (model, parameters, options) => {
  const graphQLClient = new GraphQLClient(seedServerHost, options)
  const mutation = buildMutation(model, parameters)
  return graphQLClient.request(mutation)
}

const relate = (model, type, parameters, options) => {
  const graphQLClient = new GraphQLClient(seedServerHost, options)
  const mutation = buildRelationMutation(model, type, parameters)
  return graphQLClient.request(mutation)
}

const cleanDatabase = async () => {
  const session = driver.session()
  const cypher = 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r'
  try {
    return await session.run(cypher)
  } catch (error) {
    console.log(error)
  } finally {
    session.close()
  }
}

export {
  driver,
  buildMutation,
  buildRelationMutation,
  create,
  relate,
  cleanDatabase
}
