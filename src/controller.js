'use strict'

const PLAY_ICON = '<i class="codicon codicon-play"></i>'
const PAUSE_ICON = '<i class="codicon codicon-debug-pause"></i>'
const REFRESH_ICON = '<i class="codicon codicon-refresh"></i>'

;(() => {
  // eslint-disable-next-line no-undef
  const vscode = acquireVsCodeApi()
  const canvasElement = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'))
  const canvasContext = canvasElement.getContext('2d')

  canvasElement.height = 512
  const susresBtn = /** @type {HTMLButtonElement} */ (document.getElementById('susresBtn'))
  const backBtn = /** @type {HTMLButtonElement} */ (document.getElementById('backBtn'))
  const forwardBtn = /** @type {HTMLButtonElement} */ (document.getElementById('forwardBtn'))
  const durationText = document.getElementById('duration')
  const fileLabel = document.getElementById('label')
  const seekbar = /** @type {HTMLInputElement} */ (document.getElementById('seekbar'))

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
    canvasElement.width = window.innerWidth - 10
    const WIDTH = canvasElement.width
    togglePlaybackButtons('LOADING')
    const audioCtx = new AudioContext()
    const analyser = audioCtx.createAnalyser()
    analyser.smoothingTimeConstant = 0.0
    analyser.fftSize = 1024

    const bufferLength = analyser.frequencyBinCount
    const eightBufferLength = 8 * bufferLength
    const dataArray = new Uint8Array(bufferLength)

    const imageDataFrame = canvasContext.createImageData(2, canvasElement.height)
    // Initialize the imageDataFrame with alternating black and white pixels
    for (let i = 0; i < imageDataFrame.data.length; i += 8) {
      // Set the first pixel to black (0, 0, 0, 255)
      imageDataFrame.data[i] = 0
      imageDataFrame.data[i + 1] = 0
      imageDataFrame.data[i + 2] = 0
      imageDataFrame.data[i + 3] = 255

      // Set the second pixel to white (255, 255, 255, 255)
      imageDataFrame.data[i + 4] = 255
      imageDataFrame.data[i + 5] = 255
      imageDataFrame.data[i + 6] = 255
      imageDataFrame.data[i + 7] = 255
    }

    const request = new XMLHttpRequest()
    request.open('GET', file.path)
    request.responseType = 'arraybuffer'
    request.onload = () => audioCtx.decodeAudioData(request.response, audioCtxSetup, onBufferError)
    request.send()

    fileLabel.innerHTML = file.name
    let source = audioCtx.createBufferSource()
    let buffer, startAt, length, lengthMs, played = 0, isEnded = false

    susresBtn.onclick = () => {
      if (audioCtx.state === 'running' && !isEnded) {
        audioCtx.suspend().then(() => {
          susresBtn.innerHTML = PLAY_ICON
          cancelAnimationFrame(id)
          played += Date.now() - startAt
        })
      } else if (isEnded) {
        isEnded = false
        // Similar to start() + seek()
        source.onended = null
        source.disconnect(audioCtx.destination)
        source.disconnect(analyser)

        source = audioCtx.createBufferSource()
        source.buffer = buffer
        source.connect(audioCtx.destination)
        source.connect(analyser)
        source.onended = playEnd
        source.start()

        draw()
        startAt = Date.now()
        played = 0
        durationWatch()
        togglePlaybackButtons('PLAYING')
      } else {
        // Was suspended so resume it
        audioCtx.resume().then(() => {
          susresBtn.innerHTML = PAUSE_ICON
          startAt = Date.now()
          draw()
          durationWatch()
        })
      }
    }

    backBtn.onclick = () => seek(-5000)
    forwardBtn.onclick = () => seek(5000)
    seekbar.oninput = () => seekTo(seekbar.value)
    seekbar.onmousemove = (event) => showHoverDuration(event)

    function audioCtxSetup(theBuffer) {
      // This prevents clicking too fast - closed before starting
      if (audioCtx.state === 'closed') return
      if (audioCtx.state === 'suspended') {
        // https://goo.gl/7K7WLu
        vscode.postMessage({ type: 'INFO', message: 'Please click the play button' })
      }

      isEnded = false
      buffer = theBuffer
      source.buffer = theBuffer
      length = source.buffer.duration
      lengthMs = length * 1000
      source.connect(audioCtx.destination)
      source.connect(analyser)
      source.onended = playEnd
      source.start()

      startAt = Date.now()
      durationWatch()
      togglePlaybackButtons('READY')
      seekbar.max = lengthMs.toString()
    }

    function onBufferError(err) {
      vscode.postMessage({ type: 'error', message: `Error with decoding audio data -> ${err}` })
    }

    function seek(ms) {
      played += Date.now() - startAt
      if (played === 0 && ms < 0) return
      if (played === lengthMs && ms > 0) return

      // Memory leaks if seeking too many since source wasn't properly free (AudioContext.close())?
      source.onended = null
      source.disconnect(audioCtx.destination)
      source.disconnect(analyser)

      source = audioCtx.createBufferSource()
      source.buffer = buffer
      source.connect(audioCtx.destination)
      source.connect(analyser)
      source.onended = playEnd

      played += ms
      if (played < 0) played = 0
      if (played > lengthMs) played = lengthMs
      startAt = Date.now()
      source.start(0, played / 1000)

      if (audioCtx.state === 'suspended') updateDurationText()
    }

    function seekTo(ms) {
      played = parseInt(ms)
      if (played < 0) played = 0
      if (played > lengthMs) played = lengthMs

      source.onended = null
      source.disconnect(audioCtx.destination)
      source.disconnect(analyser)

      source = audioCtx.createBufferSource()
      source.buffer = buffer
      source.connect(audioCtx.destination)
      source.connect(analyser)
      source.onended = playEnd

      startAt = Date.now()
      source.start(0, played / 1000)

      if (audioCtx.state === 'suspended') updateDurationText()
    }

    function playEnd() {
      isEnded = true
      clearTimeout(durationId)
      togglePlaybackButtons('ENDED')
      cancelAnimationFrame(id)
      vscode.postMessage({ type: 'DONE', message: 'Playing ended' })
    }

    function togglePlaybackButtons(state) {
      switch (state) {
      case 'LOADING':
        susresBtn.textContent = 'Loading...'
        susresBtn.classList.add('disabled')
        susresBtn.disabled = true
        backBtn.style.display = 'none'
        forwardBtn.style.display = 'none'
        seekbar.style.display = 'none'
        break
      case 'READY':
      case 'PLAYING':
        susresBtn.innerHTML = state === 'PLAYING' ? PAUSE_ICON : PLAY_ICON
        susresBtn.classList.remove('disabled')
        susresBtn.disabled = false
        backBtn.style.display = 'inline-block'
        forwardBtn.style.display = 'inline-block'
        seekbar.style.display = 'block'
        break
      case 'ENDED':
        susresBtn.innerHTML = REFRESH_ICON
        durationText.innerHTML = null
        backBtn.style.display = 'none'
        forwardBtn.style.display = 'none'
        seekbar.style.display = 'none'
        break
      }
    }

    function durationWatch() {
      if (audioCtx.state === 'running') {
        updateDurationText()
        durationId = setTimeout(durationWatch, 1000)
      }
    }

    function updateDurationText() {
      const durationPlayed = Date.now() - startAt + played
      durationText.innerHTML = `- ${fmtMSS(Math.trunc(durationPlayed / 1000))} | ${fmtMSS(Math.trunc(length))}`
      seekbar.value = durationPlayed.toString()
    }

    function fmtMSS(s) {
      return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s
    }

    function showHoverDuration(event) {
      const hoverTime = (event.offsetX / seekbar.clientWidth) * lengthMs
      durationText.innerHTML = `- ${fmtMSS(Math.trunc(hoverTime / 1000))} | ${fmtMSS(Math.trunc(length))}`
    }

    let x = 0
    function draw() {
      id = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)
      for (let i = 0, y = eightBufferLength; i < bufferLength; i++, y -= 8) imageDataFrame.data[y] = dataArray[i]
      canvasContext.putImageData(imageDataFrame, x, 0)
      x < WIDTH ? x++ : (x = 0)
    }
    return audioCtx
  }
})()
