import _ from 'lodash';
import run from './oort.js'
import axios from "axios";


function component() {
    const element = document.createElement('canvas');
    element.setAttribute('id', 'c');

    element.innerHTML = _.join([], '');

    return element;
}

document.body.appendChild(component());

run();