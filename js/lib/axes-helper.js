import * as THREE from "three";

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    // if (document.getElementById(elmnt.id + "header")) {
    //     // if present, the header is where you move the DIV from:
    //     document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    // } else {
    //     // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
    // }
    console.log(elmnt);

    function dragMouseDown(e) {
        console.log("down");
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

const CANVAS_WIDTH = 150;
const CANVAS_HEIGHT = 150;
const CAM_DISTANCE = 300;

class axes_helper {
    constructor(container, camera, canvas) {
        // dom
        var div = document.createElement('div');
        div.classList.add('axes-helper');
        console.log(div.style);
        // container.appendChild(div);
        container.insertBefore(div, canvas);
        // Make the DIV element draggable:
        dragElement(div);
        this.el = div;

        // renderer
        this.renderer2 = new THREE.WebGLRenderer( { alpha: true, });
        this.renderer2.setClearColor( 0x000000, 0 );
        this.renderer2.setSize( CANVAS_WIDTH, CANVAS_HEIGHT );
        div.appendChild( this.renderer2.domElement );

        // scene
        this.scene2 = new THREE.Scene();
        this.scene2.background = null;

        // camera
        this.camera2 = new THREE.PerspectiveCamera( 50, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 1000 );
        this.camera2.up = camera.up; // important!

        // axes
        // axes2 = new THREE.AxisHelper( 100 );
        const origin = new THREE.Vector3(0, 0, 0);
        const z_hat = new THREE.Vector3(0, 1, 0);
        const y_hat = new THREE.Vector3(0, 0, -1);
        const x_hat = new THREE.Vector3(1, 0, 0);

        var axes2 = new THREE.Group();
        const x_arrow = new THREE.ArrowHelper(x_hat, origin, 100, 0xff0000, 20, 15);
        const y_arrow = new THREE.ArrowHelper(y_hat, origin, 100, 0x00ff00, 20, 15);
        const z_arrow = new THREE.ArrowHelper(z_hat, origin, 100, 0x0000ff, 20, 15);

        axes2.add(x_arrow);
        axes2.add(y_arrow);
        axes2.add(z_arrow);
        this.scene2.add( axes2 );       
    }

    sync_camera(camera) {
        this.camera2.position.copy( camera.position );
	    this.camera2.position.setLength( CAM_DISTANCE );

        this.camera2.lookAt( this.scene2.position );
    }

    render() {
        this.renderer2.render(this.scene2, this.camera2);
    }

    reposition() {
        this.el.style.top = "";
        this.el.style.bottom = "0px";
        this.el.style.left = "0px";
    }
}

export { axes_helper };