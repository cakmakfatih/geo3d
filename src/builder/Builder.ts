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
    objects: any;
    container: HTMLDivElement;

    constructor(container: HTMLDivElement) {
        this.container = container;
        this.objects = new Array<any>();
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

        // google maps https://maps.googleapis.com/maps/api/staticmap?center=41.00360,29.07107&zoom=15&size=1280x1280&maptype=roadmap&key=AIzaSyBd8aLg8GTphL37X1B0FmsJXamjJg8NU2Y

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
            color: 0xe5e5e5
        });

        let cube = new THREE.Mesh(geometry, material);
        cube.position.setY(2500);
        this.scene.add(cube);
    }

    addLights = () => {
        // to-do add lights
    }

    processData = (object: any) => {
        this.objects.push({id: object.id, name: object.name, type3d: object.type3d});

        object.features.forEach((i: any) => {
            switch(object.type3d) {
                case "3D_POLYGON":
                    this.add3DPolygon(i, object.id);
                    break;
                default:
                    break;
            }
        });
    }

    setOffsets = (coords: number[]) => {
        this.vectorGenerator = new VectorGenerator(undefined, coords);
        this.camera.position.set(1000, 1000, 1000);
        this.camera.lookAt(0, 0, 0);
        this.addGround(coords);
    }

    setVenueColor = (color: number, index: number) => {
        
    }

    add3DPolygon = (i: any, id: string) => {
        let material = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

        let sidesMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );

        let shape = new THREE.Shape();

        let startCoords = this.vectorGenerator.generateVector(i.geometry.coordinates[0][0][0]);

        shape.moveTo(startCoords.x, -startCoords.z);

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
                    shape.lineTo(scaledVector.x, -scaledVector.z);
                })
            });
        });

        let geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
        let object = new THREE.Mesh(geometry, [material, sidesMaterial]);
        
        object.rotation.x += -Math.PI / 2;
        object.position.setY(4);

        this.objects.find((i: any) => i.id === id).object = object;
        console.log(this.objects);
        this.scene.add(object);
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
                })
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