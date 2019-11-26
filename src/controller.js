'use strict'
;(() => {
  const vscode = acquireVsCodeApi()

  const canvasElement = document.getElementById('canvas')
  const canvasContext = canvasElement.getContext('2d')
  const WIDTH = (canvasElement.width = window.innerWidth)
  const HEIGHT = (canvasElement.height = 512)
  const susresBtn = document.querySelector('#susresbtn')

  let playing, id
  window.addEventListener('message', event => {
    if (playing) playing.close().then(cancelAnimationFrame(id))
    playing = player(event.data)
  })
  vscode.postMessage({ type: 'ready' })

  function player(path) {
    const audioCtx = new AudioContext()
    const analyser = audioCtx.createAnalyser()
    analyser.smoothingTimeConstant = 0.0
    analyser.fftSize = 1024

    let bufferLength = analyser.frequencyBinCount
    let eightBufferLength = 8 * bufferLength
    let dataArray = new Uint8Array(bufferLength)

    let imageDataFrame = canvasContext.createImageData(2, canvasElement.height)
    for (let i = 0; i < imageDataFrame.data.length * 4; i += 8) {
      for (let j = 3; j <= 7; j++) {
        imageDataFrame.data[i + j] = 255 // = 0,0,0,255|255,255,255,255
      }
    }

    const request = new XMLHttpRequest()
    request.open('GET', path, true)
    request.responseType = 'arraybuffer'

    request.onload = () => {
      audioCtx.decodeAudioData(request.response).then(
        buffer => {
          const offlineCtx = new OfflineAudioContext(2, buffer.length, 44100)
          const source = offlineCtx.createBufferSource()
          source.buffer = buffer

          source.connect(offlineCtx.destination)
          source.start()

          offlineCtx
            .startRendering()
            .then(renderedBuffer => {
              const song = audioCtx.createBufferSource()
              song.buffer = renderedBuffer

              song.connect(audioCtx.destination)
              song.connect(analyser)
              susresBtn.onclick = () => {
                if (audioCtx.state === 'running') {
                  audioCtx.suspend().then(() => {
                    susresBtn.textContent = 'Resume'
                    cancelAnimationFrame(id)
                  })
                } else if (audioCtx.state === 'suspended') {
                  audioCtx.resume().then(() => {
                    susresBtn.textContent = 'Pause'
                    draw()
                  })
                }
              }
              song.start()
              song.onended = event => {
                cancelAnimationFrame(id)
                vscode.postMessage({ type: 'finished' })
              }
              analyser.getByteFrequencyData(dataArray)
              draw()
            })
            .catch(err => vscode.postMessage({ type: 'error', message: `Rendering failed -> ${err}` }))
        },
        err => vscode.postMessage({ type: 'error', message: `Error with decoding audio data -> ${err}` })
      )
    }
    request.send()

    let x = 0
    function draw() {
      id = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)
      for (let i = 0, y = eightBufferLength; i < bufferLength; i++, y -= 8) {
        imageDataFrame.data[y] = dataArray[i]
      }
      canvasContext.putImageData(imageDataFrame, x, 0)
      x < WIDTH ? x++ : (x = 0)
    }
    return audioCtx
  }
})()
