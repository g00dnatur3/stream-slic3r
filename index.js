const { Transform } = require('stream');

const nalUnitDelimeter = new Buffer([0,0,0,1]);

var buf = null;

module.exports = class NalStream extends Transform {
	_transform(data, encoding, callback) {
		var prevIndex = -1;
		var index = data.indexOf(nalUnitDelimeter);
		if (buf != null) {
			if (index == 0) {
				this.push(buf);
				buf = null;
			} else if (index > 0) {
				this.push(Buffer.concat([buf, data.slice(0, index)], index+buf.length));
				buf = null;
			}
		}
		while (index != -1) {
			prevIndex = index;
			index = data.indexOf(nalUnitDelimeter, index+1);
			if (prevIndex != -1 && index != -1) {
				const _buf = data.slice(prevIndex, index);
				if (_buf.length > 0) this.push(_buf);
			}
		}
		if (prevIndex == -1) {
			if (buf) {
				buf = Buffer.concat([buf, data], buf.length+data.length);
			} else {
				buf = data;
			}
		} else {
			if (buf) {
				const buf2 = data.slice(prevIndex); 
				buf = Buffer.concat([buf, buf2], buf.length+buf2.length);
			} else {
				buf = data.slice(prevIndex);
			}
		}
		callback();
	}
}
