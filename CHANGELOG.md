# Change Log
All notable changes to the "Spectrogram" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Future Works]
- Generate spectrogram faster than real time
- Playing effect provided by Web Audio API
- Playback time slider
- More colors
- Support more audio formats
- [Display duration on treeview](https://code.visualstudio.com/api/extension-guides/tree-view#view-actions)
- Minimize package size --> [blocked that cause by Pugjs](https://github.com/pugjs/pug/issues/2889#issuecomment-456477196) due to its Uglify.js dependency.
- Switch back [suspend/resume](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext) instead using start/stop --> blocked that cause by Chrome? since Firefox works fine
- Realtime input mode

## [1.1.0] - December 2019
- Remove Semantic
- Update CSS
- Display duration
- Minor bugfixes
- Switch method suspend/resume --> start/stop []
- 3524 files, 4.33MB

## [1.0.1] - September 2019
- Fixed path issue for other OS platforms
- Set VS Code version requirement to 1.40 - Wait for VS Code to update to newer Chrome version 
- 6723 files, 10.2MB

## [1.0.0] - May 2019
- Initial release
- 6725 files, 10.2MB

### References
```
https://stackoverflow.com/a/37770048/7526434
https://stackoverflow.com/a/18562855/7526434
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
https://github.com/mdn/webaudio-examples/blob/master/audiocontext-states/index.html
https://wbrickner.wordpress.com/2016/09/27/awesome-js-html-spectrogram/
```