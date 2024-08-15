import {Vector3, Tools, Matrix} from "@babylonjs/core";

let character; // Your GLB model
let movementSpeed = 0.1; // Speed of movement
let rotationSpeed = Tools.ToRadians(45); // 45-degree rotation
// let currentDirection = new Vector3(0, 0, 1); // Initially facing 'north'

export function rotateCharacter(character, currentDirectionVector, direction) {
    // Calculate new direction vector
    let newDirection = currentDirectionVector.clone();
    newDirection = Vector3.TransformNormal(newDirection, Matrix.RotationY(rotationSpeed * direction));
    
    // Calculate shortest rotation angle
    let angle = Vector3.GetAngleBetweenVectors(currentDirectionVector, newDirection, Vector3.Up());

    // Set the rotation
    let targetRotation = character.rotation.y + (angle * direction);
    character.rotation.y = targetRotation;
    
    // Update current direction
    return newDirection;
}
function moveForward() {
    // Calculate the new position
    let forwardVector = currentDirection.clone().normalize().scale(movementSpeed);
    character.position.addInPlace(forwardVector);
}
