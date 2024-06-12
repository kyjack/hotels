const axios = require('axios');

const urls = [
  'https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/acme',
  'https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/patagonia',
  'https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/paperflies'
];

const getHotels = async () => {
  try {
    const responses = await Promise.all(urls.map(url => axios.get(url)));
    const data = responses.map(response => response.data);

    const hotels = [].concat(...data);

    return cleanAndMergeData(hotels);
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

const cleanAndMergeData = (data) => {
  const mergedData = {};

  const isEmpty = (value) => {
    return value === null || value === undefined || value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0);
  };

  const mergeFields = (target, source) => {
    Object.keys(source).forEach(key => {
      if (Array.isArray(source[key])) {
        target[key] = target[key] ? [...new Set([...target[key], ...source[key]])] : source[key];
      } else if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key]) {
          target[key] = {};
        }
        mergeFields(target[key], source[key]);
      } else if (!isEmpty(source[key])) {
        target[key] = target[key] || source[key];
      }
    });
  };

  data.forEach(hotel => {
    const id = hotel.Id || hotel.id || hotel.hotel_id;
    const destinationId = hotel.DestinationId || hotel.destinationId || hotel.destination;

    // will be using id as the primary key identifier

    if (!mergedData[id]) {
      // build the expected data set according to the expected return response structure

      mergedData[id] = {
        id,
        destinationId,
        name: '',
        location: {
          lat: null,
          lng: null,
          address: '',
          city: '',
          country: ''
        },
        description: '',
        amenities: {
          general: [],
          room: []
        },
        images: {
          rooms: [],
          site: [],
          amenities: []
        },
        booking_conditions: []
      };
    }

    const cleanedHotel = {
      id,
      destinationId,
      name: hotel.Name || hotel.name || hotel.hotel_name || '',
      location: {
        lat: hotel.Latitude || hotel.lat || hotel.location?.lat || null,
        lng: hotel.Longitude || hotel.lng || hotel.location?.lng || null,
        address: hotel.Address || hotel.address || hotel.location?.address || '',
        city: hotel.City || hotel.city || hotel.location?.city || '',
        country: hotel.Country || hotel.country || hotel.location?.country || ''
      },
      description: hotel.Description || hotel.description || hotel.info || '',
      amenities: {
        general: hotel.Facilities || hotel.amenities || hotel.amenities?.general || [],
        room: hotel.amenities?.room || []
      },
      images: {
        rooms: hotel.images?.rooms || [],
        site: hotel.images?.site || [],
        amenities: hotel.images?.amenities || []
      },
      booking_conditions: hotel.booking_conditions || []
    };

    mergeFields(mergedData[id], cleanedHotel);
  });

  return Object.values(mergedData);
};


module.exports = {
  getHotels
};