# Feature Service Translator
Translate fields in an existing feature service using google translate.

## Requirements
- NodeJs
- A hosted feature service
- An `OBJECTID` field in said feature service

## Setup
- Add a `config.json` file in your root that follows the example below
- run `node index.js` from your favorite terminal application
- The output will create fields in your feature service that follows this pattern: `fieldName_{languageCode}`

`config.json.` example
```
{
  // for secured services
  "username": "<arcgis online username>",
  "password": "<password>",

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