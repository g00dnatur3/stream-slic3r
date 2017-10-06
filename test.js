const NalStream = require('./index.js');
const fs = require('fs');
const assert = require('assert');

const nalStream = new NalStream();
const h264Stream = fs.createReadStream('./sample.h264');

h264Stream.pipe(nalStream);

nalStream.on('data', function(data) {
  assert(data.toString('hex').substring(0, 8) === '00000001');
})

