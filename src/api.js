const express = require("express");
const serverless = require("serverless-http");
const { google } = require("googleapis");
const keys = require("../keys.json");
const bodyParser = require("body-parser");
const cors = require("cors");

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

const app = express();
const router = express.Router();

let emails = [];

app.use(cors(true));
app.use(bodyParser.json());

router.get("/", (req, res) => {
  res.json({
    hello: "sup",
  });
});

router.post("/emails", (req, res) => {
  const email = [[req.body.email]];

  console.log(email);
  emails.push(email);
  newsletter(email);
  res.send("email has been added");
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);

async function newsletter(email) {
  client.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log("Hacker Voice: I'm in");
      internship(client);
    }
  });
  const gsapi = google.sheets({
    version: "v4",
    auth: client,
  });
  const opt = {
    spreadsheetId: "1i_Y9AZ9EQcGqV5AcJtYkAE1SwEwHZeVmcnZAEphJqV8",
    range: "emails!A:A",
  };

  let data = await gsapi.spreadsheets.values.get(opt);
  let dataArray = data.data.values;
  console.log(dataArray);
  let nextRow = dataArray.length + 1;
  console.log(nextRow);
  let nextEmailRange = "emails!A" + nextRow;
  console.log(nextEmailRange);

  const uptOpt = {
    spreadsheetId: "1i_Y9AZ9EQcGqV5AcJtYkAE1SwEwHZeVmcnZAEphJqV8",
    range: nextEmailRange,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: email,
    },
  };

  let res = await gsapi.spreadsheets.values.update(uptOpt);
  console.log(res);
}
