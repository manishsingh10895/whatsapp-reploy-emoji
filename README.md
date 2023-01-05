# Whatsapp reply emoji

### Send emoji as reply, detecting the emotion of the incoming message in whatsapp


# To run locally

* clone the repo
* first install python dependencies 
  * `pip install -r requirements.txt`
* Install node deps 
  * `npm i`
* rename `.env.demo` to `.env` and update value of `CHAT_ID` to any chat name in whatsapp chats
* `node index.js`
* Scan the QR code printed in terminal using **Whatsapp Linked Devices** to login to Whatsapp
* Emojis will be sent automatically on receiving a new message from the `CHAT_ID`