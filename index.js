const qrcode = require("qrcode-terminal");
const { exec } = require("child_process");
const { Client } = require("whatsapp-web.js");
const client = new Client();
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

let requiredChatId;

async function getEmoteFromPython(text) {
  return new Promise((resolve, reject) => {
    const process = exec(
      `python3 main.py --text="${text}"`,
      (err, stdout, stdError) => {
        if (err) {
          console.error(err);
          reject(err);
        }

        if (stdout) {
          resolve(stdout);
        }

        process.kill();

        if (stdError) {
          console.error(stdError);
          reject(stdError);
        }
      }
    );
  });
}

client.on("message", (message) => {
  console.log(message);
  console.log(requiredChatId);
  console.log(requiredChatId == message.from);
  console.log(!message.fromMe.valueOf());

  const body = message.body;

  if (requiredChatId && message.from == requiredChatId && !message.fromMe) {
    getEmoteFromPython(body)
      .then((data) => {
        console.log(data);
        let _data = JSON.parse(data);
        let emo = _data["emoji"];
        client.sendMessage(requiredChatId, `${emo} ${emo}`);
      })
      .catch((err) => {
        console.error(err);
      });
  }
});

client.on("authenticated", (session) => {
  // startTimer();
  init();
});

client.initialize();

function init() {
  let interval;
  let chats;
  interval = setInterval(async () => {
    if (client) {
      clearInterval(interval);
      chats = await client.getChats();
      let newChats = chats.map((c) => ({
        ...c,
      }));

      // write it only one time to check which chat you want
      fs.writeFileSync("chats.json", JSON.stringify(chats));
      let envChatNames = process.env.CHAT_ID.split(",").map((s) => s.trim());
      console.log("Chat name", envChatNames);
      let required = chats.find((c) => envChatNames.includes(c.name));
      let chatId = required.id;
      // startTimer(chatId._serialized);
      requiredChatId = chatId._serialized;
    }
  }, 2000);
}

async function startTimer(chatId) {
  setInterval(() => {
    let emoteIndex = Math.random() * (emotes.length - 1);
    client.sendMessage(chatId, "😠😠");
  }, 1 * 10 * 1000);
}

async function sendRandomEmote(chatId) {
  let emoteIndex = Math.floor(Math.random() * (emotes.length - 1));
  console.log("[EMOTE INDEX]", emoteIndex);
  client.sendMessage(requiredChatId, emotes[emoteIndex]);
}
