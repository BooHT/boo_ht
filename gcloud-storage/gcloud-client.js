var process = require('process')
var request = require('request')
const gc = require('./gcloud-storage')
const bucket = gc.bucket(process.env.GCP_BUCKET_NAME) // should be your bucket name

/**
 *
 * @param { filepath } url or path to file to be uploaded
 * @description - This function does the following
 * - It uploads a file to the bucket on Google Cloud
 */

async function upload(filepath) {
  let ts = Date.now()
  const file = bucket.file(ts); 
  request(String(filepath)).pipe(file.createWriteStream());
}

/**
 *
 * @description - This function does the following
 * - It lists files in the storage bucket on Google Cloud
 */
async function listFiles() {
    // Lists files in the bucket
    const [files] = await bucket().getFiles();
    console.log('Files:');
    files.forEach(file => {
      console.log(file.name);
    });
}

module.exports = { listFiles: listFiles, upload: upload };
