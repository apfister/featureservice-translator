# Feature Service Translator
Translate fields in an existing feature service using google translate.

## Requirements & Setup
- Install NodeJs
- git clone or download the repo
- Google Cloud Platform Project with Google Cloud Translatation API setup ([from google doc on github](https://github.com/googleapis/nodejs-translate/blob/master/README.md#before-you-begin))
  1.  [Select or create a Cloud Platform project][projects].
  1.  [Enable billing for your project][billing].
  1.  [Enable the Cloud Translation API][enable_api].
  1.  [Set up authentication with a service account][auth] so you can access the
    API from your local workstation.
  1. From the Crendential section in your Google Cloud Platform project, donwload the JSON file that contains your service account key
  1. Create a `.env` file at the root of your application and add an entry to reference the account key JSON file
    `GOOGLE_APPLICATION_CREDENTIALS=/home/user/Downloads/[FILE_NAME].json`
- from a terminal, change the directory to what you just cloned/downloaded by using `cd <directoryName>`
- run `npm install` to install any dependencies
- Add a `config.json` file in your root that follows the example below
- A hosted feature service
- Make sure you feature service has an `OBJECTID` field 
- run `node index.js` from your favorite terminal application
- The output will create fields in your feature service that follows this pattern: `fieldName_{languageCode}`

`config.json.` example
```
{
  // for secured services
  "username": "<arcgis online username>",
  "password": "<password>",

  // id of your GCP project
  "gctProjectId": "my-gcp-project",

  // or feature service URL with /layerId
  "fsToBeTranslated": "86fb386a36e542c3949e2c354d76f0bf", 
  
   // ignored if you are using an ArcGIS Online itemId
  "layerId": 0,
  
  // from language code
  "from": "en", 

  // to language code
  "to": "hi", 
  
  // fields to translate. '*' currently not supported :/
  "fieldsToTranslate": [ 
    "event_type",
    "notes"
  ]
}
```

[client-docs]: https://googleapis.dev/nodejs/translate/latest
[product-docs]: https://cloud.google.com/translate/docs/
[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid=translate.googleapis.com
[auth]: https://cloud.google.com/docs/authentication/getting-started