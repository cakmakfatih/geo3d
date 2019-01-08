import { Scene, PerspectiveCamera, WebGLRenderer, OrbitControls as CameraControls } from 'three';
import { VectorGenerator } from './models/scaledvector.model';
declare class App {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: CameraControls;
    vectorGenerator: VectorGenerator;
    data: any;
    constructor(data: any);
    processData(): void;
    setOffsets(): void;
    addMultiPolygon(i: any): void;
    viewLoop(): void;
    render(): void;
    update(): void;
}
export default App;
