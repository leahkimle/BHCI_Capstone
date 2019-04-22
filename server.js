const express = require('express')
const bodyParser = require("body-parser")
const session = require("express-session")
const mustache = require("mustache-express")

const os = require("os")

const ifaces = os.networkInterfaces();

let ip;

for (let iface in ifaces) {
  for (let about of ifaces[iface]) {
    if (about.family === "IPv4" && !about.internal) {
      ip = about.address;
    }
  }
}

const app = express()
const port = 3000

const users = []
let roundNum = -1

const roles = [
  ["phone_role1_1.png", "phone_role1_2.png", "phone_role1_3.png", "phone_role1_4.png"],
  ["phone_role2_1.png", "phone_role2_2.png", "phone_role2_3.png", "phone_role2_4.png"],
  ["phone_role3_1.png", "phone_role3_2.png", "phone_role3_3.png", "phone_role3_4.png"],
  ["phone_role4_1.png", "phone_role4_2.png", "phone_role4_3.png", "phone_role4_4.png"]
]

const intros = [
  "tv_intro1.png",
  "tv_intro2.png",
  "tv_intro3.png",
  "tv_intro4.png"
]

const game_screens = [
  ["tv_round1_1.png", "tv_round1_2.png", "tv_round1_3.png", "tv_round1_4.png", "tv_round1_5.png", "tv_round1_6.png", "tv7a.png", "tv8a_1.png", "tv8a_2.png", "tv8a_3.png", "tv9.png"],
  ["tv_round2_1.png", "tv_round2_2.png", "tv_round2_3.png", "tv_round2_4.png", "tv_round2_5.png", "tv_round2_6.png", "tv7b.png", "tv8b_1.png", "tv8b_2.png", "tv8b_3.png", "tv9.png"],
  ["tv_round3_1.png", "tv_round3_2.png", "tv_round3_3.png", "tv_round3_4.png", "tv_round3_5.png", "tv_round3_6.png", "tv7c.png", "tv8c_1.png", "tv8c_2.png", "tv8c_3.png", "tv9.png"],
  ["tv_round4_1.png", "tv_round4_2.png", "tv_round4_3.png", "tv_round4_4.png", "tv_round4_5.png", "tv_round4_6.png", "tv7d.png", "tv8d_1.png", "tv8d_2.png", "tv8d_3.png", "tv9.png"]
]

const roundImages = [
  "phone2a.png",
  "phone2b.png",
  "phone2c.png",
  "phone2d.png"
]

app.engine("mustache", mustache())
app.set("view engine", "mustache")
app.set("views", __dirname + "/views")

app.use(express.static("static"))

app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({
  secret: "super cool secret"
}))

app.get("/tvstart", (req, res) => {
  res.render("start", {host: `${ip}:${port}`});
})

app.get("/players", (req, res)=> {
  res.render("players", {users})
})

app.get("/intro/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const next = id + 1;
  if (id < intros.length) {
    res.render("intro", {imageUrl: intros[id], next})
  } else {
    res.redirect("/round/0")
  }
})

app.get("/round/:id", (req, res)=>{
  const id = parseInt(req.params.id);
  roundNum = id;
  const next = id + 1;
  if (id < game_screens.length){
    res.render("round", {next, screens: JSON.stringify(game_screens[id])})
  } else {
    res.redirect("/tvend")
  }
})

app.get("/tvend", (req, res) => {
  res.sendFile(__dirname + "/tvEnd.html")
})

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect("/role")
  } else {
    res.sendFile(__dirname + "/enterName.html")
  }
})

app.post("/playerLogin", (req, res) => {
  const user = req.body.user;
  users.push(user)
  req.session.user = user
  res.redirect("/role")
})

app.get("/roundNumber", (req, res) => {
  res.send({roundNum});
})

app.get("/role", (req, res) => {
   if (roundNum == -1) {
    res.sendFile(__dirname + "/wait.html");
    return;
  }
   if (roundNum >= roles.length) {
    res.sendFile(__dirname+"/phoneEnd.html")
    return; 
  }
  const user = req.session.user
  const userIndex = users.indexOf(user)
  const roleIndex = (userIndex + roundNum) % 4
  
  const roleimg = roles[roundNum][roleIndex]
  
  res.render("role", {roundNum, roleimg: roleimg, roundImg: roundImages[roundNum]})
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))