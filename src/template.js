import messageTemplate from './Templates/message.html';
import Template from './Templates/ChatTemplate.html';
import Emojis from './Templates/CreatedEmojis.html';
import * as emojiApi from 'emoji-api';
import css from './Templates/client_style.css';

import IO from './IO.js';
import { io } from 'socket.io-client';
// "47be97553d55820186070823d3d02cb27415961f"
const minues = "https://files.see5.net/"
const operatorUrl = "https://files.see5.net/support/default/operatorAvatar.jpeg";

export class SpadTemplate {
    static basicData;
    static async createChat() {
        this.info =
            {
                operators: [
                    {
                        name: "THE NAME ONE ",
                        url: "https://files.see5.net/support/default/operatorAvatar.jpeg",
                    }, {
                        name: "THE NAME ONE ",
                        url: "https://files.see5.net/support/default/operatorAvatar.jpeg",
                    }
                ],

            };

        this.adjustForInsertToBody(Template, "#spadChat").then( () =>{
            this.setMessageTemplate().then( () => {
                this.setBasicStyle();
                this.insertHistoryChatToTemplate();
                this.createEmojis();
                this.startListeningForNewMessage();
                IO.syncData();
            });


        });

    }

    static setBasicStyle(){
        document.getElementById("spadChat").style.bottom = this.basicData.position.marginBottom + "px";
        if(this.basicData.position.x === "right")
            document.getElementById("spadChat").style.right = this.basicData.position.marginStart + "px";
        else
            document.getElementById("spadChat").style.left = this.basicData.position.marginStart + "px";
        
        document.querySelector("#chat_icon img").src = minues + (SpadTemplate.basicData.icon || "support/default/widgetIcon.png");

    }
    static async setMessageTemplate() {
        this.messageTemplate = messageTemplate;
    }

    static async adjustForInsertToBody(html, selector) {
        const dom = new DOMParser().parseFromString(html, "text/html");
        dom.getElementById("chat_logos").innerHTML = this.generateLogos();
        dom.getElementById("chat_logos").style.width = this.info.operators.length * 42;
        dom.getElementById("chat_title").firstElementChild.textContent = SpadTemplate.basicData.title;
        dom.getElementById("chat_title").lastElementChild.textContent = SpadTemplate.basicData.titleDescription;
        document.body.append(dom.querySelector(selector));

    }

    static  generateLogos() {
        let html = "";
        this.info.operators.forEach((operator, index) => {
            html += this.generateLogo(operator.url, operator.name, index * 40, this.info.operators.length - index);
        });

        return html;
    }

    static generateLogo(logo_url, logo_alt, right, z_index) {
        return `<span class="chat_logo" style="right: ${right}px ; z-index: ${z_index}">
        <img src="${logo_url}" alt="${logo_alt}">
        </span>`;
    }

    static insertHistoryChatToTemplate() {
        let history = this.getHistory();
        console.log("🚀 ~ file: template.js:85 ~ SpadTemplate ~ insertHistoryChatToTemplate ~ history", history)
        const clientId = IO.getClientId();
        if (!history){
            IO.firstMessage = true;
            return;
        }
    
        SpadTemplate.operatorDetection(operatorUrl , SpadTemplate.basicData.title);
        history = JSON.parse(history);
        history.forEach(message => {
            this.generateMessage(message.messageId, message.message, message.sender === clientId);
        });
    }

    static generateMessage(messageId, messageText, isSelf , status = "success") {
        const dom = new DOMParser().parseFromString( this.messageTemplate , "text/html");
        const message = dom.getElementsByClassName("message")[0];
        if (isSelf) {
            message.classList.add("right");
            message.setAttribute("id", messageId);
            message.getElementsByClassName("message_img")[0].remove();
        } else {
            message.setAttribute("id", messageId);
            this.checkPreviousMessageIsLeft();
            message.getElementsByClassName("message_img")[0].src = this.info.operators[0].url;
            message.classList.add("left");
        }
        message.getElementsByClassName("message_text")[0].textContent = messageText;
        document.getElementById("chat_body").append(message);
    }

    static checkPreviousMessageIsLeft(){
        const lastChild = document.getElementById("chat_body").lastElementChild;
        if(lastChild !== null && lastChild.classList.contains("left"))
            lastChild.getElementsByClassName("message_img")[0].remove();
    }

    static getHistory() {
        return localStorage.getItem("chatHistory");
    }

    static addToHistory(newMessage = {}) {
        let history = this.getHistory();
        if (!history)
            history = [];
        else
            history = JSON.parse(history);
        history.push(newMessage);
        localStorage.setItem("chatHistory", JSON.stringify(history));
    }

