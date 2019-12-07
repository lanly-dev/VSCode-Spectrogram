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
    const durationText = document.getElementById('duration')
    const fileLabel = document.getElementById('label')

    let playing, id, durationId
    window.addEventListener('message', event => {
      if (playing) playing.close().then(cancelAnimationFrame(id), clearTimeout(durationId))
      playing = player(event.data)
    })

    function player(file) {
      let paused = false
      let source, startedAt, pausedAt, currentBuffer, begining
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
      request.open('GET', file.path, true)
      request.responseType = 'arraybuffer'
      request.onload = () => audioCtx.decodeAudioData(request.response, play, onBufferError)
      request.send()
      fileLabel.innerHTML = file.name

      susresBtn.onclick = () => paused ? play() : stop()

      function play(buffer) {
        source = audioCtx.createBufferSource()
        if (buffer) currentBuffer = buffer
        source.buffer = currentBuffer
        source.connect(audioCtx.destination)
        source.connect(analyser)

        susresBtn.textContent = 'Pause'
        paused = false
        if (pausedAt) {
          startedAt = Date.now() - pausedAt
          source.start(0, (pausedAt / 1000))
        } else {
          begining = Date.now()
          startedAt = Date.now()
          source.start(0)
        }
        durationWatch()
        draw()

        source.onended = event => {
          clearTimeout(durationId)
          const timePassed = (Date.now() - begining) / 1000
          if (timePassed >= source.buffer.duration) {
            cancelAnimationFrame(id)
            vscode.postMessage({ type: 'finished' })
          }
        }
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

      function durationWatch() {
        if (!paused) {
          const played = fmtMSS(((Date.now() - begining) / 1000).toFixed())
          const duration = fmtMSS(currentBuffer.duration.toFixed())
          durationText.innerHTML = `- ${played} | ${duration}`
          durationId = setTimeout(durationWatch, 1000)
        }
        function fmtMSS(s) { return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s }
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
