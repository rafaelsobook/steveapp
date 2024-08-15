import { MeshBuilder, Vector3, Space } from "@babylonjs/core"
import io from "socket.io-client"
import { rotateCharacter } from "../controllers.js"
import { getState, main, setState } from "../main.js"
import { blendAnimv2, checkPlayers, getPlayersInScene, getScene, playerDispose, rotateAnim } from "../scenes/createScene.js"
const log = console.log
const listElement = document.querySelector(".room-lists")

let socket
let myDetail //_id, name, socketId, loc, roomNum
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
  // socket = io("https://steveapptcp.onrender.com/")
  socket = io("ws://localhost:3000")

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
  socket.on('who-am-i', detail =>  {
    myDetail = detail
    const state = getState()
    if(state === "GAME") return log("Already On Game")
    if(state === "LOBBY"){
        listElement.style.display = "none"
        setState("LOADING")
        main()
    }
  })

  // movements
  socket.on("a-player-moved", playersInRoom => {
    playersInRoom.forEach(data => {
      const playersInScene = getPlayersInScene()
      const playerThatMoved = playersInScene.find(pl => pl._id === data._id)
      if(playerThatMoved){
        if(data._movingForward || data._movingBackward || data._movingLeft || data._movingRight){
          const { loc, dir } = data    
          blendAnimv2(playerThatMoved, playerThatMoved.anims[1], playerThatMoved.anims, true)

          const plPos = playerThatMoved.mainBody.position
          if(playerThatMoved._movementName !==data._movementName && playerThatMoved.canRotate){
            playerThatMoved._movementName = data._movementName
            rotateAnim({x:loc.x, y:plPos.y, z: loc.z}, playerThatMoved.mainBody, playerThatMoved.rotationAnimation, getScene(), 4)
            // playerThatMoved.mainBody.lookAt(new Vector3(loc.x,0,loc.z),0,0,0)
          }
          log("x:", loc.x, "z:", loc.z);
          const magnitude = Math.sqrt(loc.x * loc.x + loc.z * loc.z);
          const normX = loc.x/magnitude
          const normZ = loc.z/magnitude
          log("dirX:", normX, "dirZ:", normZ);
          playerThatMoved.mainBody.lookAt(new Vector3(loc.x,0,loc.z),0,0,0);
          
          // if(data._movingForward && !playerThatMoved._movingForward){
          //   playerThatMoved._movingForward = true
          //   rotateAnim({x:loc.x, y:plPos.y, z: loc.z}, playerThatMoved.mainBody, playerThatMoved.rotationAnimation, getScene(), 4)
          // }
          // if(data._movingBackward && !playerThatMoved._movingBackward){
          //   playerThatMoved._movingBackward = true
          //   rotateAnim({x:loc.x, y:plPos.y, z: loc.z}, playerThatMoved.mainBody, playerThatMoved.rotationAnimation, getScene(), 4)
          // }
          // if(data._movingLeft && !playerThatMoved._movingLeft){
          //   playerThatMoved._movingLeft = true
          //   rotateAnim({x:loc.x, y:plPos.y, z: loc.z}, playerThatMoved.mainBody, playerThatMoved.rotationAnimation, getScene(), 4)
          // }
          // if(data._movingRight && !playerThatMoved._movingRight){
          //   playerThatMoved._movingRight = true
          //   rotateAnim({x:loc.x, y:plPos.y, z: loc.z}, playerThatMoved.mainBody, playerThatMoved.rotationAnimation, getScene(), 4)
          // }
          playerThatMoved.mainBody.position.x = loc.x
          playerThatMoved.mainBody.position.z = loc.z         
        }
      }
    })
  })
  socket.on("player-stopped", data => {
      const playersInScene = getPlayersInScene()
      const plThatStopped = playersInScene.find(pl => pl._id === data._id)
      if(plThatStopped){
          if(data.movementName === "jump"){
            return blendAnimv2(plThatStopped, plThatStopped.anims[2], plThatStopped.anims)
          }
          blendAnimv2(plThatStopped, plThatStopped.anims[0], plThatStopped.anims, true)
          plThatStopped._movingForward = data._movingForward
          plThatStopped._movingBackward = data._movingBackward
          plThatStopped._movingLeft = data._movingLeft
          plThatStopped._movingRight = data._movingRight
          plThatStopped._movementName = undefined
          plThatStopped.canRotate = true
      }
  })

  socket.on('player-dispose', playerDetail => {
    playerDispose(playerDetail)
  })
}

// Movement emits
export function emitMove(movementDetail){
  if(!socket) return log('socket is not yet ready')
  // log(movementDetail.loc)
  socket.emit('emit-move', movementDetail)
}
export function emitStop(movementDetail){
  if(!socket) return log('socket is not yet ready')
  // log(movementDetail.loc)
  socket.emit('emit-stopped', movementDetail)
}
// tools
function updateAllPlayers(_newPlayers){
    playersInServer = _newPlayers
    log(playersInServer)
}
export function getMyDetail(){
  return myDetail
}
export function getAllPlayersInSocket(){
    return playersInServer
}