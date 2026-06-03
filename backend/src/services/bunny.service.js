const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Uploads a file to Bunny.net Storage
 * @param {string} localFilePath - The absolute path of the local file
 * @param {string} destinationFolder - The destination folder on Bunny.net (e.g., 'properties')
 * @param {string} originalName - The original name of the file to preserve extension
 * @returns {Promise<string>} - The CDN URL of the uploaded file
 */
const uploadToBunny = (localFilePath, destinationFolder, originalName) => {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.BUNNY_API_KEY;
        const storageZone = process.env.BUNNY_STORAGE_ZONE;
        const pullZone = process.env.BUNNY_PULL_ZONE;

        if (!apiKey || !storageZone || !pullZone) {
            return reject(new Error('Bunny.net credentials are not configured in .env'));
        }

        const ext = path.extname(originalName);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const filePath = `${destinationFolder}/${fileName}`;
        
        // e.g. sg.storage.bunnycdn.com or bny.storage.bunnycdn.com
        // We will default to storage.bunnycdn.com (main region)
        // If they use a different region, they can set BUNNY_STORAGE_URL
        const hostname = process.env.BUNNY_STORAGE_HOSTNAME || 'storage.bunnycdn.com';

        const options = {
            method: 'PUT',
            host: hostname,
            path: `/${storageZone}/${filePath}`,
            headers: {
                'AccessKey': apiKey,
                'Content-Type': 'application/octet-stream'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    // Success, build the CDN URL
                    const cdnUrl = `${pullZone}/${filePath}`;
                    resolve(cdnUrl);
                } else {
                    reject(new Error(`Bunny.net upload failed with status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        // Stream the file to the request
        const fileStream = fs.createReadStream(localFilePath);
        fileStream.pipe(req);
        
        fileStream.on('error', (err) => {
            reject(err);
        });
    });
};

module.exports = {
    uploadToBunny
};
