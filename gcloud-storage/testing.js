const gcloud_cli = require('./gcloud-client');

const addRoutes = (app) => {
  app.post('/test', (req, res) => {  
    let msg = req.body.message;
    console.info(msg);
    let payload = msg.attachment.payload;
    let attachment_url = payload.url;
    // curl -X POST -H "Content-Type: application/json" -d '{
    //   "message":{
    //     "attachment":{
    //       "type":"image", 
    //       "payload":{
    //         "url":"http://www.messenger-rocks.com/image.jpg", 
    //         "is_reusable":true,
    //       }
    //     }
    //   }
    gcloud_cli.upload(attachment_url);
    return res.status(200);
  });

  app.get('/test', (req, res) => {
    gcloud_cli.listFiles()
  });

  return app;
}

module.exports = { addRoutes: addRoutes };
