# nal-stream

A nodejs stream that emits data in nal units

much faster than https://github.com/samcday/node-stream-splitter
.split() is very slow and uses alot of cpu, used .indexOf
just as fast if you implemented in C because nodejs indexOf uses calls native code.

# example code from test.js

```
const NalStream = require('./index.js');
const fs = require('fs');
const assert = require('assert');

const nalStream = new NalStream();
const h264Stream = fs.createReadStream('./sample.h264');

h264Stream.pipe(nalStream);

nalStream.on('data', function(data) {
  assert(data.toString('hex').substring(0, 8) === '00000001');
})


```
