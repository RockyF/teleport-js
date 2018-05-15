'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.pack = pack;
exports.unpackHeader = unpackHeader;
exports.unpackBody = unpackBody;

var _bytebuffer = require('bytebuffer');

var _bytebuffer2 = _interopRequireDefault(_bytebuffer);

var _protobuf = require('./protobuf');

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var queryString = require('query-string'); /**
                                            * Created by rockyl on 2018/2/28.
                                            */

function pack(url, name, data, seq) {
	var buffer = new _bytebuffer2.default();
	// fake size
	buffer.writeUint32(0);
	// protocol version
	buffer.writeByte(102);
	// transfer pipe
	buffer.writeByte(0);
	// seq
	var s = seq + '';
	buffer.writeUint32(s.length);
	buffer.writeString(s);
	// pType
	buffer.writeByte(1);
	// uri
	buffer.writeUint32(url.length);
	buffer.writeString(url);
	// query
	buffer.writeUint32(0);
	// codec
	buffer.writeByte(112);
	// body
	buffer.append((0, _protobuf.marshal)(name, data));
	buffer.writeUint32(buffer.limit = buffer.offset, 0);

	buffer.offset = 0;

	return buffer.toArrayBuffer();
}

function unpackHeader(bytes) {
	var buffer = _bytebuffer2.default.wrap(bytes);

	var size = buffer.readUint32();
	var pVersion = buffer.readByte();
	var pipeSize = buffer.readByte();
	var seq = buffer.readUTF8String(buffer.readUint32());
	var pType = buffer.readByte();
	var url = buffer.readUTF8String(buffer.readUint32());
	var meta = buffer.readUTF8String(buffer.readUint32());
	var codec = buffer.readByte();

	var bodyBytes = new Uint8Array(buffer.toArrayBuffer());

	if (meta.length > 0) {
		meta = queryString.parse(meta);
		if ('X-Reply-Error' in meta) {
			meta['X-Reply-Error'] = JSON.parse(meta['X-Reply-Error']);
		}
	}

	var uri = _queryString2.default.parseUrl(url);

	return {
		uri: uri,
		meta: meta,
		pType: pType,
		seq: seq,
		bodyBytes: bodyBytes
	};
}

function unpackBody(bytes, name) {
	return (0, _protobuf.unmarshal)(name, bytes);
}