let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let logger = require('morgan');
let moment = require('moment');
const jwt = require(`jsonwebtoken`);
const { JWT_SECRET } = require('./resources/global');

let app = express();
let cors = require(`cors`);

logger.token('date', (req, res) => {
	return moment().format('DD MMM YYYY HH:mm:ss');
});
app.use(logger('[:date] :method :url :status :res[content-length] - :response-time ms'));
app.use(bodyParser.json({
	limit: '500mb',
	verify: (req, res, buf, encoding) => {
		if (buf && buf.length) {
			req.rawBody = buf.toString(encoding || 'utf8');
		}
	},
}));

app.use(bodyParser.urlencoded({ limit: '500mb', extended: true, parameterLimit: 50000 }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const corsOptions = {
	exposedHeaders: 'Content-Disposition',
	optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

app.use((req, res, next) => {
	next();
});

function verifyToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).send('Unauthorized');
	}

	jwt.verify(token, JWT_SECRET, function (err, decoded) {
		req.getUser = () => {
			if (err) {
				throw err;
			}
			if (decoded) {
				return decoded;
			}
		};
		next();
	});
}

require(`./route_paths/1. hotel`)(app);


app.use(function (req, res, next) {
	console.log(`${req.method} -> ${req.originalUrl} is not a proper route!`);
	next(createError(404));
});

app.use(async function (err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	delete err.stack;

	if (err.message.toLowerCase() === 'jwt expired') {
		err.status = 401;
	}

	const status = err.status || 500;

	res.status(status).json({
		error: err.message
	});

});

module.exports = { app: app };
