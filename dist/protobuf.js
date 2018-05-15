"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getProto = getProto;
exports.getAllTypes = getAllTypes;
exports.addProtoSource = addProtoSource;
exports.addProtoFilePath = addProtoFilePath;
exports.marshal = marshal;
exports.unmarshal = unmarshal;

var _protobufjs = require("protobufjs");

var _protobufjs2 = _interopRequireDefault(_protobufjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var protoCache = {}; /**
                      * Created by rockyl on 2018/2/21.
                      */

var protoRootMap = {};

function getProto(name) {
	if (name) {
		var proto = protoCache[name];
		var temp = void 0;
		if (!proto) {
			var arr = name.split('.');
			var ns = arr[0];
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
	} else {
		return null;
	}
}

function getAllTypes() {
	var result = {};
	for (var key in protoRootMap) {
		result[key] = [];
		var root = protoRootMap[key];
		for (var k2 in root.nested[key].nested) {
			var type = root.nested[key].nested[k2];
			result[key].push(type);
		}
	}
	return result;
}

function addProtoSource(namespace, content) {
	protoRootMap[namespace] = _protobufjs2.default.parse(content).root;

	return Promise.resolve();
}

function addProtoFilePath(namespace, filePath) {
	return _protobufjs2.default.load(filePath).then(function (root) {
		//logger.trace('load ball.proto');
		protoRootMap[namespace] = root;
	}, function (err) {
		//logger.warn('can not ball.proto:', err);
	});
}

function marshal(messageName, message) {
	var proto = getProto(messageName);
	if (!proto) {
		return;
	}

	return proto.encode(message).finish();
}

function unmarshal(messageName, bytes) {
	var proto = getProto(messageName);
	if (!proto) {
		return;
	}

	return proto.decode(bytes);
}