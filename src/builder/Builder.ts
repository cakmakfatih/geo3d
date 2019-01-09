import * as THREE from 'three';
import { Scene, PerspectiveCamera, WebGLRenderer, OrbitControls as CameraControls, Line, Vector3 } from 'three';
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
    venueColor: number;

    constructor(data: any, container: HTMLDivElement) {
        this.data = data;
        this.venueColor = 0x000000;

        this.render = this.render.bind(this);
        this.update = this.update.bind(this);
        this.viewLoop = this.viewLoop.bind(this);
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.shadowMap.enabled = true;
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

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        this.addSkybox();
        this.viewLoop();
    }

    addSkybox() {
        // to-do add skybox
        let geometry = new THREE.BoxGeometry(5000, 5000, 5000);

        let textureLoader = new THREE.TextureLoader();

        // https://api.mapbox.com/styles/v1/mapbox/light-v9/static/29.07107,41.00360,15.0,0,0/1280x1280?access_token=pk.eyJ1IjoiY2FrbWFrZmF0aWgiLCJhIjoiY2pxcGk1d3ZrMDFwYjQ5bzFqNncyYjl2NyJ9.MtGJZ74Cu-6R7K52rFrNeQ

        let map = textureLoader.load("staticmap.png");

        map.minFilter = THREE.LinearFilter;

        let mat = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: map
        });

        let cube = new THREE.Mesh(geometry, mat);
        cube.position.setY(2500);

        this.scene.add(cube);
    }

    addLights() {
        // to-do add lights
    }

    processData(data: any) {
        data.features.forEach((i:any) => {
            switch(i.geometry.type){
                case "MultiPolygon":
                    this.addMultiPolygon(i);
                    break;
                default:
                    break;
            }
        });
    }

    setOffsets(coords: number[]) {
        this.vectorGenerator = new VectorGenerator(undefined, coords[0], coords[1]);
    }

    setVenueColor(color: number){
        this.venue.material.color.setHex(color);
    }

    add3DPolygon(i: any) {
        let material = new THREE.MeshBasicMaterial({
            color: this.venueColor
        });

        let sidesMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );

        let shape = new THREE.Shape();

        let startCoords = this.vectorGenerator.generateVector(i.geometry.coordinates[0][0][0]);

        shape.moveTo(startCoords.x, startCoords.z);

        let extrudeSettings = {
            steps: 2,
            depth: 4,
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 1,
            bevelSegments: 1
        };

        i.geometry.coordinates.forEach((j: any) => {
            j.forEach((k: any) => {
                k.slice(1).forEach((q: any) => {
                    let scaledVector: ScaledVector = this.vectorGenerator.generateVector(q);
                    shape.lineTo(scaledVector.x, scaledVector.z);
                })
            });
        });

        let geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
        let mesh = new THREE.Mesh(geometry, [material, sidesMaterial]);
        
        mesh.rotation.x += -Math.PI / 2;

        this.scene.add(mesh);
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
        this.venue.position.setY(1);

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