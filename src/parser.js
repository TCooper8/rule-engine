'use strict'

let _ = require('lodash')

let CharStream = input => {
  let self = { }
  let index = -1
  let max = input.length

  self.next = () => {
    return input[++index]
  }

  self.seek = i => {
    index += i
  }

  self.takeWhile = predicate => {
    let acc = [],
        c = undefined
    while (++index < max) {
      c = input[index]
      if (predicate(c)) {
        acc.push(c)
      }
    }

    return acc.join('')
  }

  self.takeN = n => {
    let acc = input.slice(index, index + n)
    index += n
    return acc
  }
}

let isAlphanumeric = c => {
  return c.match(/^[a-z0-9]+$/) !== null
}

let isNumber = c => {
  return c.match(/^[a-zA-Z]+$/) !== null
}

let isWhitespace = c => {
  return c.trim() == ''
}

let takeWhitespace = stream => {
  stream.takeWhile( isWhitespace )
}

let takeLet = stream => {
  let identifer = stream.takeN(4)
  if (identifer !== 'let ') {
    stream.seek(-4)
    return
  }

  // Identifier is good, get the required parts.
  let varName = stream.takeWhile(c => !isWhitespace(c))
  takeWhitespace(stream)

  if (varName.length === 0) {
    throw new Error('Expected alphanumeric variable name for assignment')
  }

  let operator = stream.takeN(1)
  if (operator !== '=') {
    throw new Error('Expected assignment operator after let declaration variable')
  }

  takeWhitespace(stream)
  let value = stream.takeWhile(c => !isWhitespace(c))
}

module.exports = input => {
  let stream = CharStream(input)
}
