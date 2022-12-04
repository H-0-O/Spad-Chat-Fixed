import IO from './IO.js';
import {SpadTemplate} from "./template";
IO.connectIO();

// var test = "dpfkdpo";
global.isConnected = ()=>{
	return IO.status;
}

global.sendCMessage = (message)=> {
	if (IO.createdTemplate) {
		SpadTemplate.showChatBox();
		SpadTemplate.sendMessage(message);
	}else
		return false;
}

global.sendCMeta = (data) => {
	IO.sendMetaData(data);
}