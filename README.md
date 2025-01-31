# Spectrogram
This is an extension that plays and displays spectrograms of MP3, FLAC, and WAV audio files. Are you curious to see how your favorite songs' spectrograms look? 🦝🤪💭

![Spectrogram3.0](https://raw.githubusercontent.com/lanly-dev/VSCode-Spectrogram/refs/heads/main/media/vscodeignore/spec-sc4.png)

This extension contributes the following settings:

* `spectrogram.rgbColor`: Set color for rendering spectrogram
* `spectrogram.showDuration`: Show duration in treeview/file explorer. Disabling it would load file items faster if the directory has many audio files

## Known Issues

Autoplay policy prevents starting the song from selecting the audio file in the treeview.

## Release Notes

### 3.0.0
- Added support for `WAV`
- Added seekbar
- Added color configuration
- Fixed bugs
- Improved treeview
- New logo and icon

### 2.0.0
- Added support for `FLAC`
- Added 5-second seeking buttons
- Greatly reduced extension size

### 1.1.0
- Improved UI
- Fixed pause/resume
- Fixed minor bugs
- Refactored code

### 1.0.1
- Fixed path issue for macOS

### 1.0.0
- Initial release of Spectrogram
