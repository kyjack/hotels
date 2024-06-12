module.exports = (app) => {
	app.use(`/hotels/`, require(`../routes/0. hotel`));

};
