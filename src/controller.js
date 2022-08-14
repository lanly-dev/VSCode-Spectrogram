'use strict'
;(() => {
  const vscode = acquireVsCodeApi()
  const canvasElement = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'))
  const canvasContext = canvasElement.getContext('2d')

  canvasElement.height = 512
  const susresBtn = /** @type {HTMLButtonElement} */ (document.getElementById('susresBtn'))
  const durationText = document.getElementById('duration')
  const fileLabel = document.getElementById('label')

  let currPlayer, id, durationId
  // Receive data from vscode
  window.addEventListener('message', event => {
    if (currPlayer) {
      currPlayer.close()
      durationText.innerHTML = ''
      cancelAnimationFrame(id)
      clearTimeout(durationId)
    }
    currPlayer = player(event.data)
  })

  /**
   * @param {{ path: string; name: string; }} file
   */
  function player(file) {
    const WIDTH = (canvasElement.width = window.innerWidth)
    susresBtn.textContent = 'Loading'
    susresBtn.classList.add('disabled')

    const audioCtx = new AudioContext()
    const analyser = audioCtx.createAnalyser()
    analyser.smoothingTimeConstant = 0.0
    analyser.fftSize = 1024

    const bufferLength = analyser.frequencyBinCount
    const eightBufferLength = 8 * bufferLength
    const dataArray = new Uint8Array(bufferLength)

    const imageDataFrame = canvasContext.createImageData(2, canvasElement.height)
    for (let i = 0; i < imageDataFrame.data.length * 4; i += 8) {
      for (let j = 3; j <= 7; j++) {
        imageDataFrame.data[i + j] = 255 // = 0,0,0,255 | 255,255,255,255
      }
    }

    const request = new XMLHttpRequest()
    request.open('GET', file.path)
    request.responseType = 'arraybuffer'
    request.onload = () => audioCtx.decodeAudioData(request.response, start, onBufferError)
    request.send()

    fileLabel.innerHTML = file.name
    const source = audioCtx.createBufferSource()

    // Test this
    source.onended = event => {
      clearTimeout(durationId)
      susresBtn.disabled = true
      susresBtn.textContent = 'Done'
      susresBtn.classList.add('disabled')
      cancelAnimationFrame(id)
      vscode.postMessage({ type: 'finished' })
    }

    susresBtn.onclick = () => {
      if (audioCtx.state === 'running') {
        audioCtx.suspend().then(() => {
          susresBtn.textContent = 'Resume'
          cancelAnimationFrame(id)
        })
      } else {
        //suspended
        audioCtx.resume().then(() => {
          susresBtn.textContent = 'Pause'
          draw()
          durationWatch()
        })
      }
    }

    function start(buffer) {
      // This prevents clicking too fast - closed before starting
      if (audioCtx.state === 'closed') return
      source.buffer = buffer
      source.connect(audioCtx.destination)
      source.connect(analyser)
      source.start()
      draw()
      durationWatch()

      susresBtn.textContent = 'Pause'
      susresBtn.disabled = false
      susresBtn.classList.remove('disabled')
    }

    function onBufferError(err) {
      vscode.postMessage({ type: 'error', message: `Error with decoding audio data -> ${err}` })
    }

    function durationWatch() {
      if (audioCtx.state === 'running') {
        const { contextTime } = audioCtx.getOutputTimestamp()
        const length = Math.trunc(source.buffer.duration)
        durationText.innerHTML = `- ${fmtMSS(Math.trunc(contextTime))} | ${fmtMSS(length)}`
        durationId = setTimeout(durationWatch, 1000)
      }
    }

    function fmtMSS(s) {
      return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s
    }

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
