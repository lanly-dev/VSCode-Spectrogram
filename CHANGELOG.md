# Change Log
All notable changes to the "Spectrogram" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Future Works]
- Real-time input mode/recorder
- Generate spectrogram instead of real-time - [this](https://github.com/cwilso/wubwubwub/blob/MixTrack/js/visualizer.js) or [Wavesurfer](https://wavesurfer.xyz/)

---
## [3.0.0] - February 2025
- Support WAV
- Add seekbar
- Add color RGB config
- Add duration in treeview
- New icon and logo<br>
  <img src='https://github.com/lanly-dev/VSCode-Spectrogram/blob/main/media/vscodeignore/spec.png?raw=true' width='50' title='spec'/>
  <img src='https://github.com/lanly-dev/VSCode-Spectrogram/blob/main/media/spec.png?raw=true' width='55' title='spec3.0'/>

### Notes
- Clicking treeview item sometimes triggers playing the song, but due to the [autoplay policy](https://developer.chrome.com/blog/autoplay), most of the time you have to click the play button inside the webview

### References
- Treeview API https://code.visualstudio.com/api/extension-guides/tree-view#view-actions
- VS Code support codecs https://code.visualstudio.com/updates/v1_71#_ffmpeg-codecs-support

## [2.0.0] - September 2022
- Add seeking 5s back and forth buttons
- Reduce extension size with Webpack
- Support FLAC
- Switch to `main` branch
- Use [Codicons](https://microsoft.github.io/vscode-codicons/dist/codicon.html)
- Use resume/suspend methods
- webpack 5.74.0 compiled with 1 warning in 9069 ms
- 12 files, 278.85KB, 1.71.0

Known issues:
- Webpack watch doesn't work as expected - it does rebuild but not on each change-save
- VS Code's debugging needs to click twice - run and restart in order to launch the app (maybe only for macOS)

Notes:
- **Finally! This extension works on VS Code stable version** 🙌🎊🎉🥳🥂
- It turns out that VS Code doesn't ship MP3 codec with its FFmpeg library (it probably got removed in the past since this extension worked before) and recently added it back in v1.71 - [Issue](https://github.com/microsoft/vscode/issues/48494)
- Put back resume/suspend since the issue got fixed for Electron/Chromium - [Issue1052747](https://bugs.chromium.org/p/chromium/issues/detail?id=1052747) | [Issue1018499](https://bugs.chromium.org/p/chromium/issues/detail?id=1018499)
- Reduce extension size - it was funny to see the previous version use Webpack to minimize the 1 file - `controller.js`
- All previous versions of this extension will not work in any recent VS Code versions

## [1.1.0] - December 2019
- Display duration
- Minor bug fixes
- Remove [Semantic](https://semantic-ui.com)
- Switch method suspend/resume -> start/stop
- Update CSS
- 3524 files, 4.33MB, 1.41.0

Notes:
- Still, this extension only works for exploration build, tested on 1.41 E7|C78 😥 - [vscode1.37 - exploration](https://github.com/microsoft/vscode/issues/76069)
- Not sure why it doesn't work for stable/insider build on E6|C76 according to 1.0.1 note 🤔

References:
- https://stackoverflow.com/a/37770048/7526434
- https://stackoverflow.com/a/18562855/7526434
---

## [1.0.1] - September 2019
- Fixed path issue for other OS platforms - tested on macOS and Ubuntu
- Set VS Code version requirement to 1.40 - Wait for VS Code to update to newer Chrome version
- 6723 files, 10.2MB, 1.38.0

Notes:
- Pumped up the VS Code requirement to 1.40 due to Web Audio API bug, probably from Chrome
- Just right after the 1st release, the Web Audio API stops working on 1.30 to 1.39 of VS Code (VS Code 1.38 stable build is on Electron 4 | Chrome 69)
- The extension works (except the pause/resume function - API bug again) on VS Code exploration build 1.37 with Electron 6 | Chrome 76
- This extension will not be working for a while 😥
---

## [1.0.0] - May 2019
- Initial release
- 6725 files, 10.2MB, 1.30.0

References:
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- https://github.com/mdn/webaudio-examples/blob/master/audiocontext-states/index.html
- https://wbrickner.wordpress.com/2016/09/27/awesome-js-html-spectrogram/
