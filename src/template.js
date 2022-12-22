import messageTemplate from "./Templates/message.html";
import Template from "./Templates/ChatTemplate.html";
import Emojis from "./Templates/CreatedEmojis.html";
import * as emojiApi from "emoji-api";
import css from "./Templates/client_style.css";

import IO from "./IO.js";
import { io } from "socket.io-client";
// "47be97553d55820186070823d3d02cb27415961f"
const minues = "https://files.see5.net/";
const operatorUrl =
  "https://files.see5.net/support/default/operatorAvatar.jpeg";

export class SpadTemplate {
  static basicData;
  static async createChat() {
    this.info = {
      operators: [
        {
          name: "THE NAME ONE ",
          url: "https://files.see5.net/support/default/operatorAvatar.jpeg",
        },
        {
          name: "THE NAME ONE ",
          url: "https://files.see5.net/support/default/operatorAvatar.jpeg",
        },
      ],
    };

    this.adjustForInsertToBody(Template, "#spadChat").then(() => {
      this.setMessageTemplate().then(async () => {
        this.setBasicStyle();
        this.insertHistoryChatToTemplate();
        this.createEmojis();
        await this.startListeningForNewMessage();
        this.createForm();
      });
    });
  }

  static setBasicStyle() {
    document.getElementById("spadChat").style.bottom =
      this.basicData.position.marginBottom + "px";
    if (this.basicData.position.x === "right")
      document.getElementById("spadChat").style.right =
        this.basicData.position.marginStart + "px";
    else
      document.getElementById("spadChat").style.left =
        this.basicData.position.marginStart + "px";

    document.querySelector("#chat_icon img").src =
      minues +
      (SpadTemplate.basicData.icon || "support/default/widgetIcon.png");
  }
  static async setMessageTemplate() {
    this.messageTemplate = messageTemplate;
  }

  static async adjustForInsertToBody(html, selector) {
    const dom = new DOMParser().parseFromString(html, "text/html");
    dom.getElementById("chat_logos").innerHTML = this.generateLogos();
    dom.getElementById("chat_logos").style.width =
      this.info.operators.length * 42;
    dom.getElementById("chat_title").firstElementChild.textContent =
      SpadTemplate.basicData.title;
    dom.getElementById("chat_title").lastElementChild.textContent =
      SpadTemplate.basicData.titleDescription;
    document.body.append(dom.querySelector(selector));
  }

  static generateLogos() {
    let html = "";
    this.info.operators.forEach((operator, index) => {
      html += this.generateLogo(
        operator.url,
        operator.name,
        index * 40,
        this.info.operators.length - index
      );
    });

    return html;
  }

  static generateLogo(logo_url, logo_alt, right, z_index) {
    return `<span class="chat_logo" style="right: ${right}px ; z-index: ${z_index}">
        <img src="${logo_url}" alt="${logo_alt}">
        </span>`;
  }

  static async insertHistoryChatToTemplate() {
    let history = this.getHistory();
    const clientId = IO.getClientId();
    if (!history) {
      IO.firstMessage = true;
      return;
    }
    SpadTemplate.operatorDetection(operatorUrl, SpadTemplate.basicData.title);
    history = JSON.parse(history);
    history.forEach((message, index) => {
      this.generateMessage(
        message.messageId,
        message.message,
        message.sender === clientId
      );
    });
  }

  static generateMessage(messageId, messageText, isSelf, status = "success") {
    const dom = new DOMParser().parseFromString(
      this.messageTemplate,
      "text/html"
    );
    const message = dom.getElementsByClassName("message")[0];
    if (isSelf) {
      message.classList.add("right");
      message.setAttribute("id", messageId);
      message.getElementsByClassName("message_img")[0].remove();
    } else {
      message.setAttribute("id", messageId);
      this.checkPreviousMessageIsLeft();
      message.getElementsByClassName("message_img")[0].src =
        this.info.operators[0].url;
      message.classList.add("left");
    }
    message.getElementsByClassName("message_text")[0].textContent = messageText;
    document.getElementById("chat_body").append(message);
  }

