import * as THREE from 'three'

export function getXYCirclePoints(radius, numberOfPoints) {
    let angles = new Array(numberOfPoints + 1)
    for (let i = 0; i < angles.length; i++) {
        angles[i] = 2*Math.PI*i/numberOfPoints;
    }

    let points = angles.map(
        (angle) => new THREE.Vector3(radius*Math.cos(angle), radius*Math.sin(angle), 0)
    )

    return points
}

export function toRads(angleDegrees) {
    return 2 * Math.PI * angleDegrees / 360
}