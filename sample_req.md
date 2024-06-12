# API Data Fetch Example

This example demonstrates how to fetch data from a local API endpoint using JavaScript's Fetch API. The goal is to retrieve hotel information based on a specified destination ID and search term.

## Setup

Before you begin, ensure you have the following:

- A running local server on `http://127.0.0.1:3000`.
- An endpoint `/hotels` that accepts query parameters for `hotelId`, `destinationId` and `search`.

## Fetch Request

The following JavaScript code snippet demonstrates how to make a GET request to fetch hotel data. This example uses the Fetch API available in modern web browsers.

```javascript
// Define the headers for the request
let headersList = {
  Accept: "*/*",
};

// Make the GET request
let response = await fetch(
  "http://127.0.0.1:3000/hotels?destinationId=5432&search=Coffee%20machine",
  {
    method: "GET",
    headers: headersList,
  }
);

// Process the response
let data = await response.text();
console.log(data);
```
