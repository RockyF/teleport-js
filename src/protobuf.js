/**
 * Created by rockyl on 2018/2/21.
 */

import protobuf from "protobufjs"

let protoCache = {};
let protoRootMap = {};

export function getProto(name) {
	if(name){
		let proto = protoCache[name];
		let temp;
		if (!proto) {
			let arr = name.split('.');
			let ns = arr[0];
			temp = protoRootMap[ns].lookup(name);
			if (temp) {
				proto = protoCache[name] = temp;
			}
		}
		if (!proto && !temp) {
			//logger.warn(`proto message is not exist (${name})`);
			return null;
		}
		return proto;
	}else {
		return null
	}
}

export function getAllTypes() {
	let result = {};
	for (let key in protoRootMap) {
		result[key] = [];
		let root = protoRootMap[key];
		for (let k2 in root.nested[key].nested) {
			let type = root.nested[key].nested[k2];
			result[key].push(type);
		}
	}
	return result;
}

export function addProtoSource(namespace, content) {
	protoRootMap[namespace] = protobuf.parse(content).root;

	return Promise.resolve();
}

export function addProtoFilePath(namespace, filePath) {
	return protobuf.load(filePath).then(
		(root) => {
			//logger.trace('load ball.proto');
			protoRootMap[namespace] = root;
		},
		(err) => {
			//logger.warn('can not ball.proto:', err);
		}
	);
}

export function marshal(messageName, message) {
	let proto = getProto(messageName);
	if (!proto) {
		return;
	}

	return proto.encode(message).finish();
}

export function unmarshal(messageName, bytes) {
	let proto = getProto(messageName);
	if (!proto) {
		return;
	}

	return proto.decode(bytes);
}
