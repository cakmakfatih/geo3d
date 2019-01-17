import * as THREE from 'three';
import { Scene, PerspectiveCamera, WebGLRenderer, OrbitControls as CameraControls, Vector3 } from 'three';
import { VectorGenerator, ScaledVector } from '../models/scaledvector.model';
const OrbitControls = require('three-orbit-controls')(THREE);

class Builder {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: CameraControls;
    vectorGenerator: VectorGenerator;
    project: any;
    container: HTMLDivElement;

    constructor(container: HTMLDivElement) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(90, this.container.getBoundingClientRect().width / this.container.getBoundingClientRect().height, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize(this.container.getBoundingClientRect().width, this.container.getBoundingClientRect().height);
        this.container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.renderer.setSize(this.container.getBoundingClientRect().width, this.container.getBoundingClientRect().height);
            this.camera.aspect = this.container.offsetWidth / this.container.getBoundingClientRect().height;
            this.camera.updateProjectionMatrix();
        });

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.maxPolarAngle = 30;
        this.controls.maxPolarAngle = 70;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 2000;

        this.addSkybox();
        this.viewLoop();
    }

    addGround(coords: number[]) {
        var geometry = new THREE.PlaneGeometry( 10000, 10000, 32 );
        let textureLoader = new THREE.TextureLoader();

        let mapImage = `https://api.mapbox.com/styles/v1/mapbox/streets-v10/static/${coords[0]},${coords[1]},15.0,0,0/1280x1280?access_token=pk.eyJ1IjoiY2FrbWFrZmF0aWgiLCJhIjoiY2pxcGk1d3ZrMDFwYjQ5bzFqNncyYjl2NyJ9.MtGJZ74Cu-6R7K52rFrNeQ`;

        let map = textureLoader.load(mapImage);

        map.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        map.minFilter = THREE.LinearFilter;

        var material = new THREE.MeshBasicMaterial({map: map, side: THREE.DoubleSide});

        let ground = new THREE.Mesh(geometry, material);
        ground.rotation.x -= Math.PI/2;

        this.scene.add(ground);
    }

    addSkybox = () => {
        let geometry = new THREE.BoxGeometry(10000, 10000, 10000);

        let material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: 0xdddddd
        });

        let cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
    }

    addLights = () => {
        // to-do add lights
    }

    openProject = (project: any) => {
        this.project = Object.assign({}, project, {objects: project.objects.map((i: any) => Object.assign({}, i))});

        this.setOffsets([this.project.coordinates.lat, this.project.coordinates.lon]);
        
        this.project.objects.forEach((i: any) => {
            this.processData(i);
        });
    }

    processData = (object: any) => {
        object.data.features.forEach((i: any) => {
            switch(object.type3d) {
                case "3D_POLYGON":
                    this.add3DPolygon(i, object.id, object.settings);
                    break;
                default:
                    break;
            }
        });
    }

    setOffsets = (coords: any) => {
        this.project.coordinates = coords;

        this.vectorGenerator = new VectorGenerator(undefined, coords);
        this.camera.position.set(1000, 1000, 1000);
        this.camera.lookAt(0, 0, 0);
        this.addGround(coords);
    }

    add3DPolygon = (i: any, id: string, settings: any) => {
        let material = new THREE.MeshBasicMaterial({
            color: parseInt(settings.material.color, 16)
        });

        let sidesMaterial = new THREE.MeshBasicMaterial({ color: parseInt(settings.material.sideColor, 16), side: THREE.DoubleSide });

        let shape = new THREE.Shape();

        let startCoords = this.vectorGenerator.generateVector(i.geometry.coordinates[0][0][0]);

        shape.moveTo(startCoords.x, -startCoords.z);

        i.geometry.coordinates.forEach((j: any) => {
            j.forEach((k: any) => {
                k.slice(1).forEach((q: any) => {
                    let scaledVector: ScaledVector = this.vectorGenerator.generateVector(q);
                    shape.lineTo(scaledVector.x, -scaledVector.z);
                });
            });
        });

        let geometry = new THREE.ExtrudeBufferGeometry(shape, settings.extrude);
        let item = new THREE.Mesh(geometry, [material, sidesMaterial]);
        
        item.rotation.x += -Math.PI / 2;
        item.position.setY(settings.extrude.depth / 2);

        this.project.objects.find((i: any) => i.id === id).item = item;

        this.scene.add(item);
    }

    addMultiPolygon = (i: any) => {
        let material = new THREE.LineBasicMaterial({
            color: 0xffffff
        });
        
        let geometry = new THREE.Geometry();

        i.geometry.coordinates.forEach((j: any) => {
            j.forEach((k: any) => {
                k.forEach((q: any) => {
                    let scaledVector: ScaledVector = this.vectorGenerator.generateVector(q);
                    let vector: Vector3 = new THREE.Vector3(scaledVector.x, scaledVector.y, scaledVector.z);

                    geometry.vertices.push(vector);
                });
            });
        });

        let line = new THREE.Line(geometry, material);
        line.position.setY(1);
        
        this.scene.add(line);
    }

    viewLoop = () => {
        requestAnimationFrame(this.viewLoop);
        this.update();
        this.render();
    }

    render = () => {
        this.renderer.render(this.scene, this.camera);
    }

    update = () => {
        // update view
    }
}

export default Builder;