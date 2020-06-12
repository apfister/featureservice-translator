if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

require("cross-fetch/polyfill");
require("isomorphic-form-data");
const fs = require('fs');

let rawConfig = fs.readFileSync('config.json');
let config = JSON.parse(rawConfig);

// doc @ https://googleapis.dev/nodejs/translate/latest/v2.Translate.html#translate
// const {Translate} = require('@google-cloud/translate').v2;
// const translate = new Translate({projectId: config.gctProjectId});
const FormData = require('form-data');

const TJO = require('translate-json-object')();
TJO.init({
  googleApiKey: process.env.GOOGLE_TRANSLATE_API
});

const { UserSession } = require('@esri/arcgis-rest-auth');
const { getItem } = require('@esri/arcgis-rest-portal');
const { queryFeatures, applyEdits } = require('@esri/arcgis-rest-feature-layer');

let fsUrl = config.fsToBeTranslated;

async function main() {

  const userSession = await new UserSession({
    username: config.username,
    password: config.password
  });
  
  if (config.fsToBeTranslated.indexOf('http') === -1) {
    fsUrl = await getItem(config.fsToBeTranslated, {authentication: userSession}).then(response => response.url);
    if (config.layerId) {
      fsUrl = `${fsUrl}/${config.layerId}`;
    } else {
      fsUrl = `${fsUrl}/0`;
    }
  }
  // console.log(fsUrl);

  // add new fields to feature service
  const fieldsToAdd = config.fieldsToTranslate.map(field => {
  return { name: `${field}_${config.to}`,
    type: 'esriFieldTypeString',
    alias: `${field}_${config.to}`}
  })

  const adminUrl = `${fsUrl.replace('/rest/','/rest/admin/')}/addToDefinition`;
  const form = new FormData();
  form.append('f', 'json');

  const payload = {fields: fieldsToAdd};

  form.append('addToDefinition', JSON.stringify(payload));
  form.append('token', userSession.token);
  
  try {
    const addFieldsResponse = await fetch(adminUrl, {
      method: 'post',
      body: form
    }).then(response => response.json());
   
    // console.log(addFieldsResponse);
  } catch (error) {
    console.log(error);
  }
  

  const queryOptions = {
    url: fsUrl,
    where: config.where || '1=1',
    outFields: ['OBJECTID'].concat(config.fieldsToTranslate),
    returnGeometry: false,
    resultRecordCount: config.resultRecordCount || null,
    authentication: userSession
  };

  console.log('querying features ...');
  let response;
  try {
    response = await queryFeatures(queryOptions);
  } catch (error) {
    throw new Error([error.response.error.details, error.response.error.details.join(' || '), JSON.stringify(queryOptions)].join('\n')); 
  }

  console.log(`found ${response.features.length} features ...`);

  const toTranslate = response.features.map(feature => {
    let newFeature = {attributes: {}};
    for (let att in feature.attributes) {
      if (att.toUpperCase() === 'OBJECTID') {
        newFeature.attributes.OBJECTID = feature.attributes.OBJECTID;
        continue;
      }      
      newFeature.attributes[`${att}_${config.to}`] = feature.attributes[att];
    } 
    return newFeature;
  });
  
  // const results = await processTranslations(response.features);
  // console.log(results);  

  let translatedFeatures = null;
  try {
    translatedFeatures = await TJO.translate(toTranslate, config.to);
    // prepareEdits(translatedFeatures);
    console.log(translatedFeatures);  
  } catch (error) {
    console.log(error);
  }
  
  try {
    const editResults = await applyEdits({
      authentication: userSession,
      url: fsUrl,
      updates: translatedFeatures
    });
    // console.log(editResults);
    console.log('all done!');
  } catch (error) {
    console.log(error);
  }
}

main();