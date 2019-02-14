import { request } from 'http'

let canvasElement = document.getElementById('canvas')
let canvasContext = canvasElement.getContext('2d')
let WIDTH = canvasElement.width
let flag = true

// define online and offline audio context
let audioCtx = new AudioContext()

let analyser = audioCtx.createAnalyser()
analyser.smoothingTimeConstant = 0.0

analyser.fftSize = 1024
let bufferLength = analyser.frequencyBinCount
let eightBufferLength = 8 * bufferLength + 1
let dataArray = new Uint8Array(bufferLength)

// setup the imageDataFrame early
let imageDataFrame = canvasContext.createImageData(2, canvasElement.height)

for (var index = 0; index < imageDataFrame.data.length * 4; index += 8) {
  imageDataFrame.data[index] = imageDataFrame.data[index + 6] = 0
  imageDataFrame.data[index + 3] = imageDataFrame.data[
    index + 4
  ] = imageDataFrame.data[index + 5] = imageDataFrame.data[index + 7] = 255
}



// use XHR to load an audio track, and
// decodeAudioData to decode it and OfflineAudioContext to render it

function getData() {
  // var reader = new FileReader()
  // reader.onload = function(ev) {}

  let request = new XMLHttpRequest()
  let printLog = (a, b) => console.log(JSON.stringify(a), b)
  request.open('GET', rootPath, true)
  request.addEventListener('progress', printLog)
  request.addEventListener('load', printLog)
  request.addEventListener('error', printLog)
  request.addEventListener('abort', printLog)
  request.responseType = 'arraybuffer'

  request.onload = () => {
    var audioData = request.response

    audioCtx.decodeAudioData(audioData, buffer => {
      console.log(buffer.length)
      let myBuffer = buffer

      let offlineCtx = new OfflineAudioContext(2, buffer.length, 44100)
      let source = offlineCtx.createBufferSource()
      source.buffer = myBuffer
      source.connect(offlineCtx.destination)
      source.start()
      //source.loop = true;

      offlineCtx
        .startRendering()
        .then(renderedBuffer => {
          console.log('Rendering completed successfully')

          var song = audioCtx.createBufferSource()
          song.buffer = renderedBuffer
          console.log(JSON.stringify(renderedBuffer))

          song.connect(audioCtx.destination)
          song.connect(analyser)
          // // play.onclick = function() {
          song.playbackRate.value = 5
          song.start()
          // }
          song.onended = function(e) {
            flag = false
            console.log('finished')
          }

          analyser.getByteFrequencyData(dataArray)
          console.log(Array.apply([], dataArray).join(","));
          draw()
        })
        .catch(err => {
          console.log('Rendering failed: ' + err)
          // Note: The promise should reject when startRendering is called a second time on an OfflineAudioContext
        })
    })
  }
  request.send()
}

// Run getData to start the process off

getData()

let x= 0
function draw() {
  if(flag) requestAnimationFrame(draw)
  analyser.getByteFrequencyData(dataArray)


  //     for(var index = bufferLength, y = 0; index > 0; --index, y += 8)
  for (
    var index = 0, y = eightBufferLength;
    index < bufferLength;
    ++index, y -= 8
  ) {
    imageDataFrame.data[y] = imageDataFrame.data[y + 1] = dataArray[index]
    // increment by 8, as to not interfere with the playhead (second coloumn of pixels at x=1)
  }

  canvasContext.putImageData(imageDataFrame, x, 0)

  if (x < WIDTH) {
    x++
  } else {
    x = 0
  }
}
