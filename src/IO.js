const SERVER_ADDR = "https://chat.see5.net/";
const LISTEN_ADDR = "/api/socket.io/"

import {io} from "socket.io-client";
import {SpadTemplate} from "./template.js";

export default class IO {
    static socket = null
    static status
    static createdTemplate = false;
    static firstMessage = false;

    static connectIO() {
        const location = window.location.host == "localhost:5000" ? "newsvit.ir" : window.location.hostname ;
        this.socket = io( SERVER_ADDR  , {
            path: LISTEN_ADDR ,
            query: {
                domain: location,
                clientId: this.getClientId(),
            }
        });
        IO.socketListener();
    }

    static getClientId() {
        let clientId = localStorage.getItem("clientId");
        if (!clientId) {
            localStorage.setItem("clientId", "new");
            clientId = "new";
        }
        return clientId;
    }

    static socketListener() {

        this.socket.on("connect", () => {
            this.status = true;
        });

        this.socket.on("reconnect" , ()=>{
           this.status = true;
        });

        this.socket.on("disconnect" , () => {
          this.status = false;
        });

        this.socket.on("newClientId", (data) => {
            localStorage.setItem("clientId", data.clientId);
        })

        this.socket.on("deleteClientId", () => {
            localStorage.removeItem("clientId");
        })

        this.socket.on("newMessage", (data) => {
            let isSelf = data.sender === localStorage.getItem("clientId");
            SpadTemplate.replaceMessage(data.messageLocalId, data.messageId, data.message, isSelf);
            SpadTemplate.addToHistory(data);
            if(this.firstMessage){
                SpadTemplate.operatorDetection( "https://files.see5.net/support/default/operatorAvatar.jpeg", SpadTemplate.basicData.title);
                this.firstMessage = false;
            }
            SpadTemplate.setOffsetOnOperatorMessage();
           
        })

        this.socket.on("connect_error" , ()=>{

        })
        this.socket.on("widgetSetting" , (data) =>{
            console.log(data);
            SpadTemplate.basicData = data.widgetSetting;

            if(SpadTemplate.basicData.startForm.status){
                SpadTemplate.allowToChat = false;
            }
            if(IO.createdTemplate == false){
                SpadTemplate.createChat().then(()=> {
                    IO.createdTemplate = true;
                }).then(()=>{
                    IO.syncData();
                    SpadTemplate.setOffsetToLastMessage();
                });
            }
         });
    }

    static sendMessage(data) {
        this.socket.emit("newMessage", data);
    }
    static syncData(){
        this.socket.emit("customSyncData", 'data');
    }
    static sendMetaData(data) {
        this.socket.emit("newMetaData", data);
    }
    static sendFormData(data){
        this.socket.emit("newFormData" , data);
    }
}

