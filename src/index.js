/**
 * Created by rocky.l on 2018/3/27.
 */

import {addProtoFilePath, addProtoSource, getAllTypes} from "./protobuf";
import {Session, events} from './teleport'

export default {
	dial: function dial(url) {
		let session = new Session();
		session.connect(url);
		return session;
	},
	events,
	addProtoSource,
	addProtoFilePath,
	getAllTypes,
}
