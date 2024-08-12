import { Engine, Vector3 } from '@babylonjs/core'
import { initializeSocket } from './socket/socketLogic.js';
import createScene from "./scenes/createScene.js";
const log = console.log;

let state = 'LOBBY' // LOADING, LOBBY, GAME

initializeSocket()

let players = []
export async function main(){
  const engine = new Engine(document.querySelector("canvas"))
  const {scene} = await createScene(engine)

  engine.runRenderLoop(() => {
    scene.render()
  })
  window.addEventListener('resize', e => engine.resize())
}

export function getState(){
  return state
}
export function setState(_newState){
  state = _newState
}

