let character; // Your GLB model
let movementSpeed = 0.1; // Speed of movement
let rotationSpeed = BABYLON.Tools.ToRadians(45); // 45-degree rotation
let currentDirection = new BABYLON.Vector3(0, 0, 1); // Initially facing 'north'

function rotateCharacter(direction) {
    // Calculate new direction vector
    let newDirection = currentDirection.clone();
    newDirection = BABYLON.Vector3.TransformNormal(newDirection, BABYLON.Matrix.RotationY(rotationSpeed * direction));
    
    // Calculate shortest rotation angle
    let angle = BABYLON.Vector3.GetAngleBetweenVectors(currentDirection, newDirection, BABYLON.Vector3.Up());

    // Set the rotation
    let targetRotation = character.rotation.y + (angle * direction);
    character.rotation.y = targetRotation;
    
    // Update current direction
    currentDirection = newDirection;
}
function moveForward() {
    // Calculate the new position
    let forwardVector = currentDirection.clone().normalize().scale(movementSpeed);
    character.position.addInPlace(forwardVector);
}
