const MAP_STATE = /mapState\((([^)]|\n)*)\)/g
const MAP_GETTERS = /mapGetters\((([^)]|\n)*)\)/g
const MAP_ACTIONS = /mapActions\((([^)]|\n)*)\)/g
const MAP_MUTATIONS = /mapMutations\((([^)]|\n)*)\)/g
const $STORE_STATE = /\$store[\n\s]*\.[\n\s]*state([\n\s]*\.[\n\s]*(\w*))+/g
const $STORE_GETTERS = /\$store[\n\s]*\.[\n\s]*getters([\n\s]*\.[\n\s]*(\w*))+/g
const $STORE_COMMIT = /\$store[\n\s]*\.[\n\s]*commit\([\n\s]*['"]([\w\/]*)['"]([g^)]|\n|\s)*\)/g
const $STORE_DISPATCH = /\$store[\n\s]*\.[\n\s]*dispatch\([\n\s]*['"]([\w\/]*)['"]([^)]|\n|\s)*\)/g

const {mapActions, mapGetters, mapMutations, mapState} = require('./helpers')

const parse = (expression) => {
  return eval(`[${expression}]`)
}

const splitModuleProperty = (matches, separator) => {
  return matches.map((text) => {
    const [module, value] = text.split(separator, 2)
    return [module, [value]]
  })
}

const combine = (list) => {
  const res = {}
  list.forEach((element) =>
    element[1].forEach((value) => (res[element[0]] || (res[element[0]] = new Set())).add(value))
  )
  return res
}

const match = (text, regex) => {
  let match
  let matches = []
  while ((match = regex.exec(text))) {
    const element = match[1]
    matches.push(element)
  }
  return matches
}

const getState = (text) => {
  const list1 = splitModuleProperty(match(text, $STORE_STATE), '.')
  const list2 = match(text, MAP_STATE).map((exp) => mapState(...parse(exp)))
  return combine([...list1, ...list2])
}

const getGetters = (text) => {
  const list1 = splitModuleProperty(match(text, $STORE_GETTERS), '.')
  const list2 = match(text, MAP_GETTERS).map((exp) => mapGetters(...parse(exp)))
  return combine([...list1, ...list2])
}

const getActions = (text) => {
  const list1 = splitModuleProperty(match(text, $STORE_DISPATCH), '/')
  const list2 = match(text, MAP_ACTIONS).map((exp) => mapActions(...parse(exp)))
  return combine([...list1, ...list2])
}

const getMutations = (text) => {
  const list1 = splitModuleProperty(match(text, $STORE_COMMIT), '/')
  const list2 = match(text, MAP_MUTATIONS).map((exp) => mapMutations(...parse(exp)))
  return combine([...list1, ...list2])
}

module.exports = (text) => {
  const create = () => ({states: [], getters: [], actions: [], mutations: []})

  const state = getState(text)
  const getters = getGetters(text)
  const actions = getActions(text)
  const mutations = getMutations(text)

  const modules = {}

  Object.entries(state).forEach(
    ([module, value]) =>
      ((modules[module] || (modules[module] = create())).states = Array.from(value))
  )
  Object.entries(getters).forEach(
    ([module, value]) =>
      ((modules[module] || (modules[module] = create())).getters = Array.from(value))
  )
  Object.entries(actions).forEach(
    ([module, value]) =>
      ((modules[module] || (modules[module] = create())).actions = Array.from(value))
  )
  Object.entries(mutations).forEach(
    ([module, value]) =>
      ((modules[module] || (modules[module] = create())).mutations = Array.from(value))
  )

  console.dir(modules)

  return Object.entries(modules).map(([m, data]) => ({name: m, ...data}))
}
