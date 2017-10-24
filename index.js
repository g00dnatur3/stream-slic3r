const { Transform } = require('stream');

Object.getType = (function(global) {
	const cache = {};
	return function getType(obj) {
    	var key;
    	return obj === null ? 'null' // null
        	: obj === global ? 'global' // window in browser or global in nodejs
        	: (key = typeof obj) !== 'object' ? key // basic: string, boolean, number, undefined, function
        	: obj.nodeType ? 'object' // DOM element
        	: cache[key = Object.prototype.toString.call(obj)] // cached. date, regexp, error, object, array, math
        	|| (cache[key] = key.slice(8, -1).toLowerCase()); // get XXXX from [object XXXX], and cache it
	};
}(this));

var delimeter = null;
var buf = null;

module.exports = class StreamSlicer extends Transform {
	constructor(delim, enc) {
		super();
		if (!delim) {
			console.log('[stream-slicer] - err: you must specify a delimeter as string, buffer, or array');
		} else {
			if (Object.getType(delim) == 'string') {
				delimeter = Buffer.from(delim, enc);
			}
			if (Object.getType(delim) == 'array') {
				delimeter = Buffer.from(delim);
			}
			if (Object.getType(delim) == 'uint8array') {
				delimeter = delim;
			}
		}
	}
	_transform(data, encoding, callback) {
		var prevIndex = -1;
		var index = data.indexOf(delimeter);
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
			index = data.indexOf(delimeter, index+1);
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
	_flush(callback) {
		if (buf != null) {
			this.push(buf);
			buf = null;
		}
	}
}
