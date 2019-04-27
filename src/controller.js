;(() => {
  const vscode = acquireVsCodeApi()
  const oldState = vscode.getState()

  const canvasElement = document.getElementById('canvas')
  const canvasContext = canvasElement.getContext('2d')
  const WIDTH = (canvasElement.width = window.innerWidth)
  const HEIGHT = (canvasElement.height = 512)
  // let currentCount = (oldState && oldState.count) || 0;

  // setInterval(() => {
  //     counter.textContent = currentCount++;

  //     // Update state
  //     vscode.setState({ count: currentCount });

  //     // Alert the extension when the cat introduces a bug
  //     if (Math.random() < Math.min(0.001 * currentCount, 0.05)) {
  //         // Send a message back to the extension
  //         vscode.postMessage({
  //             command: 'alert',
  //             text: '🐛  on line ' + currentCount
  //         });
  //     }
  // }, 100);

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', event => {
    const message = event.data // The json data that the extension sent
    switch (message.command) {
      case 'refactor':
        currentCount = Math.ceil(currentCount * 0.5)
        counter.textContent = currentCount
        break
    }
  })

  let audioCtx = new AudioContext()
  let analyser = audioCtx.createAnalyser()
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

  function getData() {
    let request = new XMLHttpRequest()
    request.open('GET', rootPath, true)
    request.responseType = 'arraybuffer'

    request.onload = () => {
      var audioData = request.response

      audioCtx.decodeAudioData(audioData, buffer => {
        let offlineCtx = new OfflineAudioContext(2, buffer.length, 44100)
        let source = offlineCtx.createBufferSource()
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
            // // play.onclick = function() {
            // song.playbackRate.value = 2
            song.start()
            // }
            song.onended = function(e) {
              console.log('finished')
            }
            analyser.getByteFrequencyData(dataArray)
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

  getData()

  let x = 0
  function draw() {
    requestAnimationFrame(draw)
    analyser.getByteFrequencyData(dataArray)
    for (let i = 0, y = eightBufferLength; i < bufferLength; i++, y -= 8) {
      imageDataFrame.data[y] = dataArray[i]
    }
    canvasContext.putImageData(imageDataFrame, x, 0)
    x < WIDTH ? x++ : (x = 0)
  }
})()
