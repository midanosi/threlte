#!/usr/bin/env node
'use strict'
import meow from 'meow'
import { dirname } from 'path'
import { readPackageUpSync } from 'read-pkg-up'
import { fileURLToPath } from 'url'
import gltf from './src/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const cli = meow(
  `
  Usage
    $ npx @threlte/gltf [Model.glb] [options]

  Options
    --output, -o        Output file name/path
    --types, -t         Add Typescript definitions
    --keepnames, -k     Keep original names
    --keepgroups, -K    Keep (empty) groups, disable pruning
    --meta, -m          Include metadata (as userData)
    --shadows, -s       Let meshes cast and receive shadows
    --printwidth, -w    Prettier printWidth (default: 120)
    --precision, -p     Number of fractional digits (default: 2)
    --draco, -d         Draco binary path
    --preload -P        Add preload method to module script
    --isolated, -i      Output as isolated module (No $$restProps usage)
    --root, -r          Sets directory from which .gltf file is served
    --transform, -T     Transform the asset for the web (draco, prune, resize)
      --resolution, -R  Transform resolution for texture resizing (default: 1024)
      --simplify, -S    Transform simplification (default: false) (experimental!)
        --weld          Weld tolerance (default: 0.0001)
        --ratio         Simplifier ratio (default: 0.75)
        --error         Simplifier error threshold (default: 0.001)
    --debug, -D         Debug output
`,
  {
    importMeta: import.meta,
    flags: {
      output: { type: 'string', alias: 'o' },
      types: { type: 'boolean', alias: 't' },
      keepnames: { type: 'boolean', alias: 'k' },
      keepgroups: { type: 'boolean', alias: 'K' },
      shadows: { type: 'boolean', alias: 's' },
      printwidth: { type: 'number', alias: 'p', default: 120 },
      meta: { type: 'boolean', alias: 'm' },
      precision: { type: 'number', alias: 'p', default: 2 },
      isolated: { type: 'boolean', alias: 'i', default: false },
      preload: { type: 'boolean', alias: 'P', default: false },
      draco: { type: 'string', alias: 'd' },
      root: { type: 'string', alias: 'r' },
      transform: { type: 'boolean', alias: 'T' },
      resolution: { type: 'number', alias: 'R', default: 1024 },
      simplify: { type: 'boolean', alias: 'S', default: false },
      weld: { type: 'number', default: 0.0001 },
      ratio: { type: 'number', default: 0.75 },
      error: { type: 'number', default: 0.001 },
      debug: { type: 'boolean', alias: 'D' }
    }
  }
)

const { packageJson } = readPackageUpSync({ cwd: __dirname, normalize: false })

function toPascalCase(str) {
  return (
    str
      .replace(/(\w)(\w*)/g, function (g0, g1, g2) {
        // capitalize first letter of g1, leave the reset as-is and return the result
        return g1.toUpperCase() + g2
      })
      // replace every non-word character with an empty string and capitalize the first following letter
      .replace(/\W+(.)/g, function (g0, g1) {
        return g1.toUpperCase()
      })
      // replace every non-word character with an empty string
      .replace(/\s+/g, '')
      // make first letter uppercase
      .replace(/^\w/, function (g0) {
        return g0.toUpperCase()
      })
  )
}

if (cli.input.length === 0) {
  console.log(cli.help)
} else {
  const config = {
    ...cli.flags,
    header: `Auto-generated by: https://github.com/threlte/threlte/tree/main/packages/gltf
Command: npx @threlte/gltf@${packageJson.version} ${process.argv.slice(2).join(' ')}`
  }
  const file = cli.input[0]
  let nameExt = file.match(/[-_\w]+[.][\w]+$/i)[0]
  let name = nameExt.split('.').slice(0, -1).join('.')
  const baseName = toPascalCase(name)
  const output = baseName + '.svelte'
  const showLog = (log) => {
    console.info('log:', log)
  }
  try {
    await gltf(file, output, baseName, {
      ...config,
      showLog,
      timeout: 0,
      delay: 1
    })
  } catch (e) {
    console.error(e)
  }
}
