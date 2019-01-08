import * as THREE from 'three';
import { Scene, PerspectiveCamera, WebGLRenderer, OrbitControls as CameraControls, Vector3, Line } from 'three';
import { VectorGenerator, ScaledVector } from '../models/scaledvector.model';
const OrbitControls = require('three-orbit-controls')(THREE);

class Builder {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: CameraControls;
    vectorGenerator: VectorGenerator;
    data: any;
    venue: Line;
    venueColor: 0x00ff00;

    constructor(data: any, container: HTMLDivElement) {
        this.data = data;

        this.render = this.render.bind(this);
        this.update = this.update.bind(this);
        this.viewLoop = this.viewLoop.bind(this);
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(container.getBoundingClientRect().width, window.innerHeight);
        container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.renderer.setSize(container.getBoundingClientRect().width, window.innerHeight);
            this.camera.aspect = container.offsetWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });

        this.camera.position.z = 50;
        this.camera.position.y = 50;
        this.camera.position.x = 100;
        this.camera.lookAt(30, 40, 60);

        this.processData();

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.viewLoop();
    }

    processData() {
        this.setOffsets();
        this.data.features.forEach((i:any) => {
            switch(i.geometry.type){
                case "MultiPolygon":
                    this.addMultiPolygon(i);
                    break;
                default:
                    break;
            }
        });
    }

    setOffsets() {
        let coords = this.data.features.find((i: any) => typeof i.properties.DISPLAY_XY !== "undefined").properties.DISPLAY_XY.coordinates;

        this.vectorGenerator = new VectorGenerator(undefined, coords[0], coords[1]);
    }

    setVenueColor(color: number){
        this.venue.material.color.setHex(color);
    }

    addMultiPolygon(i: any) {
        let material = new THREE.LineBasicMaterial({
            color: this.venueColor
        });
        
        let geometry = new THREE.Geometry();

        i.geometry.coordinates.forEach((j: any) => {
            j.forEach((k: any) => {
                k.forEach((q: any) => {
                    let scaledVector: ScaledVector = this.vectorGenerator.generateVector(q);

                    let vector: Vector3 = new THREE.Vector3(scaledVector.x, scaledVector.y, scaledVector.z);

                    geometry.vertices.push(vector);
                })
            });
        });

        this.venue = new THREE.Line(geometry, material);

        this.scene.add(this.venue);
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

export default Builder;