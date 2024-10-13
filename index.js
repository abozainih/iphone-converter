const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const inputFolder = './videos';
const outputFolder = './converted';

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

function convertVideo(file) {
  const fileName = path.basename(file, path.extname(file));
  const inputFilePath = path.join(inputFolder, file);
  const outputMp4Path = path.join(outputFolder, `${fileName}.mp4`);
  const outputMp3Path = path.join(outputFolder, `${fileName}.mp3`);

  console.log(`Processing: ${file}`);

  ffmpeg(inputFilePath)
    .videoCodec('libx264')
    .audioCodec('aac')
    .outputOptions([
      '-movflags faststart',
      '-profile:v baseline',
      '-level 3.1',
      '-preset fast',
      '-crf 23',
      '-pix_fmt yuv420p'
    ])
    .on('end', () => {
      console.log(`MP4 conversion complete: ${outputMp4Path}`);

      ffmpeg(inputFilePath)
        .noVideo()
        .audioCodec('libmp3lame')
        .on('end', () => {
          console.log(`MP3 creation complete: ${outputMp3Path}`);
        })
        .on('error', (err) => {
          console.error(`Error converting to MP3 for file: ${file}. Error: ${err.message}`);
        })
        .save(outputMp3Path);
    })
    .on('error', (err, stdout, stderr) => {
      console.error(`Error converting to iPhone MP4 for file: ${file}. Error: ${err.message}`);
      console.error('FFmpeg output:', stdout);
      console.error('FFmpeg stderr:', stderr);
    })
    .save(outputMp4Path);
}

fs.readdir(inputFolder, (err, files) => {
  if (err) {
    console.error('Error reading folder:', err);
    return;
  }

  const mp4Files = files.filter(file => path.extname(file).toLowerCase() === '.mp4');
  if (mp4Files.length === 0) {
    console.log('No MP4 files found.');
    return;
  }

  mp4Files.forEach(file => convertVideo(file));
});
