# Amazon Price Scraper
----------
###### By - Vikram Damle (190123065), Akshat Arun (190101007)

#### Description: 
* A Chrome Extension to scrape selected product prices off of the [Amazon Web Store](amazon.in) and store them for any user.

#### Instructions:
* Clone the repo.
* In the root directory, run ```npm install```.
* Create a database on [Atlas|MongoDB](cloud.mongodb.com).
* In the ```./server/``` directory, create a config file with and export the uri for the MongoDB database and a random encryption string
```javascript
// server/config.js
const creds = {
    username : '<username>',
    password : '<password>',
}

module.exports = {
    url: `mongodb+srv://${creds.username}:${creds.password}@cluster0.xukwz.
    mongodb.net/<uri>`,
    randomString: "<random string>"
}
```
* Run ```npm start``` in the root directory to start up the backend server.
* In a Chrome window, navigate to the *Manage Extensions* page and enable *Developer Mode*.
* Click on the *Load Unpacked* button and select the root directory of the repository.
* The extension should now appear in the extensions dropdown on the right.

#### Technologies Used
* Angular - Front end extension logic and user interface.
* NodeJS  - Backend business logic and communication between the front end and the database.
* MongoDB - A NoSQL database to store user and product info.

----------

