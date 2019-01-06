import * as THREE from 'three';
import { Scene, PerspectiveCamera, WebGLRenderer, OrbitControls as CameraControls } from 'three';
const OrbitControls = require('three-orbit-controls')(THREE);

class App {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: CameraControls;

    constructor() {
        this.render = this.render.bind(this);
        this.update = this.update.bind(this);
        this.viewLoop = this.viewLoop.bind(this);
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        this.viewLoop();
    }

    viewLoop() {
        requestAnimationFrame(this.viewLoop);
        this.update();
        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    update() {
        // update view
    }
}

export default App;