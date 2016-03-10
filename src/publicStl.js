'use strict'

let self = { }

self.await = function() {
  return {
    func: 'await',
    args: arguments
  }
}

self.equals = function() {
  return {
    func: 'equals',
    args: arguments
  }
}

self.let = function(varName, value) {
  return {
    func: 'let',
    varName: varName,
    value: value
  }
}

self.block = function() {
  return {
    func: 'block',
    args: arguments
  }
}

self.if = function(condition, then) {
  return {
    func: 'if',
    condition: condition,
    then: then
  }
}

self.return = function() {
  return {
    func: 'return',
    args: arguments
  }
}

self.log = function() {
  return {
    func: 'log',
    args: arguments
  }
}

self.arg = key => {
  return {
    func: 'arg',
    arg: key
  }
}

self.map = { }

self.map.set = function() {
  return {
    func: 'map.set',
    args: arguments
  }
}

module.exports = self