  static checkPreviousMessageIsLeft() {
    const lastChild = document.getElementById("chat_body").lastElementChild;
    if (lastChild !== null && lastChild.classList.contains("left"))
      lastChild.getElementsByClassName("message_img")[0].remove();
  }

  static getHistory() {
    return localStorage.getItem("chatHistory");
  }

  static addToHistory(newMessage = {}) {
    let history = this.getHistory();
    if (!history) history = [];
    else history = JSON.parse(history);
    history.push(newMessage);
    localStorage.setItem("chatHistory", JSON.stringify(history));
  }

  // شروع به لیسن کرن برای پیام جدید می کند
  static async  startListeningForNewMessage() {
    // المنت های گلوبال
    await SpadTemplate.setGlobalElements();
    
    // ارسال پیام
    this.messageInputText?.addEventListener("keydown", (key) => {
      if (key.key === "Enter") {
        key.preventDefault();
        this.sendMessage();
        this.increaseHeight();
      }
    });
    // ارسال با ایکون
    this.messageSendIcon?.addEventListener("click", () => {
      this.sendMessage();
      this.increaseHeight();
    });
    // نشون دادن جت باکس
    this.chatIcon?.addEventListener("click", this.showChatBox);
    this.closeBtn?.addEventListener("click", this.hideChatBox);
    // اضافه کردن ارتفاع باکس پیام
    this.messageInputText?.addEventListener("input", this.increaseHeight);

    this.handleEmojiActions();
  }

  static increaseHeight() {
    SpadTemplate.messageInputText.style.height = "32px";
    SpadTemplate.messageInputText.style.height =
      SpadTemplate.messageInputText.scrollHeight + "px";
    if (SpadTemplate.messageInputText.value.length > 1) {
      document?.getElementById("send_icon").classList.add("iconShow");
    } else {
      document?.getElementById("send_icon").classList.remove("iconShow");
    }
    if (SpadTemplate.messageInputText.value.length === 0) {
      SpadTemplate.clearMessageInput();
    }
  }
  static handleEmojiActions() {
    // باز شدن پنل ایموجی ها
    this.openEmojiIcon?.addEventListener("click", () => {
      document
        ?.getElementById("otherEmojis")
        .classList.toggle("openedEmojisBox");
    });
    // لیستن کردن ایموجی ها
    this.emojies.forEach(function (value) {
      value?.addEventListener("click", SpadTemplate.insertEmojiToInput);
    });
  }

  // جایگزین ایدی موقت با یادی داخل دیتا بیس
  static replaceMessage(messageLocalId, messageNewId, message, isSelf) {
    if (isSelf) document.getElementById(messageLocalId).remove();
    SpadTemplate.generateMessage(messageNewId, message, isSelf);
  }

  // متد ارسال پیام با کلید
  static sendMessage(message = null) {
    const localId = SpadTemplate.generateLocalId();
    if (message === null) message = this.messageInputText.value;
    if (message.trim().length === 0) {
      SpadTemplate.clearMessageInput();
      return;
    }
    if (IO.status) {
      SpadTemplate.generateMessage(localId, message, true);
      SpadTemplate.clearMessageInput();
      IO.sendMessage({
        message,
        localId,
      });
      if (IO.firstMessage) {
        this.operatorDetection(operatorUrl, SpadTemplate.basicData.title);
        IO.firstMessage = false;
      }
    } else {
      // SpadTemplate.generateFiledMessage(localId , message , true);
    }
    SpadTemplate.setOffsetToLastMessage();
  }

  // متد خالی کردن باکس ورودی
  static clearMessageInput() {
    SpadTemplate.messageInputText.value = "";
    SpadTemplate.messageInputText.style.height = "32px";
  }

