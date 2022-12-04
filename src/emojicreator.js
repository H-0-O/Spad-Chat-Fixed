/*
import * as emoji from 'emoji-api';
import css from './Templates/client_style.css';
import twemoji from "twemoji";

console.log(emoji.arrange())
console.log(emoji.arrange())
generateEmoji();
function generateEmoji(catName , target){
    let html = "<div id='emojiBox'>";
    html += ' <ul id="emCats">';
    html += generateEmCats();
    html += "</ul>";
    html += "  <div id='emPans'>";
    html += generatePans();
    html += '</div> ';
    html += '</div>';

    let emojiTemp = new DOMParser().parseFromString(html , "text/html").querySelector("#emojiBox");
    console.log(twemoji.parse("1f600 "));
    document.body.append(emojiTemp);
     document.querySelectorAll("#emojiBox .emCat").forEach((val)=>{
         val.addEventListener("click" , function(){
             const target = "#"+this.getAttribute("data-em-target");
             document.querySelectorAll("#emojiBox .emActivePan").forEach((val)=>{
                 val.classList.remove("emActivePan");
             })
             document.querySelector(target).classList.add("emActivePan");
         });
     })
    document.querySelectorAll("#emojiBox .emj").forEach((val)=>{
        val.addEventListener("click" , function(){
            console.log(this.getAttribute("data-emj-code"))
        })
    })

}

function generateEmCats(){
    let tabs = '';
    for(const [key , value] of Object.entries(emoji.arrange()))
    {
        let keyName = key.replace(/[^a-zA-Z]/g, '');
        // generation tabs
        tabs += `<li class="emCat" id="${keyName}-tab" data-em-target = "${keyName}-pan">
            <span>${value[0]._data.emoji}</span>
        </li>`;
    }
    return tabs;
}
function generatePans(){
    let html = '';
    // twemoji.convert.fromCodePoint("1f1e8");
    for(const [key , value] of Object.entries(emoji.arrange())) {
        let keyName = key.replace(/[^a-zA-Z]/g, '');
        let pan =`<div id="${keyName}-pan" class="emPan" > `;
        let i = 0;
        value.forEach(function (value) {
            pan += `<div class="emj" data-emj-code="${value._data.codepoints}"> <span>${value._data.emoji} </span></div>`;
        })
        pan += '</div>';
        html += pan;
    }
    return html;
}

let i =0;

    emoji.arrange()['Smileys & Emotion'].forEach(function (value) {
        setTimeout(()=>{
            fetch(`https://twemoji.maxcdn.com/v/latest/svg/${twemoji.convert.toCodePoint(value._data.emoji)}.svg`).then(response => response.text()).then(data => {
                if(data !== null) {
                    let emojis = `<div data-emj-code="${twemoji.convert.toCodePoint(value._data.emoji)}"> ${data} </div>`
                    document.body.append(new DOMParser().parseFromString(emojis, "text/html").querySelector("div"))
                }
            })
        });

    })
*/

import Emojis from './Templates/creatorsEmojies.html';
import css from './Templates/client_style.css';

function createEmojiBox(){
    let box = new DOMParser().parseFromString(Emojis , "text/html").querySelector("#emojiBox");
    let emojis = new DOMParser().parseFromString(Emojis , "text/html").querySelector("#emojis");
    document.body.append(box);
    document.querySelector("#emojiIcon").append(emojis.firstElementChild)
    emojis.childNodes.forEach(function(value){
        document.querySelector("#otherEmojis").append(value)
    })
    // box.querySelector("#emojiBox").append(emojis);

    // console.log(html)

    // document.body.append(html);

}

// console.log(Emojis)
createEmojiBox()