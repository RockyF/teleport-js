/**
 * Created by rockyl on 2018/2/28.
 */

import {pack, unpackHeader, unpackBody} from './protocol'
import EventEmitter from 'events'

let seq = 0;

export const events = {
	CONNECT: 'connect',
	CLOSE: 'close',
};

class Session extends EventEmitter {
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

	_onMessage(event) {
		this.connected = true;

		let {
			uri,
			meta,
			pType,
			seq,
			bodyBytes,
		} = unpackHeader(event.data);

		let data;
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
					data = unpackBody(bodyBytes, repName);
					resolve(data);
				}
				break;
			case 3: //push
				let router = this.routerMap[uri];
				if (router) {
					data = unpackBody(bodyBytes, router.pName);
					this.emit(uri, data);
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

export default function dial(url) {
	let session = new Session();
	session.connect(url);
	return session;
}
