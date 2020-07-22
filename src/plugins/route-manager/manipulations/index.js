module.exports = (context) => {
  return {
    create: (...args) => require('./create').call(null, context, ...args),
  }
}
