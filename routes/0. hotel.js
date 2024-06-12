const express = require('express');
const router = express.Router();
const Fuse = require('fuse.js');
const { getHotels } = require('../controllers/hotel_resources');

router.get(`/`, async function (req, res, next) {
    try {
        const searchTerm = req.query.search;
        const hotelId = req.query.hotelId;
        const destinationId = req.query.destinationId;

        // can be added according to required filters

        const hotels = await getHotels();

        let filteredHotels = hotels.filter(hotel => {
            return (!hotelId || hotel.id === hotelId) && (!destinationId || hotel.destinationId === parseInt(destinationId));
        });

        if (searchTerm) {
            // implete fusejs for better searching, a fuzzy search
            const fuseOptions = {
                keys: [
                    'name',
                    'description',
                    'amenities.general',
                    'amenities.room'
                ],
                // can include more fields for seaching
                useExtendedSearch: true,
                threshold: 0.3
            };

            const fuse = new Fuse(filteredHotels, fuseOptions);
            filteredHotels = fuse.search(searchTerm).map(result => result.item);
        }

        res.status(200).json({
            data: filteredHotels || [],
            status: 200,
            message: `Hotels successfully retrieved.`
        });
    } catch (err) {
        next(err);
    }
})

module.exports = router;
