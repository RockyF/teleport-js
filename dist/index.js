"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _protobuf = require("./protobuf");

var _teleport = require("./teleport");

/**
 * Created by rocky.l on 2018/3/27.
 */

exports.default = {
	dial: function dial(url) {
		var session = new _teleport.Session();
		session.connect(url);
		return session;
	},
	events: _teleport.events,
	addProtoSource: _protobuf.addProtoSource,
	addProtoFilePath: _protobuf.addProtoFilePath,
	getAllTypes: _protobuf.getAllTypes
};