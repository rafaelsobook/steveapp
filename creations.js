import { Vector3 } from "@babylonjs/core";
const log = console.log
export async function loadAvatarContainer(scene, glbName, SceneLoader){
    return await SceneLoader.LoadAssetContainerAsync("./models/", `${glbName}`, scene);
}
export function createPlayer(detail, RootAvatar, animationsGLB){
    const {loc, _id, name } = detail
    const instance = RootAvatar.instantiateModelsToScene()
    const mainBody = instance.rootNodes[0]
    const modelTransformNodes = mainBody.getChildTransformNodes()

    mainBody.position = new Vector3(loc.x,loc.y,loc.z)

    animationsGLB.forEach(anim => {
        const clonedAnim = anim.clone(`walk_anim_${anim.name}`, (oldTarget) => {
            //oldTarget is a transformNode
            let theNode
            modelTransformNodes.forEach(node => {
                const nodeName = node.name.split(" ")[2]
                if(nodeName === oldTarget.name) theNode = node
            })
            // log(theNode)
            if(!theNode) return oldTarget
            return theNode
        })
        instance.animationGroups.push(clonedAnim)
        // anim.dispose()
    })
    instance.animationGroups[0].play(true)

    return {
        _id,
        mainBody,
        anims: instance.animationGroups,
        instance
    }
}
export async function createAvatar_Old(glbName, pos, direction, animationsGLB){
    const {x,y,z} = pos

    const model = await SceneLoader.ImportMeshAsync('', "./models/", glbName, scene)
    const player = model.meshes[0]
    const body = model.meshes[1]
    var modelTransformNodes = player.getChildTransformNodes();

    const rotationAnimation = new Animation("rotationAnimation", "rotation.y", 60,Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    animationsGLB.forEach(anim => {
        const newAnim = anim.clone(`walk_anim_${anim.name}`, (oldTarget) => {
            //oldTarget is a transformNode
            const theNode = modelTransformNodes.find(node => node.name === oldTarget.name)
            // log(theNode)
            if(!theNode) return oldTarget
            return theNode
        })
        anim.dispose()
    })


    return { player, body, modelTransformNodes, rotationAnimation}
}