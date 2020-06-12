# Feature Service Translator
Translate fields in an existing feature service using google translate.

## Requirements & Setup
- Install NodeJs
- git clone or download the repo
- Get your Google Translate API Key
- Create a `.env` file at the root of your application and add an entry to reference your API Key
   > `GOOGLE_TRANSLATE_API=<API KEY>`
- from a terminal, change the directory to what you just cloned/downloaded by using `cd <directoryName>`
- run `npm install` to install any dependencies
- Add a `config.json` file in your root that follows the example below
- Find your hosted feature service
  - Make sure you feature service has an `OBJECTID` field 
  - Fill in the  `config.json` file with your feature service info
- run `node index.js` from your favorite terminal application
- The output will create fields in your feature service that follows this pattern: `fieldName_{languageCode}`

`config.json` example
```
{
  // required
  // or feature service URL with /layerId
  "fsToBeTranslated": "86fb386a36e542c3949e2c354d76f0bf", 

  // required
  // output translation language code
  "to": "hi", 

  // required
  // fields to translate. '*' currently not supported :/
  "fieldsToTranslate": [ 
    "event_type",
    "notes"
  ],

  // optional
  // ignored if you are using an ArcGIS Online itemId
  "layerId": 0,

  // optional
  // for secured services
  "username": "<arcgis online username>",
  "password": "<password>",
  
  // optional
  // where clause for feature service. defaults to 1=1
  "where": "STATE = 'Wisconsin'",

  // optional
  // can be used to limit results. defaults to null (no limit or feature service defined limit)
  "resultRecordCount": 10

}
```

[client-docs]: https://googleapis.dev/nodejs/translate/latest
[product-docs]: https://cloud.google.com/translate/docs/
[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid=translate.googleapis.com
[auth]: https://cloud.google.com/docs/authentication/getting-started