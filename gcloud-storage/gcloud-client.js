require('process')
const gc = require('./gcloud-storage')
const bucket = gc.bucket(process.env.GCP_BUCKET_NAME) // should be your bucket name

/**
 *
 * @param { filepath } url or path to file to be uploaded
 * @description - This function does the following
 * - It uploads a file to the bucket on Google Cloud
 */

async function upload(filepath) {
  let splits = filepath.split('/');
  filename = splits[splits.length - 1];
  filename = filename.replace(/ /g, "_");

  // get extension 
  dst = filename.split('.');
  let ts = Date.now()
  let destPath = `${dst[0]}-${ts}.${dst[1]}`;
  let opts =  {
    gzip: true,
    destination: destPath
  };
  bucket.upload(filepath, opts, (err, file) => {
    if (err) {
      console.error(err);
    } else {
      console.info('Successfully uploaded ' + file + ' to ' + destPath);
    }
  })
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
