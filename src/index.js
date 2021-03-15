import _ from 'lodash';
import run from './oort.js'
import axios from "axios";


function component() {
    const element = document.createElement('canvas');
    element.setAttribute('id', 'c');

    element.innerHTML = _.join([], '');

    return element;
}

// function get_nasa_data() {
//     axios.get(`https://api.nasa.gov/neo/rest/v1/feed/today?detailed=true&api_key=${API_KEY}`).then((resp) => {
//         let data = '';
//         // The whole response has been received. Print out the result.
//         asteroids = resp.data;
//         console.log(resp.data)
//     }).catch((err) => {
//         console.log("Error: " + err.message);
//     });
// }

document.body.appendChild(component());

// get_nasa_data();
run();