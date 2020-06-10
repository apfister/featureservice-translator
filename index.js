require("cross-fetch/polyfill");
require("isomorphic-form-data");

const tr = require("googletrans").default;
const fs = require('fs');
const FormData = require('form-data');

const { UserSession } = require('@esri/arcgis-rest-auth');
const { getItem } = require('@esri/arcgis-rest-portal');
const { queryFeatures } = require('@esri/arcgis-rest-feature-layer');
const { applyEdits } = require('@esri/arcgis-rest-feature-layer');
// const { addToServiceDefinition } = require('@esri/arcgis-rest-service-admin');
const { request } = require('@esri/arcgis-rest-request');

let rawConfig = fs.readFileSync('config.json');
let config = JSON.parse(rawConfig);

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

  let returnGeometry = false;
  if (config.createNew) {
    // TODO: create a new feature service with the same schema as the original
    returnGeometry = true;
  }

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
    where: '1=1',
    outFields: ['OBJECTID'].concat(config.fieldsToTranslate),
    returnGeometry,
    authentication: userSession
  };

  const response = await queryFeatures(queryOptions);
  
  const results = await processTranslations(response.features);
  // console.log(results);  

  const editResults = await applyEdits({
    authentication: userSession,
    url: fsUrl,
    updates: results
  });

  // console.log(editResults);
  console.log('all done!');
 }

async function processTranslations (features) {
  let responses = [];
  const opts =  {from: config.from, to: config.to};
  await Promise.all(features.map(async (feature) => {
    await Promise.all(config.fieldsToTranslate.map(async field => {
      const sourceText = feature.attributes[field];
      const res = await tr(sourceText, opts);
      feature.attributes[`${field}_${config.to}`] = res.text;
      delete feature.attributes[field];
      responses.push(feature);
    }));
    
  }));
  return responses;
}

main();