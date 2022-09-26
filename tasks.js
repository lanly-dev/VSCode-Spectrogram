const shell = require('shelljs')

console.log(`Run task ${process.argv[2]}`)
if (process.argv[2] === 'clean') {
  console.log('Remove "dist" directory')
  shell.rm('-rf', 'dist')
} else console.log(`ಠ_ಠ What task is this? task ${process.argv[2]}`)
