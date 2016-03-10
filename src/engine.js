'use strict'

let _ = require('monadjs')
let stl = {
  console: {
    log: console.log
  }
}

let lookupFunction = name => {
  let fn = _.getNested(stl, name)

  if (fn === undefined) {
    _.failwith(_.sprintf(
      'Function %s is not a valid function name.',
      name
    ))
  }

  return fn
}

let resolveFunction = token => {
  if (_.isArray(token)) {
    let head = token[0]

    if (_.isString(head) && head.startsWith('@')) {
      // This is a function call.
      let args = token.slice(1)
      let fn = lookupFunction(head.slice(1))
      let resArgs = _.map(Array)(resolveToken)(args)

      // If any functions come back, this is not a constant expression.
      let isConstant = _.find(Array)(_.isFunction)(resArgs).isSome()

      if (isConstant) {
        // Flat value.
        return fn.apply(null, resArgs)
      }

      // Not a constant expression, must be evaluated on runtime.
      return context => {
        let evalArgs =
          _.map(Array)
          (f => _.isFunction(f) ? f(context) : f)
          (resArgs)

        return fn.apply(null, evalArgs)
      }
    }
    else {
      // This looks like a constant array.
      return undefined
    }
  }
  else {
    if (_.isString(token) && token.startsWith('@')) {
      let fn = lookupFunction(token.slice(1))

      // No args, invoke it as a value.
      return fn()
    }
    else {
      // This is a constant value.
      return undefined
    }
  }
}

let resolveValue = token => {
  if (_.isString(token) && token.startsWith('$')) {
    // This value needs to be computed on runtime.
    let key = token.slice(1)

    return context => {
      // Lookup the token on the symbol table.
      let tables = context.tables
      let value = _.find(Array)(t => {
        return _.getNested(t, key)
      })(tables)

      return value
    }
  }

  // This is a constant
  return token
}

let resolveToken = token => {
  return undefined
    || resolveFunction(token)
    || resolveValue(token)
}

let compile = source => {
  let ast = JSON.parse(source)
  let res = resolveToken(ast)

  if (_.isFunction(res)) {
    return context => {
      return res(context)
    }
  }
  return context => {
    return res
  }
}

let rule = [ '@console.log', 'number = %s', '$x' ]
let fn = compile(JSON.stringify(rule))
let res = fn({
  tables: []
})

console.log(res)
