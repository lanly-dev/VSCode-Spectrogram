'use strict'
  ; (() => {
    // @ts-ignore
    const vscode = acquireVsCodeApi()
    const canvasElement = document.getElementById('canvas')
    // @ts-ignore
    const canvasContext = canvasElement.getContext('2d')
    // @ts-ignore
    const WIDTH = canvasElement.width = window.innerWidth
    // @ts-ignore
    canvasElement.height = 512
    const susresBtn = document.getElementById('susresbtn')

    let playing, id
    window.addEventListener('message', event => {
      if (playing) playing.close().then(cancelAnimationFrame(id))
      playing = player(event.data)
    })

    function player(path) {
      let paused = false
      let source, startedAt, pausedAt, currentBuffer
      const audioCtx = new AudioContext()
      const analyser = audioCtx.createAnalyser()
      analyser.smoothingTimeConstant = 0.0
      analyser.fftSize = 1024

      const bufferLength = analyser.frequencyBinCount
      const eightBufferLength = 8 * bufferLength
      const dataArray = new Uint8Array(bufferLength)
      // @ts-ignore
      const imageDataFrame = canvasContext.createImageData(2, canvasElement.height)
      for (let i = 0; i < imageDataFrame.data.length * 4; i += 8) {
        for (let j = 3; j <= 7; j++) {
          imageDataFrame.data[i + j] = 255 // = 0,0,0,255|255,255,255,255
        }
      }

      const request = new XMLHttpRequest()
      request.open('GET', path, true)
      request.responseType = 'arraybuffer'
      request.onload = () => audioCtx.decodeAudioData(request.response, play, onBufferError)
      request.send()

      susresBtn.onclick = () => paused ? play() : stop()

      function play(buffer) {
        source = audioCtx.createBufferSource()
        if (buffer) currentBuffer = buffer
        source.buffer = currentBuffer
        source.connect(audioCtx.destination)
        source.connect(analyser)
        // console.log(source.buffer)

        susresBtn.textContent = 'Pause'
        paused = false
        draw()
        if (pausedAt) {
          startedAt = Date.now() - pausedAt
          source.start(0, (pausedAt / 1000))
        } else {
          startedAt = Date.now()
          source.start(0)
        }

        // source.onended = event => {
        //   cancelAnimationFrame(id)
        //   vscode.postMessage({ type: 'finished' })
        // }
      }

      function stop() {
        pausedAt = Date.now() - startedAt
        paused = true
        susresBtn.textContent = 'Resume'
        cancelAnimationFrame(id)
        source.stop()
      }

      function onBufferError(err) {
        vscode.postMessage({ type: 'error', message: `Error with decoding audio data -> ${err}` })
      }

      let x = 0
      function draw() {
        id = requestAnimationFrame(draw)
        analyser.getByteFrequencyData(dataArray)
        for (let i = 0, y = eightBufferLength; i < bufferLength; i++ , y -= 8) {
          imageDataFrame.data[y] = dataArray[i]
        }
        canvasContext.putImageData(imageDataFrame, x, 0)
        x < WIDTH ? x++ : x = 0
      }

      return audioCtx
    }
  })()
