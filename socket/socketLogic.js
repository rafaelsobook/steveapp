import io from "socket.io-client"
import { getState, main, setState } from "../main.js"
import { checkPlayers, playerDispose } from "../scenes/createScene.js"
const log = console.log
const listElement = document.querySelector(".room-lists")

let socket
let myDetail
let playersInServer = []

listElement.addEventListener("click", e => {
    const roomNumber = e.target.className.split(" ")[1]
    if(!roomNumber) return
    if(!socket) return log('socket not connected')
    socket.emit('joinRoom', {
        name: `samplename${Math.random().toLocaleString().split(".")[1]}`,
        roomNumber
    })
})
export function getSocket(){
    return socket
}

export function initializeSocket(){
  if (socket !== undefined) return
  socket = io("https://steveapptcp.onrender.com/")

  socket.on('room-size', roomLength => {
    for(var i=0;i<roomLength;i++){
        const button = document.createElement("button")
        button.className = `room-btn ${i+1}`
        button.innerHTML = `room ${i+1}`
        listElement.append(button)
    }
  })
  socket.on("player-joined", data => {
      const {newPlayer, allPlayers} = data
      updateAllPlayers(allPlayers)
      log(`${newPlayer.name} has joined the room`)
      checkPlayers()
  })
  socket.on('my-detail', detail =>  {
    myDetail = detail
    const state = getState()
    if(state === "GAME") return log("Already On Game")
    if(state === "LOBBY"){
        listElement.style.display = "none"
        setState("LOADING")
        main()
    }
  })
  socket.on('player-dispose', playerDetail => {
    playerDispose(playerDetail)
  })
}

// tools
function updateAllPlayers(_newPlayers){
    playersInServer = _newPlayers
    log(playersInServer)
}
export function getAllPlayersInSocket(){
    return playersInServer
}