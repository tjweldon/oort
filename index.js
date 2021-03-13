import * as THREE from './node_modules/three/build/three.module.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const sphereGeometry = new THREE.SphereGeometry(0.5, 20, 15);
const material = new THREE.MeshNormalMaterial( { color: 0x00ff00 } );
const asteriod = new THREE.Mesh( sphereGeometry, material );
const sun = new THREE.Mesh( sphereGeometry, material )
scene.add( asteriod );
scene.add( sun );
sun.position.set(0, 0, 0)

camera.position.z = 10;

function velocity(theta) {
    return new THREE.Vector3(0.1*Math.cos(10*theta), 0.1*Math.sin(10*theta),0)
}

function position(theta) {
    return new THREE.Vector3(Math.sin(theta), -1*Math.cos(theta),0)
}

function toRads(angleDegrees) {
    return 2*Math.PI*angleDegrees/360
}

function trajectory(semimajor, eccentricity, orbitalPeriod, perihelionArgument, perihelionDistance, longitudeOfAscendingNode, orbitalInclination) {
    let semiminor = Math.sqrt(semimajor**2*(1-eccentricity**2))
    perihelionArgument = toRads(perihelionArgument)
    orbitalInclination = toRads(orbitalInclination)
    let position = (semimajorAxis, semiminorAxis, orbitalPeriodDays, perihelionArg, perihelionDist, longitudeOfAscNode, inclination) => (time) => {
        let positionVector = new THREE.Vector3(
            semimajorAxis*Math.sin(2*Math.PI*(time/orbitalPeriodDays)),
            semiminorAxis*Math.cos(2*Math.PI*(time/orbitalPeriodDays)),
            0
        );

        //Here we translate the vector so that the semi-minor axis is relative to the origin
        let displacement = semimajorAxis - perihelionDist
        positionVector.addScaledVector(
            new THREE.Vector3(-displacement),
            1
        )

        // define axis normal to the plane
        let normalAxis = new THREE.Vector3(0, 0, 1)

        // This applies the argument of the perihelion, i.e. what is the angle that the perihelion makes
        // with the zero angle line
        positionVector.applyAxisAngle(normalAxis, perihelionArg)


        // Create the axis of inclination by rotating the x axis by the longitude of the ascending node
        let inclinationAxis = new THREE.Vector3(1, 0, 0)
        inclinationAxis.applyAxisAngle(normalAxis, longitudeOfAscNode)

        // now we rotate the position about the axis of inclination by the inclination
        positionVector.applyAxisAngle(inclinationAxis, inclination)


        return positionVector
    }

    return position(semimajor, semiminor, orbitalPeriod, perihelionArgument, perihelionDistance, longitudeOfAscendingNode, orbitalInclination)
}

const clock = new THREE.Clock()

var theta = 0
function animate() {


	requestAnimationFrame( animate );
	const delta = clock.getDelta()
    let traj = trajectory(3, 0.75, 2.5,  90, 0.5, 45, 30)
    theta = theta + delta
	asteriod.position.set(traj(theta).x, traj(theta).y, 0)


	renderer.render( scene, camera );
}
animate();



