# Change Log
All notable changes to the "Spectrogram" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Future Works]
- [Display duration in explorer](https://code.visualstudio.com/api/extension-guides/tree-view#view-actions)
- Generate spectrogram faster than real time, depend on Web Audio API?
- Minimize package size --> [blocked that cause by Pug](https://github.com/pugjs/pug/issues/2889#issuecomment-456477196) due to its Uglify.js dependency.
- More colors
- Playback time slider
- Real-time input mode/recorder
- Support more audio formats (Depend on vscode)
- Switch back [suspend/resume](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext) instead using start/stop --> blocked that cause by Chrome? since Firefox works fine
---

## [1.1.0] - December 2019
- Remove Semantic
- Update CSS
- Display duration
- Minor bugfixes
- Switch method suspend/resume --> start/stop
- 3524 files, 4.33MB

Note:
- Still, this extension only works in exploration build, tested on 1.41 E7|C78 😥
- Not so sure why it doesn't work in stable/insider build on E6|C76 according to 1.0.1 note 🤔

Reference:
- https://stackoverflow.com/a/37770048/7526434
- https://stackoverflow.com/a/18562855/7526434
---

## [1.0.1] - September 2019
- Fixed path issue for other OS platforms
- Set VS Code version requirement to 1.40 - Wait for VS Code to update to newer Chrome version
- 6723 files, 10.2MB

Note:
- Pumped up the VS Code requirement to 1.40 due to Web Audio API bug, probably from Chrome
- Just right after the 1st release, the Web Audio API stops working on 1.30 to 1.39 of VS code (VS code 1.38 stable build is on Electron 4 | Chrome 69)
- The extension works (except the pause/resume function - API bug again) on VS code exploration build 1.37 with ELectron 6 | Chrome 76
- This extension will not be working for a while 😥
---

## [1.0.0] - May 2019
- Initial release
- 6725 files, 10.2MB

Reference:
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- https://github.com/mdn/webaudio-examples/blob/master/audiocontext-states/index.html
- https://wbrickner.wordpress.com/2016/09/27/awesome-js-html-spectrogram/
