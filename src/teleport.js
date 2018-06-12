/**
 * Created by rockyl on 2018/2/28.
 */

import {pack, unpackHeader, unpackBody} from './protocol'
import {EventEmitter2} from 'eventemitter2'

let seq = 0;

export const events = {
	CONNECT: 'connect',
	CLOSE: 'close',
	ERROR: 'error',
};

export class Session extends EventEmitter2 {
	constructor() {
		super();

		this.callbackHandlerMap = {};
		this.routerMap = {};
		this.connected = false;
	}

	_onConnect(event) {
		this.connected = true;

		this.emit(events.CONNECT);
	};

	_onClose(event) {
		this.connected = false;

		this.emit(events.CLOSE);
	};

	_onError(event) {
		this.connected = false;

		this.emit(events.ERROR);
	};

	_onMessage(event) {
		this.connected = true;

		let {
			uri,
			meta,
			pType,
			seq,
			bodyBytes,
		} = unpackHeader(event.data);

		let body;
		switch (pType) {
			case 0: //default

				break;
			case 1: //pull

				break;
			case 2: //reply
				let {name, resolve, reject} = this.callbackHandlerMap[seq];
				delete this.callbackHandlerMap[seq];
				let error = meta['X-Reply-Error'];
				if (error) {
					reject(error)
				} else {
					let repName = name + 'Rep';
					body = unpackBody(bodyBytes, repName);
					resolve(body);
				}
				break;
			case 3: //push
				let router = this.routerMap[uri.url];
				if (router) {
					body = unpackBody(bodyBytes, router.pName);
					this.emit(uri.url, {body, uri});
				}
				break;
		}
	};

	connect(url) {
		let socket = this.socket = new WebSocket(url);
		socket.binaryType = 'arraybuffer';

		socket.onopen = this._onConnect.bind(this);
		socket.onmessage = this._onMessage.bind(this);
		socket.onclose = this._onClose.bind(this);
		socket.onerror = this._onError.bind(this);
	}

	on(event, pName, listener = null) {
		if (typeof pName === 'string') {
			this.routerMap[event] = {pName};

			super.on(event, listener);
		} else {
			super.on(event, pName);
		}
	}

	async request(path, name, data) {
		return new Promise(((resolve, reject) => {
			if (this.socket && this.connected) {
				let result = name.match(/(.*?)Req$/i);
				let reqName = name + (result ? '' : 'Req');
				let bytes = pack(path, reqName, data, ++seq);
				this.callbackHandlerMap[seq] = {name: result ? result[1] : name, resolve, reject};
				this.socket.send(bytes);
			} else {
				reject();
			}
		}));
	}
}
