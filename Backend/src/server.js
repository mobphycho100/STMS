const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const env = require('./config/env');
const connectDB = require('./config/db');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

// CORS: allow multiple origins and strip trailing slashes
const allowedOrigins = Array.isArray(env.corsOrigin) ? env.corsOrigin : [env.corsOrigin].filter(Boolean);
const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true); // non-browser or same-origin
        const normalized = origin.replace(/\/$/, '');
        if (allowedOrigins.includes(normalized)) return callback(null, true);
        return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(logger);

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

app.get('/api/v1/health', (_req, res) =>
    res.json({ success: true, data: { status: 'ok' }, error: null })
);

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

connectDB(env.mongoUri)
    .then(() => {
        app.listen(env.port, () => {
            console.log(`Server running on port ${env.port}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect DB', err);
        process.exit(1);
    });
