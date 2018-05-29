/**
 * Created by rockyl on 2018/2/28.
 */

import {marshal, unmarshal} from './protobuf'
import queryString from 'query-string'
//import ByteBuffer from 'bytebuffer'
const ByteBuffer = dcodeIO.ByteBuffer;

export function pack(url, name, data, seq) {
	let buffer = new ByteBuffer();
	// fake size
	buffer.writeUint32(0);
	// protocol version
	buffer.writeByte(102);
	// transfer pipe
	buffer.writeByte(0);
	// seq
	let s = seq + '';
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
	buffer.append(marshal(name, data));
	buffer.writeUint32(buffer.limit = buffer.offset, 0);

	buffer.offset = 0;

	return buffer.toArrayBuffer()
}

export function unpackHeader(bytes) {
	let buffer = ByteBuffer.wrap(bytes);

	let size = buffer.readUint32();
	let pVersion = buffer.readByte();
	let pipeSize = buffer.readByte();
	let seq = buffer.readUTF8String(buffer.readUint32());
	let pType = buffer.readByte();
	let url = buffer.readUTF8String(buffer.readUint32());
	let meta = buffer.readUTF8String(buffer.readUint32());
	let codec = buffer.readByte();

	let bodyBytes = new Uint8Array(buffer.toArrayBuffer());

	if (meta.length > 0) {
		meta = queryString.parse(meta);
		if ('X-Reply-Error' in meta) {
			meta['X-Reply-Error'] = JSON.parse(meta['X-Reply-Error']);
		}
	}

	let uri = queryString.parseUrl(url);

	return {
		uri,
		meta,
		pType,
		seq,
		bodyBytes,
	}
}

export function unpackBody(bytes, name) {
	return unmarshal(name, bytes);
}
