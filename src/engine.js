'use strict'

let _ = require('monadjs')
let stl = {
  'console.log': console.log,
  equals: { inline: (a, b) => a === b }
}

let lookupFunction = name => {
  let fn = stl[name]

  if (fn === undefined) {
    failwithf('Function %s is not a valid function name.')(name)
  }

  return fn
}

let resolveBlock = token => {

}

let resolveFunction = token => {
  if (typecheck(Array)(token)) {
    let head = token[0]

    if (typecheck(String)(head) && head.startsWith('@')) {
      // This is a function call.
      let args = token.slice(1)
      let fn = lookupFunction(head.slice(1))
      let resArgs = _.map(Array)(resolveToken)(args)

      if (fn.inline) {
        fn = fn.inline
        // If any functions come back, this is not a constant expression.
        let isConstant = _.find(Array)(typecheck(Function))(resArgs).isNone()

        if (isConstant) {
          // Flat value.
          let res = fn.apply(null, resArgs)
          return res
          //return fn.inline.apply(null, resArgs)
        }
      }

      // Not a constant expression, must be evaluated on runtime.
      return context => {
        let evalArgs =
          _.map(Array)
          (f => typecheck(Function)(f) ? f(context) : f)
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
    if (typecheck(String)(token) && token.startsWith('@')) {
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
  if (typecheck(String)(token) && token.startsWith('$')) {
    // This value needs to be computed on runtime.
    let key = token.slice(1)

    return context => {
      // Lookup the token on the symbol table.
      let tables = context.tables
      let value = _.find(Array)(t => {
        return t[key] !== undefined
      })(tables)
      .map(t => t[key])

      console.log('looked up %s', key)
      if (value.isSome()) {
        return value.get()
      }
      failwithf('ReferenceError: %s is not defined')(key)
    }
  }

  // This is a constant
  return token
}

let resolveToken = token => {
  let fn = resolveFunction(token)
  if (fn !== undefined) return fn
  else return resolveValue(token)
}

let compile = source => {
  let ast = JSON.parse(source)
  let res = resolveToken(ast)

  if (typecheck(Function)(res)) {
    return context => {
      return res(context)
    }
  }
  return context => {
    return res
  }
}

//let rule = [ '@console.log', 'number = %s', '$x' ]
let rule = [ '@equals', 4, '5' ]
let fn = compile(JSON.stringify(rule))
console.log('compiled')
let res = fn({
  tables: [
    { x: 5 }
  ]
})

console.log('res')
console.log(res)