    // شروع به لیسن کرن برای پیام جدید می کند
    static startListeningForNewMessage() {

        // المنت های گلوبال
        this.messageInputText = document.getElementById("messageInputText");
        this.messageSendIcon = document.getElementById("send_icon");
        this.chatIcon = document.getElementById("chat_icon");
        this.chatBox = document.getElementById("chat_container");
        this.closeBtn = document.getElementById("close_chat");
        this.chatBody = document.getElementById("chat_body");
        this.openEmojiIcon = document.getElementById("emojiIcon");
        this.emojies =  document.querySelectorAll("#otherEmojis > div");

        // ارسال پیام
        this.messageInputText.addEventListener("keydown", (key) => {
            if (key.key === "Enter") {
                key.preventDefault();
                this.sendMessage();
            }
        });
        // ارسال با ایکون
        this.messageSendIcon.addEventListener("click", () => {
            this.sendMessage();
        });
        // نشون دادن جت باکس
        this.chatIcon.addEventListener("click", this.showChatBox);
        this.closeBtn.addEventListener("click", this.hideChatBox);
        // اضافه کردن ارتفاع باکس پیام
        this.messageInputText.addEventListener("input", (key) => {
            this.messageInputText.style.height = "32px";
            this.messageInputText.style.height = (this.messageInputText.scrollHeight) + "px";
            if(this.messageInputText.value.length === 0){
                this.clearMessageInput();
            }
        })

        this.handleEmojiActions();

    }

    static handleEmojiActions(){
        // باز شدن پنل ایموجی ها
        this.openEmojiIcon.addEventListener("click" , ()=>{
            document.getElementById("otherEmojis").classList.toggle("openedEmojisBox")
            this.openEmojiIcon.classList.toggle("iconFilter");
        })
        // لیستن کردن ایموجی ها
        this.emojies.forEach(function(value){
           value.addEventListener("click" , SpadTemplate.insertEmojiToInput);
        });

    }


    // جایگزین ایدی موقت با یادی داخل دیتا بیس
    static replaceMessage(messageLocalId, messageNewId, message, isSelf) {
        if (isSelf)
            document.getElementById(messageLocalId).remove();
        SpadTemplate.generateMessage(messageNewId, message, isSelf);
    }

    // متد ارسال پیام با کلید
    static sendMessage(message = null) {
        const localId = SpadTemplate.generateLocalId();
        if(message === null)
            message = this.messageInputText.value;
        if(message.trim().length === 0 ) {
            SpadTemplate.clearMessageInput();
            return;
        }
        if(IO.status) {
            SpadTemplate.generateMessage(localId, message, true);
            SpadTemplate.clearMessageInput();
            IO.sendMessage({
                message,
                localId
            });
            if(IO.firstMessage){
                this.operatorDetection(operatorUrl , SpadTemplate.basicData.title);
                firstMessage = false;
            }
        } else {
            // SpadTemplate.generateFiledMessage(localId , message , true);
        }
        SpadTemplate.setOffsetToLastMessage();
    }

    // متد خالی کردن باکس ورودی
    static clearMessageInput() {
        SpadTemplate.messageInputText.value = '';
        SpadTemplate.messageInputText.style.height = '32px';
    }

    // متد ساخت ایدی موقت
    static generateLocalId() {
        let result = '';
        let time = new Date().getTime().toString();
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let charactersLength = characters.length;
        for (let i = 0; i < 13; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            result += time.substring(i + 1, i);
        }
        return result;
    }

    static showChatBox() {
        document.querySelector("#chat_container").style.display = 'flex';
        SpadTemplate.chatIcon.classList.remove("show_icon");
        setTimeout(() => SpadTemplate.chatBox.classList.add("chat_box_show"), 300)
        SpadTemplate.setOffsetToLastMessage();
    }

    static hideChatBox() {
        SpadTemplate.chatBox.classList.remove("chat_box_show")
        setTimeout(() => {
            SpadTemplate.chatIcon.classList.add("show_icon");
            document.querySelector("#chat_container").style.display = 'none';
    }, 300)
    }

    static setOffsetToLastMessage(){
        const lsChild = SpadTemplate.chatBody.lastChild;
        SpadTemplate.chatBody.scroll({
            top: lsChild.offsetTop + 30,
            behavior: "smooth"
        });

    }

    static operatorDetection(url , title) {
        let html = `<div id='operator'>
                <img class="op_logo" src="${url}" >
                <div class="title-name">${title}</div>
        </div>`;
        document.getElementById("chat_logos_container").remove();
        document.getElementById("chat_title").remove();
        document.getElementById("header_chat_box").style.height = "150px";
        document.getElementById("header_chat_box").append(new DOMParser().parseFromString(html , "text/html").querySelector("#operator"));
    }
    static generateTooltip(text) {
        let html = `<span class="spToolTip"> 
                        <span class="spToolTipText">${text}</span>
                    </span>`;
        return new DOMParser().parseFromString(html , "text/html").querySelector(".spToolTip")[0];
    }
    // ساختن ایموجی باکس
    static createEmojis(){
        document.getElementById("chat_footer").append(new DOMParser().parseFromString(Emojis , "text/html").querySelector("#under_footer"));
    }

    static insertEmojiToInput(event){
        // const cloneNode
        const clone = this.cloneNode(true);
        let emj = emojiApi.unicodeToEmoji(this.getAttribute("data-emj-code"));
        SpadTemplate.messageInputText.value += emj;
    }

}