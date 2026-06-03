const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Compresses a video file by 20% (reduces bitrate)
 * @param {string} inputPath - Path to input video file
 * @param {string} outputPath - Path to save compressed video
 * @returns {Promise<void>}
 */
const compressVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(inputPath)) {
      return reject(new Error('Input video file not found'));
    }

    // Get original bitrate
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        return reject(new Error(`Failed to probe video: ${err.message}`));
      }

      const originalBitrate = metadata.format.bit_rate || 5000000; // Default 5Mbps
      // Reduce bitrate by 20%
      const compressedBitrate = Math.floor(originalBitrate * 0.8);
      const bitrate = Math.floor(compressedBitrate / 1000); // Convert to kbps

      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .videoBitrate(`${bitrate}k`)
        .audioBitrate('128k')
        .on('error', (err) => {
          reject(new Error(`Video compression failed: ${err.message}`));
        })
        .on('end', () => {
          resolve();
        })
        .save(outputPath);
    });
  });
};

/**
 * Gets video duration in seconds
 * @param {string} videoPath - Path to video file
 * @returns {Promise<number>} - Duration in seconds
 */
const getVideoDuration = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        return reject(new Error(`Failed to probe video: ${err.message}`));
      }
      resolve(metadata.format.duration || 0);
    });
  });
};

/**
 * Gets file size in MB
 * @param {string} filePath - Path to file
 * @returns {number} - File size in MB
 */
const getFileSizeInMB = (filePath) => {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
};

module.exports = {
  compressVideo,
  getVideoDuration,
  getFileSizeInMB
};
