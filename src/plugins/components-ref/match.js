const COMPONENTS_REGEXP = /components:[\s\n]*\{([\w\s\n:,]*)\}/g
const IMPORT_REGEXP = /import[\s\n]+\{?([\w\s\n,]*)\}?[\s\n]+from[\s\n]+['"]([^'"]+)['"]/g

const match = (text, regex) => {
  let match
  let matches = []
  while ((match = regex.exec(text))) {
    const element = match[1]
    matches.push(element)
  }
  return matches
}

const find = (text, regex) => {
  let match
  let matches = []
  while ((match = regex.exec(text))) {
    const list = match[1]
      .replace(/\n/g, '')
      .split(',')
      .map((name) => (name.includes(' as ') ? name.split(' as ')[1] : name))
      .map((name) => name.replace(/\s/g, ''))
      .filter((name) => name)
      .map((name) => ({name, path: match[2]}))
    matches.push(...list)
  }
  return matches
}

module.exports = (text) => {
  const refs = match(text, COMPONENTS_REGEXP)
    .map((comp) => comp.replace(/(\s|\n)/g, '').split(','))
    .reduce((res, item) => res.concat(item), [])
    .map((name) => (name.includes(':') ? name.split(':')[1] : name))
    .filter((name) => name)
  const set = new Set(refs)

  const finded = find(text, IMPORT_REGEXP)

  const components = finded.filter((comp) => set.has(comp.name))

  console.log(refs)
  console.log(finded)
  console.log(components)

  return components
}