  // متد ساخت ایدی موقت
  static generateLocalId() {
    let result = "";
    let time = new Date().getTime().toString();
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let charactersLength = characters.length;
    for (let i = 0; i < 13; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      result += time.substring(i + 1, i);
    }
    return result;
  }

  static showChatBox() {
    document.querySelector("#chat_container").style.display = "flex";
    SpadTemplate.chatIcon.classList.remove("show_icon");
    setTimeout(() => SpadTemplate.chatBox.classList.add("chat_box_show"), 300);
    SpadTemplate.setOffsetToLastMessage();
  }

  static hideChatBox() {
    SpadTemplate.chatBox.classList.remove("chat_box_show");
    setTimeout(() => {
      SpadTemplate.chatIcon.classList.add("show_icon");
      document.querySelector("#chat_container").style.display = "none";
    }, 300);
  }

  static setOffsetToLastMessage() {
    const lsChild = SpadTemplate.chatBody.lastChild;
    if (lsChild) {
      SpadTemplate.chatBody.scroll({
        top: lsChild.offsetTop + lsChild.offsetHeight + 50,
        behavior: "smooth",
      });
    }
  }

  static setOffsetOnOperatorMessage() {
    const lastChild = this.chatBody.lastChild;
    const distance =
      this.chatBody.scrollHeight -
      this.chatBody.scrollTop -
      this.chatBody.offsetHeight -
      lastChild.offsetHeight;
    if (distance < 15) {
      this.chatBody.scroll({
        top: lastChild.offsetTop + lastChild.offsetHeight,
        behavior: "smooth",
      });
    }
  }

  static async createForm(){
    if(SpadTemplate.basicData.startForm.status === true && SpadTemplate.getHistory() === null && localStorage.getItem("formSent") === null) {

      document.getElementById("send_message_box").remove();
      const form = new DOMParser().parseFromString(messageTemplate , "text/html").querySelector(".message");
      form.querySelector("img").src = this.info.operators[0].url;
      form.classList.add("left" , "formInput");
      form.id = "formInput";
      form.querySelector(".message_text").append(new DOMParser().parseFromString(`<p class="formTitle" > ${SpadTemplate.basicData.startForm.title} </p> ` , "text/html").querySelector(".formTitle") ) 
      // add inputs to message 
      await SpadTemplate.basicData.startForm.inputs.forEach( ( value , index ) => {
        // <label for = '${value._id}' > ${value.label}</label>
        const newInputBox = `
        <div class='inputBox'>
            <div class='innerInput' data-id='${value._id}' >
              <input autocomplete="off" class="effect-1" type='text' data-proFileField = '${value.profileField}' placeholder = '${value.label }' id='${value._id}' ${value.required == true ? "required" : ""}  tabIndex="${++index}"/>
              <span class="focus-border"></span>
            </div>
        </div>
        `;
        form.querySelector(".message_text").append(new DOMParser().parseFromString(newInputBox , "text/html").querySelector(".inputBox") );     
      });
      form.querySelector(".message_text").append(new DOMParser().parseFromString(`<p id="sendFormData" tabIndex="${++SpadTemplate.basicData.startForm.inputs.length}" > ارسال </p>` , "text/html").querySelector("#sendFormData") );
      form.querySelector("#sendFormData").addEventListener("click", function (e){
        e.preventDefault();
        SpadTemplate.sendFormInfo();
      });
      form.querySelectorAll("input").forEach( value =>{
        value.addEventListener("keydown" , function (key){
          if(key.key === "Enter"){
            key.preventDefault();
            SpadTemplate.sendFormInfo();
          }
        })
      })
      form.querySelectorAll("input").forEach((value , key)=>{
        value.addEventListener("input"  ,  SpadTemplate.checkFormInput);
        value.addEventListener("focus"  ,  SpadTemplate.checkFormInput);
      })
      this.chatBody.append(form);
      SpadTemplate.chatIcon.addEventListener("click", SpadTemplate.showFormInput);
    }
  }
  
