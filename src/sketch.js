
const p5 = require('p5')

let sketch = function(p) {
  p.setup = function() {
    p.createCanvas(100, 100)
    p.background(255)
  }
}

new p5(sketch, 'sketch')
console.log('sketch here')
