# teleport-js

js client library for [henrylee2cn/teleport](https://github.com/henrylee2cn/teleport)  
codec: 'p' (protobuf)

# Install
```
	npm i -S teleport-js
```

# Usage
```javascript
import {dail, addProtoSource} from 'teleport-js'

await addProtoSource('lobby', lobbyProto);

let session = dial('ws://127.0.0.1:9090')
session.on(events.CONNECT, async () => {
	let response = await session.request('/auth/authorize', 'lobby.Verify', {token: 'abcdefg'})
		.catch(e => {
			console.log(e);
		});
	if (response) {
		this.user = DataCenter.user = response.userInfo;
	}
});
```