const Router = require('express');
const admin = require('firebase-admin');
const env = require('../environment-variables');
const shared = require('../shared/utils');

const KEY = env.apiKey;

const router = Router();

const db = admin.firestore();

module.exports = router;
