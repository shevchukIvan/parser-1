const express = require('express');
const axios = require('axios');
const { parseString, Builder } = require('xml2js');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const url = 'https://manycase.com.ua/products_feed.xml?hash_tag=ca55ad76023ad40cb9c5995da1e11022&sales_notes=&product_ids=&label_ids=&exclude_fields=&html_description=0&yandex_cpa=&process_presence_sure=&languages=uk%2Cru&group_ids=32586335%2C32586357&nested_group_ids=32586335%2C32586357';

  axios.get(url)
    .then(response => {
      const xmlData = response.data;

      parseString(xmlData, { trim: true }, (err, result) => {
        if (err) {
          console.error('Error parsing XML:', err);
          res.status(500).send('Error parsing XML');
        } else {
          // Navigate to the required nodes and check/modify attributes
          if (result.yml_catalog && result.yml_catalog.shop && result.yml_catalog.shop[0]) {
            const shop = result.yml_catalog.shop[0];
            
            if (shop.offers && shop.offers[0] && shop.offers[0].offer) {
              const offers = shop.offers[0].offer;
              let groupId = '';
              // Loop through the offer nodes and modify attributes as needed
              offers.forEach(offer => {
                // Check if the attribute exists and its value meets a condition
                if (offer.$.group_id){
                    groupId = offer.$.group_id
                }
                if (!offer.$.group_id) {
                  // Modify the attribute
                  offer.$.group_id = `${groupId}`;
                }
                // You can add more conditions and modifications here
              });
            }
          }

          // Build the modified XML data
          const xmlBuilder = new Builder({ headless: true });
          const modifiedXmlData = xmlBuilder.buildObject(result);

          // Set appropriate headers for XML response
          res.set('Content-Type', 'application/xml');
          
          // Send the modified XML data as response
          res.send(modifiedXmlData);
        }
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).send('Error fetching data');
    });
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
