import { Engine, MeshBuilder, Vector3, PointerEventTypes } from '@babylonjs/core'
import { emitMove, emitStop, getMyDetail, initializeSocket } from './socket/socketLogic.js';
import createScene, { getPlayersInScene } from "./scenes/createScene.js";
const log = console.log;

let state = 'LOBBY' // LOADING, LOBBY, GAME

initializeSocket()


export async function main(){
  const engine = new Engine(document.querySelector("canvas"))
  const {scene} = await createScene(engine)

  engine.runRenderLoop(() => {
    scene.render()
  })
  window.addEventListener('resize', e => engine.resize())
  window.addEventListener("keydown", e => {
    const keypressed = e.key.toLowerCase()
    
    let movementName
    switch(keypressed){
      case "w":
        movementName = "forward"
      break
      case "a":
        movementName = "left"
      break
      case "d":
        movementName = "right"
      break
      case "s":
        movementName = "backward"
      break
      default:
        movementName = undefined
      break
    }
    if(!movementName) return log("not pressing wasd")

    let myDetail = getMyDetail()
    let myCharacterInScene = getPlayersInScene().find(plScene => plScene._id === myDetail._id)
    if(!myCharacterInScene) return log("my Character mesh not found")
    let currentPos = myCharacterInScene.mainBody.getAbsolutePosition();
    
    emitMove({
      _id: myDetail._id, 
      movementName,
      loc: {x: currentPos.x, y: currentPos.y,z: currentPos.z}, 
      dir: {x: currentPos.x, y: currentPos.y,z: currentPos.z}, 
    })
  })
 
  window.addEventListener("keyup", e => {
    const keypressed = e.key.toLowerCase()
    let movementName
    switch(keypressed){
      case "w":
        movementName = "forward"
      break
      case "a":
        movementName = "left"
      break
      case "d":
        movementName = "right"
      break
      case "s":
        movementName = "backward"
      break
      case " ":
        movementName = "jump"
      break
      default:
        movementName = undefined
      break
    }
    if(!movementName) return log("not pressing wasd")

    let myDetail = getMyDetail()
    let myCharacterInScene = getPlayersInScene().find(plScene => plScene._id === myDetail._id)
    if(!myCharacterInScene) return log("my Character mesh not found")
    let currentPos = myCharacterInScene.mainBody.getAbsolutePosition();
    emitStop({
      _id: myDetail._id, 
      movementName,
      loc: {x: currentPos.x, y: currentPos.y,z: currentPos.z}, 
      dir: {x: currentPos.x, y: currentPos.y,z: currentPos.z} 
    })
  })
  
}

export function getState(){
  return state
}
export function setState(_newState){
  state = _newState
}

