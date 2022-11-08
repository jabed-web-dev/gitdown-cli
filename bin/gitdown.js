#!/usr/bin/env node
const gitdown = require('../src/index')

const args = process.argv.splice(2)
gitdown(args[0], process.cwd(), args[1])