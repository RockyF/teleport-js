'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Session = exports.events = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _protocol = require('./protocol');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by rockyl on 2018/2/28.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var seq = 0;

var events = exports.events = {
	CONNECT: 'connect',
	CLOSE: 'close',
	ERROR: 'error'
};

var Session = exports.Session = function (_EventEmitter) {
	_inherits(Session, _EventEmitter);

	function Session() {
		_classCallCheck(this, Session);

		var _this = _possibleConstructorReturn(this, (Session.__proto__ || Object.getPrototypeOf(Session)).call(this));

		_this.callbackHandlerMap = {};
		_this.routerMap = {};
		_this.connected = false;
		return _this;
	}

	_createClass(Session, [{
		key: '_onConnect',
		value: function _onConnect(event) {
			this.connected = true;

			this.emit(events.CONNECT);
		}
	}, {
		key: '_onClose',
		value: function _onClose(event) {
			this.connected = false;

			this.emit(events.CLOSE);
		}
	}, {
		key: '_onError',
		value: function _onError(event) {
			this.connected = false;

			this.emit(events.ERROR);
		}
	}, {
		key: '_onMessage',
		value: function _onMessage(event) {
			this.connected = true;

			var _unpackHeader = (0, _protocol.unpackHeader)(event.data),
			    uri = _unpackHeader.uri,
			    meta = _unpackHeader.meta,
			    pType = _unpackHeader.pType,
			    seq = _unpackHeader.seq,
			    bodyBytes = _unpackHeader.bodyBytes;

			var body = void 0;
			switch (pType) {
				case 0:
					//default

					break;
				case 1:
					//pull

					break;
				case 2:
					//reply
					var _callbackHandlerMap$s = this.callbackHandlerMap[seq],
					    name = _callbackHandlerMap$s.name,
					    resolve = _callbackHandlerMap$s.resolve,
					    reject = _callbackHandlerMap$s.reject;

					delete this.callbackHandlerMap[seq];
					var error = meta['X-Reply-Error'];
					if (error) {
						reject(error);
					} else {
						var repName = name + 'Rep';
						body = (0, _protocol.unpackBody)(bodyBytes, repName);
						resolve(body);
					}
					break;
				case 3:
					//push
					var router = this.routerMap[uri.url];
					if (router) {
						body = (0, _protocol.unpackBody)(bodyBytes, router.pName);
						this.emit(uri.url, { body: body, uri: uri });
					}
					break;
			}
		}
	}, {
		key: 'connect',
		value: function connect(url) {
			var socket = this.socket = new WebSocket(url);
			socket.binaryType = 'arraybuffer';

			socket.onopen = this._onConnect.bind(this);
			socket.onmessage = this._onMessage.bind(this);
			socket.onclose = this._onClose.bind(this);
			socket.onerror = this._onError.bind(this);
		}
	}, {
		key: 'on',
		value: function on(event, pName) {
			var listener = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

			if (typeof pName === 'string') {
				this.routerMap[event] = { pName: pName };

				_get(Session.prototype.__proto__ || Object.getPrototypeOf(Session.prototype), 'on', this).call(this, event, listener);
			} else {
				_get(Session.prototype.__proto__ || Object.getPrototypeOf(Session.prototype), 'on', this).call(this, event, pName);
			}
		}
	}, {
		key: 'request',
		value: function () {
			var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(path, name, data) {
				var _this2 = this;

				return _regenerator2.default.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								return _context.abrupt('return', new Promise(function (resolve, reject) {
									if (_this2.socket && _this2.connected) {
										var result = name.match(/(.*?)Req$/i);
										var reqName = name + (result ? '' : 'Req');
										var bytes = (0, _protocol.pack)(path, reqName, data, ++seq);
										_this2.callbackHandlerMap[seq] = { name: result ? result[1] : name, resolve: resolve, reject: reject };
										_this2.socket.send(bytes);
									} else {
										reject();
									}
								}));

							case 1:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, this);
			}));

			function request(_x2, _x3, _x4) {
				return _ref.apply(this, arguments);
			}

			return request;
		}()
	}]);

	return Session;
}(_events2.default);