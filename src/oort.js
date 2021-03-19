import * as THREE from 'three';
import {toRads, getXYCirclePoints} from "./utils/functions.js";
import {
    BufferGeometry,
    Vector3,
    SphereBufferGeometry,
    LineDashedMaterial,
    Line,
    Mesh,
    MeshNormalMaterial, Quaternion
} from 'three';

const {planetaryOrbitRadii, key} = __APP_CONFIG__
import axios from "axios";


const API_KEY = key;


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Geometries
const sphereGeometry = new SphereBufferGeometry(0.05, 20, 15);
const sunGeometry = new SphereBufferGeometry(0.3, 20, 15);
let earthOrbitPoints = getXYCirclePoints(planetaryOrbitRadii.earth, 128);
let marsOrbitPoints = getXYCirclePoints(planetaryOrbitRadii.mars, 128);
let jupiterOrbitPoints = getXYCirclePoints(planetaryOrbitRadii.jupiter, 128);
const earthOrbitGeometry = new BufferGeometry().setFromPoints(earthOrbitPoints);
const marsOrbitGeometry = new BufferGeometry().setFromPoints(marsOrbitPoints);
const jupiterOrbitGeometry = new BufferGeometry().setFromPoints(jupiterOrbitPoints);

//Materials
const asteroidMaterial = new MeshNormalMaterial({color: 0x00ff00});
const whiteDashedLineMat = new LineDashedMaterial({color: 0xffffff});

const clock = new THREE.Clock()

var theta = 0


//Meshes
const sun = new Mesh(sunGeometry, asteroidMaterial);

//Lines
const earthOrbitLine = new Line(earthOrbitGeometry, whiteDashedLineMat);
const marsOrbitLine = new Line(marsOrbitGeometry, whiteDashedLineMat);
const jupiterOrbitLine = new Line(jupiterOrbitGeometry, whiteDashedLineMat);


const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);


scene.add(sun);
scene.add(earthOrbitLine);
scene.add(marsOrbitLine);
scene.add(jupiterOrbitLine);
sun.position.set(0, 0, 0)

camera.position.set(-2, -2, 1.25);
camera.lookAt(0, 0, 0);

console.log(camera)
// This is a bit of a hack
camera.rotation.z = -21 * 2 * Math.PI / 360

let asteroids;
let asteroidMeshes = []
let asteroidTrajectories = []

function padZeroLeft(number) {
    const month = String(number)

    return month.length === 1 ? "0" + month : month;
}

function setup(asteroids) {
    const today = new Date()
    const formattedDate = `${today.getFullYear()}-${padZeroLeft(today.getMonth() + 1)}-${padZeroLeft(today.getDate())}`
    console.log(formattedDate)
    console.log(asteroids["near_earth_objects"][formattedDate][11])
    for (let i = 0; i < asteroids["near_earth_objects"][formattedDate].length; i++) {
        let asteroidElement = asteroids["near_earth_objects"][formattedDate];
        let orbitalData = asteroidElement[i]['orbital_data'];
        asteroidTrajectories[i] = trajectory(
            Number(orbitalData["perihelion_distance"]),
            Number(orbitalData["eccentricity"]),
            Number(orbitalData["orbital_period"]),
            Number(orbitalData["perihelion_argument"]),
            Number(orbitalData["perihelion_distance"]),
            Number(orbitalData["inclination"]),
            Number(orbitalData["ascending_node_longitude"]),
            Number(orbitalData["epoch_osculation"]),
            Number(orbitalData["perihelion_time"])
        )
        asteroidMeshes[i] = new Mesh(sphereGeometry, asteroidMaterial);
        scene.add(asteroidMeshes[i]);
    }

}


function trajectory(semimajor, eccentricity, orbitalPeriod, perihelionArgument, perihelionDistance, orbitalInclination, longitudeOfAscNode, epochOsculation, perihelionTime) {
    let semiminor = Math.sqrt(semimajor ** 2 * (1 - eccentricity ** 2));
    perihelionArgument = toRads(perihelionArgument);
    orbitalInclination = toRads(orbitalInclination);
    let position = (semimajorAxis, semiminorAxis, orbitalPeriodDays, perihelionArg, perihelionDist, inclination, longOfAscNode, relativePerihelionTime) => (time) => {
        // define axis normal to the plane
        let normalAxis = new Vector3(0, 0, 1);
        let positionVector = new Vector3(
            semimajorAxis * Math.cos(2 * Math.PI * ((time - relativePerihelionTime) / orbitalPeriodDays)),
            semiminorAxis * Math.sin(2 * Math.PI * ((time - relativePerihelionTime) / orbitalPeriodDays)),
            0
        );
        let translation = new Vector3(-semimajorAxis + perihelionDist, 0, 0);
        positionVector.addScaledVector(translation, 1)

        // Create the axis of inclination by rotating the x axis by the longitude of the ascending node
        let inclinationAxis = new Vector3(1, 0, 0);
        inclinationAxis.applyAxisAngle(normalAxis, longOfAscNode);
        // now we rotate the position about the axis of inclination by the inclination
        positionVector.applyAxisAngle(inclinationAxis, inclination);

        // This applies the argument of the perihelion, i.e. what is the angle that the perihelion makes
        // with the zero angle line
        positionVector.applyAxisAngle(normalAxis.clone().applyAxisAngle(inclinationAxis, longOfAscNode), perihelionArg);

        return positionVector;
    }

    return position(semimajor, semiminor, orbitalPeriod, perihelionArgument, perihelionDistance, orbitalInclination, longitudeOfAscNode, perihelionTime - epochOsculation)
}


function animate() {
    if (theta < 10) {
        requestAnimationFrame(animate);
    }
    const delta = clock.getDelta();
    theta = theta + delta;
    for (let i = 0; i < asteroidTrajectories.length; i++) {
        let position = asteroidTrajectories[i](100 * theta)
        asteroidMeshes[i].position.set(position.x, position.y, position.z)
        if (i === 1) {
            console.log(position)
        }
    }

    renderer.render(scene, camera);
}

export default function run() {
    console.log("running")
    axios.get(`https://api.nasa.gov/neo/rest/v1/feed/today?detailed=true&api_key=${API_KEY}`).then((resp) => {
        let data = '';
        // The whole response has been received. Print out the result.
        asteroids = resp.data;
        setup(asteroids);
        animate();

    }).catch(error => {
        console.log(error)
    })
}






