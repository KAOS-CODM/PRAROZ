const fs = require('fs');
const path = require('path');

const DATA_FOLDER = path.join(__dirname, '..', 'data');
const COMMENTS_FILE = path.join(DATA_FOLDER, 'comments.json');
const SUBSCRIBERS_FILE = path.join(DATA_FOLDER, 'subscribers.json');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJSON(file, data, space = 4) {
  fs.writeFileSync(file, JSON.stringify(data, null, space), 'utf8');
}

function readComments() {
  if (!fs.existsSync(COMMENTS_FILE)) return {};
  return JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf8'));
}

function writeComments(data) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(data, null, 2));
}

function readSubscribers() {
  if (!fs.existsSync(SUBSCRIBERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf8'));
}

function writeSubscribers(data) {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  DATA_FOLDER,
  COMMENTS_FILE,
  SUBSCRIBERS_FILE,
  readJSON,
  writeJSON,
  readComments,
  writeComments,
  readSubscribers,
  writeSubscribers,
};

