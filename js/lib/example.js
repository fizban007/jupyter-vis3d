import * as widgets from "@jupyter-widgets/base";
import "lodash";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from 'three/examples/jsm/libs/stats.module.js';

// See example.py for the kernel counterpart to this file.
function enterFullscreen(elem) {
    //function to make element (cell) fullscreen on most browsers
    elem = elem || document.documentElement;
    if (
        !document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement
    ) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        elem.style.width = "100%";
        elem.style.height = "100%";
    }
    // else {
    //     if (document.exitFullscreen) {
    //         document.exitFullscreen();
    //     } else if (document.msExitFullscreen) {
    //         document.msExitFullscreen();
    //     } else if (document.mozCancelFullScreen) {
    //         document.mozCancelFullScreen();
    //     } else if (document.webkitExitFullscreen) {
    //         document.webkitExitFullscreen();
    //     }
    // }
}

function resize_renderer_to_display(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

// Custom Model. Custom widgets models must at least provide default values
// for model attributes, including
//
//  - `_view_name`
//  - `_view_module`
//  - `_view_module_version`
//
//  - `_model_name`
//  - `_model_module`
//  - `_model_module_version`
//
//  when different from the base class.

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.
var VisModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name: "VisModel",
        _view_name: "VisView",
        _model_module: "jupyter-vis3d",
        _view_module: "jupyter-vis3d",
        _model_module_version: "0.1.0",
        _view_module_version: "0.1.0",
        height: 600,
        color: 0x00ff00,
        enable_stats: true,
    }),
});

// Custom View. Renders the widget model.
var VisView = widgets.DOMWidgetView.extend({
    // Defines how the widget gets rendered into the DOM
    render: function () {
        const output_element = document.querySelector(".output_subarea");
        const width = output_element.offsetWidth;
        const height = this.model.get("height");

        var container = document.createElement("div");
        container.id = "three-container";
        container.style.width = width + "px";
        container.style.height = height + "px";
        this.el.appendChild(container);

        var stats = new Stats();
        stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        container.appendChild( stats.dom );
        stats.dom.style.position = 'absolute';
        this.stats = stats;

        // Observe changes in the value traitlet in Python, and define
        // a custom callback.
        this.model.on("change:enable_stats", this.stats_changed, this);
        this.model.on("change:color", this.color_changed, this);
        this.model.on("change:height", this.height_changed, this);

        // Create a THREE.js scene and attach the domElement
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        container.appendChild(this.renderer.domElement);
        this.renderer.domElement.id = "three-canvas";
        this.renderer.domElement.style.width = "100%";
        this.renderer.domElement.style.height = "100%";
        // this.renderer.domElement.style.position = 'absolute';

        // Add a cube
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);

        this.camera.position.z = 5;
        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;

        const renderer = this.renderer;
        const scene = this.scene;
        const camera = this.camera;

        function animate() {
            stats.begin();
            renderer.render(scene, camera);


            if (resize_renderer_to_display(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }
            stats.end();
            requestAnimationFrame(animate);
        }
        animate();

        var btn = document.createElement("BUTTON"); // Create a <button> element
        btn.innerHTML = "Fullscreen"; // Insert text
        this.el.appendChild(btn); // Append <button> to <body>
        
        btn.onclick = function() {
            var elem = document.getElementById("three-container");
            enterFullscreen(elem);
        };

        // window.addEventListener( 'resize', this.on_resize, false );
        if (document.addEventListener)
        {
            document.addEventListener('webkitfullscreenchange', this.fsChangeHandler, false);
            document.addEventListener('mozfullscreenchange', this.fsChangeHandler, false);
            document.addEventListener('fullscreenchange', this.fsChangeHandler, false);
            document.addEventListener('MSFullscreenChange', this.fsChangeHandler, false);
        } 
    },

    stats_changed: function () {
        if (this.model.get("enable_stats")) {
            this.stats.dom.style.display = "block";
        } else {
            this.stats.dom.style.display = "none";
        }
    },

    color_changed: function () {
        this.cube.material.color.setHex(this.model.get("color"));
    },

    height_changed: function () {
        // var elem = document.getElementById("three-canvas");
        var elem = document.getElementById("three-container");
        const height = this.model.get("height");
        elem.style.height = height + "px";
    },

    fsChangeHandler: function() {
        if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement !== undefined) {
            /* Run code when going to fs mode */
        } else {
            this.height_changed();
        }
    },

});

export { VisModel, VisView };
