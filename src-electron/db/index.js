// const Datastore = require('nedb');
// const path = require('path');

import Datastore from 'nedb';
import path from 'path';

import {Data} from './models/data';

let db = {};
db.stations = new Datastore({
    filename: path.join(__dirname, 'files/stations.db'),
    autoload: true
})

db.settings = new Datastore({
    filename: path.join(__dirname, 'files/settings.db'),
    autoload: true
})

db.chunks = new Datastore({
    filename: path.join(__dirname, 'files/chunks.db'),
    autoload: true
})

export default db;