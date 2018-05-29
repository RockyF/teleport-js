(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.teleportjs = factory());
}(this, (function () { 'use strict';

	/**
	 * Created by rockyl on 2018/2/21.
	 */

	//import protobuf from "protobufjs"

	var protoCache = {};
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
		protoRootMap[namespace] = protobuf.parse(content).root;

		return Promise.resolve();
	}

	function addProtoFilePath(namespace, filePath) {
		return protobuf.load(filePath).then(function (root) {
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

	var strictUriEncode = function strictUriEncode(str) {
	  return encodeURIComponent(str).replace(/[!'()*]/g, function (x) {
	    return '%' + x.charCodeAt(0).toString(16).toUpperCase();
	  });
	};

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	var get = function get(object, property, receiver) {
	  if (object === null) object = Function.prototype;
	  var desc = Object.getOwnPropertyDescriptor(object, property);

	  if (desc === undefined) {
	    var parent = Object.getPrototypeOf(object);

	    if (parent === null) {
	      return undefined;
	    } else {
	      return get(parent, property, receiver);
	    }
	  } else if ("value" in desc) {
	    return desc.value;
	  } else {
	    var getter = desc.get;

	    if (getter === undefined) {
	      return undefined;
	    }

	    return getter.call(receiver);
	  }
	};

	var inherits = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};

	var possibleConstructorReturn = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && (typeof call === "object" || typeof call === "function") ? call : self;
	};

	var slicedToArray = function () {
	  function sliceIterator(arr, i) {
	    var _arr = [];
	    var _n = true;
	    var _d = false;
	    var _e = undefined;

	    try {
	      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
	        _arr.push(_s.value);

	        if (i && _arr.length === i) break;
	      }
	    } catch (err) {
	      _d = true;
	      _e = err;
	    } finally {
	      try {
	        if (!_n && _i["return"]) _i["return"]();
	      } finally {
	        if (_d) throw _e;
	      }
	    }

	    return _arr;
	  }

	  return function (arr, i) {
	    if (Array.isArray(arr)) {
	      return arr;
	    } else if (Symbol.iterator in Object(arr)) {
	      return sliceIterator(arr, i);
	    } else {
	      throw new TypeError("Invalid attempt to destructure non-iterable instance");
	    }
	  };
	}();

	var token = '%[a-f0-9]{2}';
	var singleMatcher = new RegExp(token, 'gi');
	var multiMatcher = new RegExp('(' + token + ')+', 'gi');

	function decodeComponents(components, split) {
		try {
			// Try to decode the entire string first
			return decodeURIComponent(components.join(''));
		} catch (err) {
			// Do nothing
		}

		if (components.length === 1) {
			return components;
		}

		split = split || 1;

		// Split the array in 2 parts
		var left = components.slice(0, split);
		var right = components.slice(split);

		return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
	}

	function decode(input) {
		try {
			return decodeURIComponent(input);
		} catch (err) {
			var tokens = input.match(singleMatcher);

			for (var i = 1; i < tokens.length; i++) {
				input = decodeComponents(tokens, i).join('');

				tokens = input.match(singleMatcher);
			}

			return input;
		}
	}

	function customDecodeURIComponent(input) {
		// Keep track of all the replacements and prefill the map with the `BOM`
		var replaceMap = {
			'%FE%FF': '\uFFFD\uFFFD',
			'%FF%FE': '\uFFFD\uFFFD'
		};

		var match = multiMatcher.exec(input);
		while (match) {
			try {
				// Decode as big chunks as possible
				replaceMap[match[0]] = decodeURIComponent(match[0]);
			} catch (err) {
				var result = decode(match[0]);

				if (result !== match[0]) {
					replaceMap[match[0]] = result;
				}
			}

			match = multiMatcher.exec(input);
		}

		// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
		replaceMap['%C2'] = '\uFFFD';

		var entries = Object.keys(replaceMap);

		for (var i = 0; i < entries.length; i++) {
			// Replace all decoded components
			var key = entries[i];
			input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
		}

		return input;
	}

	var decodeUriComponent = function decodeUriComponent(encodedURI) {
		if (typeof encodedURI !== 'string') {
			throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + (typeof encodedURI === 'undefined' ? 'undefined' : _typeof(encodedURI)) + '`');
		}

		try {
			encodedURI = encodedURI.replace(/\+/g, ' ');

			// Try the built in decoder first
			return decodeURIComponent(encodedURI);
		} catch (err) {
			// Fallback to a more advanced decoder
			return customDecodeURIComponent(encodedURI);
		}
	};

	function encoderForArrayFormat(options) {
		switch (options.arrayFormat) {
			case 'index':
				return function (key, value, index) {
					return value === null ? [encode(key, options), '[', index, ']'].join('') : [encode(key, options), '[', encode(index, options), ']=', encode(value, options)].join('');
				};
			case 'bracket':
				return function (key, value) {
					return value === null ? [encode(key, options), '[]'].join('') : [encode(key, options), '[]=', encode(value, options)].join('');
				};
			default:
				return function (key, value) {
					return value === null ? encode(key, options) : [encode(key, options), '=', encode(value, options)].join('');
				};
		}
	}

	function parserForArrayFormat(options) {
		var result = void 0;

		switch (options.arrayFormat) {
			case 'index':
				return function (key, value, accumulator) {
					result = /\[(\d*)\]$/.exec(key);

					key = key.replace(/\[\d*\]$/, '');

					if (!result) {
						accumulator[key] = value;
						return;
					}

					if (accumulator[key] === undefined) {
						accumulator[key] = {};
					}

					accumulator[key][result[1]] = value;
				};
			case 'bracket':
				return function (key, value, accumulator) {
					result = /(\[\])$/.exec(key);
					key = key.replace(/\[\]$/, '');

					if (!result) {
						accumulator[key] = value;
						return;
					}

					if (accumulator[key] === undefined) {
						accumulator[key] = [value];
						return;
					}

					accumulator[key] = [].concat(accumulator[key], value);
				};
			default:
				return function (key, value, accumulator) {
					if (accumulator[key] === undefined) {
						accumulator[key] = value;
						return;
					}

					accumulator[key] = [].concat(accumulator[key], value);
				};
		}
	}

	function encode(value, options) {
		if (options.encode) {
			return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
		}

		return value;
	}

	function decode$1(value, options) {
		if (options.decode) {
			return decodeUriComponent(value);
		}

		return value;
	}

	function keysSorter(input) {
		if (Array.isArray(input)) {
			return input.sort();
		}

		if ((typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object') {
			return keysSorter(Object.keys(input)).sort(function (a, b) {
				return Number(a) - Number(b);
			}).map(function (key) {
				return input[key];
			});
		}

		return input;
	}

	function extract(input) {
		var queryStart = input.indexOf('?');
		if (queryStart === -1) {
			return '';
		}
		return input.slice(queryStart + 1);
	}

	function parse(input, options) {
		options = Object.assign({ decode: true, arrayFormat: 'none' }, options);

		var formatter = parserForArrayFormat(options);

		// Create an object with no prototype
		var ret = Object.create(null);

		if (typeof input !== 'string') {
			return ret;
		}

		input = input.trim().replace(/^[?#&]/, '');

		if (!input) {
			return ret;
		}

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = input.split('&')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var param = _step.value;

				var _param$replace$split = param.replace(/\+/g, ' ').split('='),
				    _param$replace$split2 = slicedToArray(_param$replace$split, 2),
				    key = _param$replace$split2[0],
				    value = _param$replace$split2[1];

				// Missing `=` should be `null`:
				// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters


				value = value === undefined ? null : decode$1(value, options);

				formatter(decode$1(key, options), value, ret);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return Object.keys(ret).sort().reduce(function (result, key) {
			var value = ret[key];
			if (Boolean(value) && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && !Array.isArray(value)) {
				// Sort object keys, not values
				result[key] = keysSorter(value);
			} else {
				result[key] = value;
			}

			return result;
		}, Object.create(null));
	}

	var extract_1 = extract;
	var parse_1 = parse;

	var stringify = function stringify(obj, options) {
		var defaults$$1 = {
			encode: true,
			strict: true,
			arrayFormat: 'none'
		};

		options = Object.assign(defaults$$1, options);

		if (options.sort === false) {
			options.sort = function () {};
		}

		var formatter = encoderForArrayFormat(options);

		return obj ? Object.keys(obj).sort(options.sort).map(function (key) {
			var value = obj[key];

			if (value === undefined) {
				return '';
			}

			if (value === null) {
				return encode(key, options);
			}

			if (Array.isArray(value)) {
				var result = [];

				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = value.slice()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var value2 = _step2.value;

						if (value2 === undefined) {
							continue;
						}

						result.push(formatter(key, value2, result.length));
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				return result.join('&');
			}

			return encode(key, options) + '=' + encode(value, options);
		}).filter(function (x) {
			return x.length > 0;
		}).join('&') : '';
	};

	var parseUrl = function parseUrl(input, options) {
		return {
			url: input.split('?')[0] || '',
			query: parse(extract(input), options)
		};
	};

	var queryString = {
		extract: extract_1,
		parse: parse_1,
		stringify: stringify,
		parseUrl: parseUrl
	};

	/**
	 * Created by rockyl on 2018/2/28.
	 */
	//import ByteBuffer from 'bytebuffer'
	var ByteBuffer = dcodeIO.ByteBuffer;

	function pack(url, name, data, seq) {
		var buffer = new ByteBuffer();
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
		buffer.append(marshal(name, data));
		buffer.writeUint32(buffer.limit = buffer.offset, 0);

		buffer.offset = 0;

		return buffer.toArrayBuffer();
	}

	function unpackHeader(bytes) {
		var buffer = ByteBuffer.wrap(bytes);

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

		var uri = queryString.parseUrl(url);

		return {
			uri: uri,
			meta: meta,
			pType: pType,
			seq: seq,
			bodyBytes: bodyBytes
		};
	}

	function unpackBody(bytes, name) {
		return unmarshal(name, bytes);
	}

	var domain;

	// This constructor is used to store event handlers. Instantiating this is
	// faster than explicitly calling `Object.create(null)` to get a "clean" empty
	// object (tested with v8 v4.9).
	function EventHandlers() {}
	EventHandlers.prototype = Object.create(null);

	function EventEmitter() {
	  EventEmitter.init.call(this);
	}

	// nodejs oddity
	// require('events') === require('events').EventEmitter
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.usingDomains = false;

	EventEmitter.prototype.domain = undefined;
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	EventEmitter.init = function () {
	  this.domain = null;
	  if (EventEmitter.usingDomains) {
	    // if there is an active domain, then attach to it.
	    if (domain.active && !(this instanceof domain.Domain)) {
	      this.domain = domain.active;
	    }
	  }

	  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
	    this._events = new EventHandlers();
	    this._eventsCount = 0;
	  }

	  this._maxListeners = this._maxListeners || undefined;
	};

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
	  if (typeof n !== 'number' || n < 0 || isNaN(n)) throw new TypeError('"n" argument must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	function $getMaxListeners(that) {
	  if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
	  return that._maxListeners;
	}

	EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
	  return $getMaxListeners(this);
	};

	// These standalone emit* functions are used to optimize calling of event
	// handlers for fast cases because emit() itself often has a variable number of
	// arguments and can be deoptimized because of that. These functions always have
	// the same number of arguments and thus do not get deoptimized, so the code
	// inside them can execute faster.
	function emitNone(handler, isFn, self) {
	  if (isFn) handler.call(self);else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i) {
	      listeners[i].call(self);
	    }
	  }
	}
	function emitOne(handler, isFn, self, arg1) {
	  if (isFn) handler.call(self, arg1);else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i) {
	      listeners[i].call(self, arg1);
	    }
	  }
	}
	function emitTwo(handler, isFn, self, arg1, arg2) {
	  if (isFn) handler.call(self, arg1, arg2);else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i) {
	      listeners[i].call(self, arg1, arg2);
	    }
	  }
	}
	function emitThree(handler, isFn, self, arg1, arg2, arg3) {
	  if (isFn) handler.call(self, arg1, arg2, arg3);else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i) {
	      listeners[i].call(self, arg1, arg2, arg3);
	    }
	  }
	}

	function emitMany(handler, isFn, self, args) {
	  if (isFn) handler.apply(self, args);else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i) {
	      listeners[i].apply(self, args);
	    }
	  }
	}

	EventEmitter.prototype.emit = function emit(type) {
	  var er, handler, len, args, i, events, domain;
	  var doError = type === 'error';

	  events = this._events;
	  if (events) doError = doError && events.error == null;else if (!doError) return false;

	  domain = this.domain;

	  // If there is no 'error' event listener then throw.
	  if (doError) {
	    er = arguments[1];
	    if (domain) {
	      if (!er) er = new Error('Uncaught, unspecified "error" event');
	      er.domainEmitter = this;
	      er.domain = domain;
	      er.domainThrown = false;
	      domain.emit('error', er);
	    } else if (er instanceof Error) {
	      throw er; // Unhandled 'error' event
	    } else {
	      // At least give some kind of context to the user
	      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	      err.context = er;
	      throw err;
	    }
	    return false;
	  }

	  handler = events[type];

	  if (!handler) return false;

	  var isFn = typeof handler === 'function';
	  len = arguments.length;
	  switch (len) {
	    // fast cases
	    case 1:
	      emitNone(handler, isFn, this);
	      break;
	    case 2:
	      emitOne(handler, isFn, this, arguments[1]);
	      break;
	    case 3:
	      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
	      break;
	    case 4:
	      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
	      break;
	    // slower
	    default:
	      args = new Array(len - 1);
	      for (i = 1; i < len; i++) {
	        args[i - 1] = arguments[i];
	      }emitMany(handler, isFn, this, args);
	  }

	  return true;
	};

	function _addListener(target, type, listener, prepend) {
	  var m;
	  var events;
	  var existing;

	  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');

	  events = target._events;
	  if (!events) {
	    events = target._events = new EventHandlers();
	    target._eventsCount = 0;
	  } else {
	    // To avoid recursion in the case that type === "newListener"! Before
	    // adding it to the listeners, first emit "newListener".
	    if (events.newListener) {
	      target.emit('newListener', type, listener.listener ? listener.listener : listener);

	      // Re-assign `events` because a newListener handler could have caused the
	      // this._events to be assigned to a new object
	      events = target._events;
	    }
	    existing = events[type];
	  }

	  if (!existing) {
	    // Optimize the case of one listener. Don't need the extra array object.
	    existing = events[type] = listener;
	    ++target._eventsCount;
	  } else {
	    if (typeof existing === 'function') {
	      // Adding the second element, need to change to array.
	      existing = events[type] = prepend ? [listener, existing] : [existing, listener];
	    } else {
	      // If we've already got an array, just append.
	      if (prepend) {
	        existing.unshift(listener);
	      } else {
	        existing.push(listener);
	      }
	    }

	    // Check for listener leak
	    if (!existing.warned) {
	      m = $getMaxListeners(target);
	      if (m && m > 0 && existing.length > m) {
	        existing.warned = true;
	        var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' ' + type + ' listeners added. ' + 'Use emitter.setMaxListeners() to increase limit');
	        w.name = 'MaxListenersExceededWarning';
	        w.emitter = target;
	        w.type = type;
	        w.count = existing.length;
	        emitWarning(w);
	      }
	    }
	  }

	  return target;
	}
	function emitWarning(e) {
	  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
	}
	EventEmitter.prototype.addListener = function addListener(type, listener) {
	  return _addListener(this, type, listener, false);
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.prependListener = function prependListener(type, listener) {
	  return _addListener(this, type, listener, true);
	};

	function _onceWrap(target, type, listener) {
	  var fired = false;
	  function g() {
	    target.removeListener(type, g);
	    if (!fired) {
	      fired = true;
	      listener.apply(target, arguments);
	    }
	  }
	  g.listener = listener;
	  return g;
	}

	EventEmitter.prototype.once = function once(type, listener) {
	  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
	  this.on(type, _onceWrap(this, type, listener));
	  return this;
	};

	EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
	  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
	  this.prependListener(type, _onceWrap(this, type, listener));
	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function removeListener(type, listener) {
	  var list, events, position, i, originalListener;

	  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');

	  events = this._events;
	  if (!events) return this;

	  list = events[type];
	  if (!list) return this;

	  if (list === listener || list.listener && list.listener === listener) {
	    if (--this._eventsCount === 0) this._events = new EventHandlers();else {
	      delete events[type];
	      if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
	    }
	  } else if (typeof list !== 'function') {
	    position = -1;

	    for (i = list.length; i-- > 0;) {
	      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
	        originalListener = list[i].listener;
	        position = i;
	        break;
	      }
	    }

	    if (position < 0) return this;

	    if (list.length === 1) {
	      list[0] = undefined;
	      if (--this._eventsCount === 0) {
	        this._events = new EventHandlers();
	        return this;
	      } else {
	        delete events[type];
	      }
	    } else {
	      spliceOne(list, position);
	    }

	    if (events.removeListener) this.emit('removeListener', type, originalListener || listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
	  var listeners, events;

	  events = this._events;
	  if (!events) return this;

	  // not listening for removeListener, no need to emit
	  if (!events.removeListener) {
	    if (arguments.length === 0) {
	      this._events = new EventHandlers();
	      this._eventsCount = 0;
	    } else if (events[type]) {
	      if (--this._eventsCount === 0) this._events = new EventHandlers();else delete events[type];
	    }
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    var keys = Object.keys(events);
	    for (var i = 0, key; i < keys.length; ++i) {
	      key = keys[i];
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = new EventHandlers();
	    this._eventsCount = 0;
	    return this;
	  }

	  listeners = events[type];

	  if (typeof listeners === 'function') {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    do {
	      this.removeListener(type, listeners[listeners.length - 1]);
	    } while (listeners[0]);
	  }

	  return this;
	};

	EventEmitter.prototype.listeners = function listeners(type) {
	  var evlistener;
	  var ret;
	  var events = this._events;

	  if (!events) ret = [];else {
	    evlistener = events[type];
	    if (!evlistener) ret = [];else if (typeof evlistener === 'function') ret = [evlistener.listener || evlistener];else ret = unwrapListeners(evlistener);
	  }

	  return ret;
	};

	EventEmitter.listenerCount = function (emitter, type) {
	  if (typeof emitter.listenerCount === 'function') {
	    return emitter.listenerCount(type);
	  } else {
	    return listenerCount.call(emitter, type);
	  }
	};

	EventEmitter.prototype.listenerCount = listenerCount;
	function listenerCount(type) {
	  var events = this._events;

	  if (events) {
	    var evlistener = events[type];

	    if (typeof evlistener === 'function') {
	      return 1;
	    } else if (evlistener) {
	      return evlistener.length;
	    }
	  }

	  return 0;
	}

	EventEmitter.prototype.eventNames = function eventNames() {
	  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
	};

	// About 1.5x faster than the two-arg version of Array#splice().
	function spliceOne(list, index) {
	  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
	    list[i] = list[k];
	  }list.pop();
	}

	function arrayClone(arr, i) {
	  var copy = new Array(i);
	  while (i--) {
	    copy[i] = arr[i];
	  }return copy;
	}

	function unwrapListeners(arr) {
	  var ret = new Array(arr.length);
	  for (var i = 0; i < ret.length; ++i) {
	    ret[i] = arr[i].listener || arr[i];
	  }
	  return ret;
	}

	/**
	 * Created by rockyl on 2018/2/28.
	 */

	var seq = 0;

	var events = {
		CONNECT: 'connect',
		CLOSE: 'close',
		ERROR: 'error'
	};

	var Session = function (_EventEmitter) {
		inherits(Session, _EventEmitter);

		function Session() {
			classCallCheck(this, Session);

			var _this = possibleConstructorReturn(this, (Session.__proto__ || Object.getPrototypeOf(Session)).call(this));

			_this.callbackHandlerMap = {};
			_this.routerMap = {};
			_this.connected = false;
			return _this;
		}

		createClass(Session, [{
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

				var _unpackHeader = unpackHeader(event.data),
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
							body = unpackBody(bodyBytes, repName);
							resolve(body);
						}
						break;
					case 3:
						//push
						var router = this.routerMap[uri.url];
						if (router) {
							body = unpackBody(bodyBytes, router.pName);
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

					get(Session.prototype.__proto__ || Object.getPrototypeOf(Session.prototype), 'on', this).call(this, event, listener);
				} else {
					get(Session.prototype.__proto__ || Object.getPrototypeOf(Session.prototype), 'on', this).call(this, event, pName);
				}
			}
		}, {
			key: 'request',
			value: async function request(path, name, data) {
				var _this2 = this;

				return new Promise(function (resolve, reject) {
					if (_this2.socket && _this2.connected) {
						var result = name.match(/(.*?)Req$/i);
						var reqName = name + (result ? '' : 'Req');
						var bytes = pack(path, reqName, data, ++seq);
						_this2.callbackHandlerMap[seq] = { name: result ? result[1] : name, resolve: resolve, reject: reject };
						_this2.socket.send(bytes);
					} else {
						reject();
					}
				});
			}
		}]);
		return Session;
	}(EventEmitter);

	/**
	 * Created by rocky.l on 2018/3/27.
	 */

	var index = {
		dial: function dial(url) {
			var session = new Session();
			session.connect(url);
			return session;
		},
		events: events,
		addProtoSource: addProtoSource,
		addProtoFilePath: addProtoFilePath,
		getAllTypes: getAllTypes
	};

	return index;

})));
