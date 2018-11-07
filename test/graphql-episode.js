process.env.NODE_ENV = 'test'

const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')
const server = require('../server')

chai.use(chaiHttp)

const test = async query => {
  const res = await chai.request(server)
    .post('/graphql')
    .set('content-type', 'application/json')
    .send({ query })

  return res.body.data
}

const epFragment = query => (
  `
  ${query}
    fragment allProperties on Episode {
      id
      name
      air_date
      episode
      characters {id}
      created
    }
  `
)

const keys = ['id', 'name', 'air_date', 'episode', 'characters', 'created']

const result = {
  episode: 'Pilot',
  character: 'Rick Sanchez'
}

describe('Graphql: Episode type (Query episode(id))', async () => {
  it('Gets an episode by ID', async () => {
    const query = '{ episode(id: 1) { name } }'
    const { episode } = await test(query)

    expect(episode).to.be.an('array')
    expect(episode[0].name).to.equal(result.episode)
  })

  it('Gets two episodes by ID', async () => {
    const query = '{ episode(id: [1, 2]) { name } }'
    const { episode } = await test(query)

    expect(episode[0].name).to.equal(result.episode)
    expect(episode[1].name).to.equal('Lawnmower Dog')
  })

  it('Gets a Charcter type', async () => {
    const query = '{ episode(id: 1) { characters { name } } }'
    const { episode } = await test(query)

    expect(episode[0].characters).to.be.an('array')
    expect(episode[0].characters[0].name).to.equal(result.character)
  })

  it('Gets all properties', async () => {
    const query = epFragment(`{ episode(id: 1) { ...allProperties } }`)
    const { episode } = await test(query)

    expect(Object.keys(episode[0])).to.deep.equal(keys)
  })
})

describe('Graphql: Episode type (Query allEpisodes)', async () => {
  it('Gets multiple episodes', async () => {
    const query = `{ allEpisodes { results { name } } }`
    const { allEpisodes: { results } } = await test(query)

    expect(results).to.be.an('array')
    expect(results[0].name).to.equal(result.episode)
  })

  it('Gets a Character type', async () => {
    const query = `{ allEpisodes { results { characters { name } } } }`
    const { allEpisodes: { results } } = await test(query)

    expect(results[0].characters).to.be.an('array')
    expect(results[0].characters[0].name).to.equal(result.character)
  })

  it('Gets all properties', async () => {
    const query = epFragment(`{ allEpisodes { results { ...allProperties } } }`)
    const { allEpisodes: { results } } = await test(query)

    expect(Object.keys(results[0])).to.deep.equal(keys)
  })
})

describe('Graphql: Episode type (Query allEpisodes(filter))', async () => {
  it('Filters a episode by name', async () => {
    const query = `{ allEpisodes(filter: { name: "Pilot" }) { results { name } } }`
    const { allEpisodes: { results } } = await test(query)

    expect(results).to.deep.include({ name: result.episode })
  })

  it('Filters an episode by episode code', async () => {
    const query = `{ allEpisodes(filter: { episode: "s01e01" }) { results { episode } } }`
    const { allEpisodes: { results } } = await test(query)

    expect(results).to.deep.include({ episode: 'S01E01' })
  })

  it('Filters a character by using more than one filter', async () => {
    const query = `{ allEpisodes(filter: { name: "pilot" episode: "s01e01" }) { results { name episode } } }`
    const { allEpisodes: { results } } = await test(query)

    expect(results).to.deep.include({ name: result.episode, episode: 'S01E01' })
  })
})