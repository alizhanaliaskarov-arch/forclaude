import {Config} from '@remotion/cli/config';
// Local Chromium in this environment; on your own machine you can delete this line.
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
// software WebGL (no GPU in the render container); on a machine with a GPU use 'angle'
Config.setChromiumOpenGlRenderer('swangle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
