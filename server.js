const express = require('express');
const twilio = require('twilio');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Twilio credentials
const accountSid = '';
const authToken = '';
const twilioClient = twilio(accountSid, authToken);

app.use(cors());
app.use(express.json());

// Endpoint to send SMS
app.post('/send-sms', (req, res) => {
  const { to, message } = req.body;

  twilioClient.messages
    .create({
      body: message,
      from: ,
      to: to,
    })
    .then((message) => res.send({ success: true, messageSid: message.sid }))
    .catch((error) => res.status(500).send({ success: false, error }));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
