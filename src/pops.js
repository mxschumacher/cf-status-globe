// the JSON file could change at any moment, but I cannot listen to changes, I have to poll the site.
// I can expose an endpoint that I trigger with cron to make a call every 5 minutes to see whether there was a change

async function getDataCenters() {
    const apiUrl = 'https://www.cloudflarestatus.com/api/v2/components.json';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();

        // Filter out the components that are data centers
        const dataCenters = data.components.filter(component => {
            // Assuming data centers have a specific pattern in their name or other properties
            return component.name.includes('- (') && !component.group && !component.description;
        });

        return dataCenters;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return [];
    }
}

// Example usage
getDataCenters().then(dataCenters => {

    console.log(`Number of Data centers: ${dataCenters.length}`)
    /*
    dataCenters.map(dc => {
      console.log(`Name: ${dc.name}, Status: ${dc.status}`)
    })
    */
}).catch(error => {
    console.error('Error:', error);
});

// Taking city + country, we can ask an API to return the coordinates to us. Geocoding.
// We can then create a world map that shows the current status
