import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { axes_helper } from "./axes-helper";

//function to make element (cell) fullscreen on most browsers
function toggleFullscreen(elem) {
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
        // elem.style.width = "100%";
        // elem.style.height = "100%";
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

// helper function to reactively resize the renderer
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


export class ThreeCanvas {
    constructor(container, bg = "#000000") {
        // Initialize a stats object
        var stats = new Stats();
        stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        container.appendChild( stats.dom );
        stats.dom.style.position = 'absolute';
        stats.dom.style.display = 'block';
        this.stats = stats;

        const width = container.offsetWidth;
        const height = container.offsetHeight;

        // Create a THREE.js scene and attach it to the container
        const scene = new THREE.Scene();
        this.scene = scene;
        scene.background = new THREE.Color(bg);
        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);
        renderer.domElement.classList.add("three-canvas");
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";

        // Add an ambient light
        var intensity = 0.5;
        const color = 0xFFFFFF;
        const amb_light = new THREE.AmbientLight(color, intensity);
        scene.add(amb_light);

        // Add a directional light source
        intensity = 1.0;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(10, 10, 6);
        light.target.position.set(0, 0, 0);
        scene.add(light);
        scene.add(light.target);

        const objects = new THREE.Group();
        scene.add(objects);
        this.objects = objects;

        // Set orbit controls
        camera.position.z = 5;
        const controls = new OrbitControls(
            camera,
            renderer.domElement
        );
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;

        // Add an axes helper
        var axes = new axes_helper(container, camera, renderer.domElement);

        function animate() {
            stats.begin();
            renderer.render(scene, camera);

            axes.sync_camera(camera);
            axes.render();

            // reactive resizing, adapt to the canvas size
            if (resize_renderer_to_display(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
                axes.reposition();
            }
            controls.update();
            stats.end();
            requestAnimationFrame(animate);
        }
        animate();

        this.fullscreen_button(container);
    }

    fullscreen_button(container) {
        // Make a fullscreen button
        var btn = document.createElement("div");
        btn.classList.add("full-screen-button");
        btn.innerHTML = "<span class=\"full-screen\"><span>";
        container.appendChild(btn);

        btn.onclick = function() {
            toggleFullscreen(container);
        };
        btn.onmouseenter = function() {
            document.documentElement.style.setProperty('--fs-bg', 'rgba(90, 90, 90, 150)');
            document.documentElement.style.setProperty('--fs-fg', 'rgba(150, 150, 150, 150)');
        };
        btn.onmouseleave = function() {
            document.documentElement.style.setProperty('--fs-bg', 'rgba(30, 30, 30, 60)');
            document.documentElement.style.setProperty('--fs-fg', 'rgba(90, 90, 90, 60)');
        };
    }

    toggle_stats(is_enabled) {
        if (!is_enabled) {
            this.stats.dom.style.display = "none";
        } else {
            this.stats.dom.style.display = "block";
        }
    }

    draw_sphere(pos, radius, color) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshLambertMaterial({ color: new THREE.Color(color) });
        const sphere = new THREE.Mesh(geometry, material);
        this.objects.add(sphere);
        sphere.position.x = pos[0];
        sphere.position.y = pos[2];
        sphere.position.z = -pos[1];
    }

    draw_cube(pos, size, color) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshLambertMaterial({ color: new THREE.Color(color) });
        const cube = new THREE.Mesh(geometry, material);
        this.objects.add(cube);
        cube.position.x = pos[0];
        cube.position.y = pos[2];
        cube.position.z = -pos[1];
    }

    clear() {
        while(this.objects.children.length > 0){ 
            this.objects.remove(this.objects.children[0]); 
        }
    }
}

// export { ThreeCanvas };