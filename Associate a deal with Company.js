// Import the Hubspot NodeJS Client Library - this will allow us to use the HubSpot APIs
const hubspot = require('@hubspot/api-client');

/* 
This function is called when the custom code action is executed. It takes 2 arguements. The first is the event object which contains information on the currently enrolled object. 
The second is the callback function which is used to pass data back to the workflow.
*/
exports.main = (event, callback) => {
  
  // Instantiate a new HubSpot API client using the HAPI key (secret)
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.accessKey
  });
  
  // Retrive the currently enrolled contacts "company" property
  hubspotClient.crm.deals.basicApi.getById(event.object.objectId, ["solar_installer_name_1"])
    .then(results => {
	// Get data from the results and store in variables
	let companyName = results.body.properties.solar_installer_name_1;

	// Create search criteria   
	const filter = { propertyName: 'name', operator: 'EQ', value: companyName }
	const filterGroup = { filters:	[filter] 	}
        const sort = JSON.stringify({ propertyName: 'name', direction: 'DESCENDING'})
        const properties = ['name']
        const limit = 1
        const after = 0
        
        const searchCriteria = {
          filterGroups: [filterGroup],
          sorts: [sort],
          properties,
          limit,
          after
        }

      // Search the CRM for Companies matching "companyName" variable defined earlier
      hubspotClient.crm.companies.searchApi.doSearch(searchCriteria).then(searchCompanyResponse => {
        
         //console.log("RESULTS: " + searchCompanyResponse.body.total); // - FOR DEBUG
 
         // If total equals 0 no results found
         if(searchCompanyResponse.body.total == 0){ //NO MATCH FOUND - CREATE COMPANY AND ASSOCIATE
           console.log("COMPANY " + companyName  + "NOT FOUND: CREATE + ASSOCIATE") // - FOR DEBUG
           
           
         }else{ // MATCH FOUND - ASSOCIATE COMPANY TO DEAL
           // console.log("COMPANY " + companyName + " FOUND: ASSOCIATE RECORDS"); // - FOR DEBUG
          //Associate Company with Contact
           hubspotClient.crm.companies.associationsApi.create(searchCompanyResponse.body.results[0].id,'deals', event.object.objectId,'certified_installer');
         }
      });
   
      callback({outputFields: {}});
    
    })
    .catch(err => {
      console.error(err);
    });
}