const StreamSlicer = require('./index.js');
const assert = require('assert');

// example string slicer

var test = 'happyFIRST_CHUNKhappySECOND_CHUNKhappyTHIRD_CHUNKhappyFOURTH_CHUNKhappyFIFTH_CHUNK';
const stringSlicer = new StreamSlicer('happy');

stringSlicer.on('data', function(data) {
  assert(data.toString().indexOf('happy') == 0);
  console.log(data.toString());
})

stringSlicer.end(test);

// example nal unit slicer

const fs = require('fs');
const nalSlicer = new StreamSlicer([0,0,0,1]);
const h264Stream = fs.createReadStream('./sample.h264');

h264Stream.pipe(nalSlicer);

nalSlicer.on('data', function(data) {
  assert(data.toString('hex').substring(0, 8) === '00000001');
})
