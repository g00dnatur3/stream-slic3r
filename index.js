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

//var delimeter = null;
//var buf = null;

module.exports = class StreamSlicer extends Transform {
	constructor(delim, enc) {
		super();
		if (!delim) {
			console.log('[stream-slicer] - err: you must specify a delimeter as string, buffer, or array');
		} else {
			if (Object.getType(delim) == 'string') {
				this._delimeter = Buffer.from(delim, enc);
			}
			if (Object.getType(delim) == 'array') {
				this._delimeter = Buffer.from(delim);
			}
			if (Object.getType(delim) == 'uint8array') {
				this._delimeter = delim;
			}
			this._buf = null;
		}
	}
	_transform(data, encoding, callback) {
		var prevIndex = -1;
		var index = data.indexOf(this._delimeter);
		if (this._buf != null) {
			if (index == 0) {
				this.push(this._buf);
				this._buf = null;
			} else if (index > 0) {
				this.push(Buffer.concat([this._buf, data.slice(0, index)], index+this._buf.length));
				this._buf = null;
			}
		}
		while (index != -1) {
			prevIndex = index;
			index = data.indexOf(this._delimeter, index+1);
			if (prevIndex != -1 && index != -1) {
				const _buf = data.slice(prevIndex, index);
				if (_buf.length > 0) this.push(_buf);
			}
		}
		if (prevIndex == -1) {
			if (this._buf) {
				this._buf = Buffer.concat([this._buf, data], this._buf.length+data.length);
			} else {
				this._buf = data;
			}
		} else {
			if (this._buf) {
				const buf2 = data.slice(prevIndex); 
				this._buf = Buffer.concat([this._buf, buf2], this._buf.length+buf2.length);
			} else {
				this._buf = data.slice(prevIndex);
			}
		}
		callback();
	}
	_flush(callback) {
		if (this._buf != null) {
			this.push(this._buf);
			this._buf = null;
		}
	}
}
