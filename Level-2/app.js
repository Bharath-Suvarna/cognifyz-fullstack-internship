const express = require('express');
const path = require('path');
require('dotenv').config();

const connectDB = require('../Level-3/config/db');
const { attachUser } = require('./middleware/auth');
const { clearExpiredCache } = require('./middleware/cache');
const requestLogger = require('./middleware/logger');
const dashboardRoutes = require('../Level-4/routes/dashboardRoutes');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const externalRoutes = require('./routes/externalRoutes');
const formRoutes = require('./routes/formRoutes');
const { clearOldContacts } = require('./storage/tempStore');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, '..', 'Level-4', 'views')]);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'Level-1', 'public')));
app.use(requestLogger);
app.use(attachUser);

app.use('/api', apiRoutes);
app.use('/', authRoutes);
app.use('/', formRoutes);
app.use('/', externalRoutes);
app.use('/', dashboardRoutes);
app.use('/', eventRoutes);

setInterval(() => {
  clearExpiredCache();
  clearOldContacts();
}, 60 * 60 * 1000);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
