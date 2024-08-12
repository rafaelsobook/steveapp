import {  MeshBuilder,Animation, SceneLoader, Scene, Vector3, ArcRotateCamera} from '@babylonjs/core'
import "@babylonjs/loaders"
import { createPlayer, loadAvatarContainer } from '../creations.js'
import { getState, setState } from '../main.js'
import { getAllPlayersInSocket } from '../socket/socketLogic.js'

const log = console.log


let currentAnimation
let newAnimation
let interval


let players = []

// necessities to create player
let AvatarRoot
let animationsGLB = []

export default async function createScene(_engine){
    const scene = new Scene(_engine)
    const cam = new ArcRotateCamera('cam', -Math.PI/2, 1, 10, Vector3.Zero(), scene)
    // cam.attachControl()
    scene.createDefaultEnvironment()
    scene.createDefaultLight()

    AvatarRoot = await loadAvatarContainer(scene, "avatar.glb", SceneLoader)

    await importAnimations("idle_anim.glb")
    await importAnimations("walk_anim.glb") //1
    await importAnimations("jump_anim.glb")
    await importAnimations("walkback_anim.glb")

    await scene.whenReadyAsync()

    setState("GAME")
    checkPlayers()
    // createPlayer({x:2,y:0,z:0}, AvatarRoot, animationsGLB)
    // createPlayer({x:1,y:0,z:0}, AvatarRoot, animationsGLB)
    // createPlayer({x:0,y:0,z:-1}, AvatarRoot, animationsGLB)
    log(scene.animationGroups)
    scene.registerBeforeRender(() => {
        const deltaT = _engine.getDeltaTime()
        
    })

    return {scene}
}

function importAnimations(animationGLB, _scene) {

    return SceneLoader.ImportMeshAsync(null, "./models/" + animationGLB, null, _scene)
      .then((result) => {
        result.meshes.forEach(element => {
            if (element) element.dispose();  
        });
        animationsGLB.push(result.animationGroups[0]);
    });
}
function playIdle(_scene) {   

    var randomNumber = 0;
    var newAnimation = _scene.animationGroups[randomNumber];
    // logger.info("Random Animation: " + newAnimation.name);

    // Check if currentAnimation === newAnimation
    while (currentAnimation === newAnimation) {
        randomNumber = 1;
        newAnimation = _scene.animationGroups[randomNumber];
        logger.info("Rechecking Anim: " + newAnimation.name);
    }

    _scene.onBeforeRenderObservable.runCoroutineAsync(
        animationBlending(currentAnimation, 1.0, newAnimation, 1.0, false, 0.01)
    );
   
}
function* animationBlending(fromAnim, fromAnimSpeedRatio, toAnim, toAnimSpeedRatio, repeat, speed)
{
    let currentWeight = 1;
    let newWeight = 0;
    fromAnim.stop();
    toAnim.play(repeat);
    fromAnim.speedRatio = fromAnimSpeedRatio;
    toAnim.speedRatio = toAnimSpeedRatio;
    while(newWeight < 1)
    {
        newWeight += speed;
        currentWeight -= speed;
        toAnim.setWeightForAllAnimatables(newWeight);
        fromAnim.setWeightForAllAnimatables(currentWeight);
        yield;
    }
    currentAnimation = toAnim;
}

function blendAnim(toAnim, _anims, isLooping){
    let currentWeight = 1;
    let newWeight = 0;
    let fromAnimSpeedRatio = 1
    let toAnimSpeedRatio = 1

    _anims.forEach(anim => {
        anim.setWeightForAllAnimatables(0);
    })

    currentAnimation.stop();
    toAnim.play(isLooping);

    currentAnimation.speedRatio = 1;
    toAnim.speedRatio = 1;

    toAnim.setWeightForAllAnimatables(0);
    currentAnimation.setWeightForAllAnimatables(1);
    
    let prevInterval = interval;

    clearInterval(interval)
    interval = setInterval(() => {
        if(newWeight >= 1) {
            currentAnimation = toAnim
            return clearInterval(prevInterval)
        }
        log('transitioning')
        currentWeight -= .05
        newWeight += .05
        toAnim.setWeightForAllAnimatables(newWeight);
        currentAnimation.setWeightForAllAnimatables(currentWeight);
    }, 25)
}

export function rotateAnim(dirTarg, body, rotationAnimation, scene, spdRatio, cb){
    var diffX = dirTarg.x - body.position.x;
    var diffY = dirTarg.z - body.position.z;
    const angle = Math.atan2(diffX,diffY)
  
    rotationAnimation.setKeys([
        { frame: 0, value: body.rotation.y },
        { frame: 20, value:  angle/3},
        { frame: 60, value: angle}
    ]);
    body.animations[0] = rotationAnimation
    scene.beginAnimation(body, 0, 60, false,spdRatio ? spdRatio : 4, () => {
        cb()
    });
}

export function checkPlayers(){
    const state = getState()
    if(state !== "GAME") return log('Game is still not ready')
    const totalPlayers = getAllPlayersInSocket()
    if(totalPlayers.length){
        totalPlayers.forEach(pl => {
            const playerInScene = players.some(plscene => plscene._id === pl._id)
            if(playerInScene) return log('player is already in scene')

            players.push(createPlayer(pl, AvatarRoot, animationsGLB))
        })
    }
}

export function playerDispose(playerDetail){
    log(playerDetail)
    const playerToDispose = players.find(pl => pl._id === playerDetail._id)
    if(playerToDispose){
        log(playerToDispose)
        playerToDispose.anims.forEach(anim => anim.dispose())
        playerToDispose.mainBody?.getChildren()[0].dispose()
        
        players = players.filter(pl => pl._id !== playerToDispose._id)
    }
}
    // model.animationGroups = scene.animationGroups
    // animationsGLB = []
    
    // // scene.animationGroups[0]?.play(true);
    // currentAnimation = model.animationGroups[0]
    // currentAnimation.play(true)

    // newAnimation = model.animationGroups[1]
    // window.addEventListener("keydown", e => {
    //     if(e.key === "w") {
    //         log("PRESSED")
    //         blendAnim(newAnimation, model.animationGroups, true)            
    //     }
    //     if(e.key === "s") {
    //         log("PRESSED")
    //         blendAnim(model.animationGroups[3], model.animationGroups, true)
    //     }
    //     if(e.key === "a"){
    //         log('a is pressed')
    //         if(isMoving) return
    //         const dirTarg = {x: 5 ,y:player.rotation.y, z:0 }
    //         rotateAnim(dirTarg, body, rotationAnimation, scene, 2, () => {
    //             if(!isMoving) blendAnim(newAnimation, model.animationGroups, true) 
    //             isMoving = true
    //         })
    //     }
    //     if(e.key === "d"){
    //         log('a is pressed')
    //         if(isMoving) return
    //         const dirTarg = {x: -5 ,y:player.rotation.y, z:0 }
    //         rotateAnim(dirTarg, body, rotationAnimation, scene, 2, () => {
    //             if(!isMoving) blendAnim(newAnimation, model.animationGroups, true) 
    //             isMoving = true
    //         })
    //     }

    // })
    // window.addEventListener("keyup", e => {
    //     if(e.key === "a"){
    //         blendAnim(model.animationGroups[0], model.animationGroups, true)
    //         isMoving = false
    //     }
        
    //     if(e.key === "d"){
    //         blendAnim(model.animationGroups[0], model.animationGroups, true)
    //         isMoving = false
    //     }
    // })
    // const cyl = MeshBuilder.CreateCylinder('asd', { diameter: .5}, scene)
    // cyl.position = new Vector3(-3,0,0)