  static checkFormInput(){
    if(this.value.length <= 1 && this.hasAttribute("required")){
      document.querySelector(`.innerInput[data-id='${this.id}'] .focus-border `)?.classList.add("inputError");
    }else{
      document.querySelector(`.innerInput[data-id='${this.id}'] .focus-border `)?.classList.remove("inputError");
    }
  }

  static async sendFormInfo(){
      let array = [];
      try{
          await document.querySelectorAll("#formInput .message_text .inputBox input").forEach ( (element , index)=>{
            if(element.value.length <= 1 && element.hasAttribute("required")){
              array = null;
              document.querySelector(`.innerInput[data-id='${element.id}'] .focus-border `)?.classList.add("inputError");
              document.getElementById(`${element.id}`).focus();
              throw "break"
            }
            array?.push({
              id : element.id,
              value: element.value
            });
          });
          if(array != null){
            IO.sendFormData(array);
            localStorage.setItem("formSent" , "1");
            document.getElementById("formInput").classList.remove("formInputShow");
            SpadTemplate.chatFooter.querySelector("#powered_by").before(SpadTemplate.sendMessageBox);
            setTimeout(() => { document.getElementById("formInput").remove() } , 1000);
          }
    }catch(e){

    }
  }
  
  static showFormInput(){
    document.getElementById("formInput").style.display = "block";
    setTimeout(()=> {  document.getElementById("formInput").classList.add("formInputShow")  } , 1000)
    SpadTemplate.chatIcon.removeEventListener("click" , SpadTemplate.showFormInput);
  }

  

  static operatorDetection(url, title) {
    let html = `<div id='operator'>
                <img class="op_logo" src="${url}" >
                <div class="title-name">${title}</div>
        </div>`;
    document.getElementById("chat_logos_container")?.remove();
    document.getElementById("chat_title")?.remove();
    document.getElementById("header_chat_box").style.height = "150px";
    document
      .getElementById("header_chat_box")
      .append(
        new DOMParser()
          .parseFromString(html, "text/html")
          .querySelector("#operator")
      );
  }
  static generateTooltip(text) {
    let html = `<span class="spToolTip"> 
                        <span class="spToolTipText">${text}</span>
                    </span>`;
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(".spToolTip")[0];
  }
  // ساختن ایموجی باکس
  static createEmojis() {
    document
      .getElementById("chat_footer")
      .prepend(
        new DOMParser()
          .parseFromString(Emojis, "text/html")
          .querySelector("#emojiContainer")
      );
  }

  static insertEmojiToInput(event) {
    // const cloneNode
    const clone = this.cloneNode(true);
    let emj = emojiApi.unicodeToEmoji(this.getAttribute("data-emj-code"));
    if (SpadTemplate.messageInputText.value.length <= 2000) {
      // let emj = "U+"+this.getAttribute("data-emj-code");
      SpadTemplate.messageInputText.value += emj;
      SpadTemplate.increaseHeight();
      SpadTemplate.messageInputText.focus();
    }
  }
  
  // ست کردن متغییر های گلوبال

  static async setGlobalElements(){

    SpadTemplate.sendMessageBox = document.getElementById("send_message_box");
    SpadTemplate.messageInputText =  document?.getElementById("messageInputText") ;
    SpadTemplate.messageSendIcon = document?.getElementById("send_icon");
    SpadTemplate.chatIcon = document?.getElementById("chat_icon");
    SpadTemplate.chatBox = document?.getElementById("chat_container");
    SpadTemplate.closeBtn = document?.getElementById("close_chat");
    SpadTemplate.chatBody = document?.getElementById("chat_body");
    SpadTemplate.openEmojiIcon = document?.getElementById("emojiIcon");
    SpadTemplate.emojies = document?.querySelectorAll("#otherEmojis > div");
    
    // فوتر 
    SpadTemplate.chatFooter = document?.getElementById("chat_footer");
  } 


}
