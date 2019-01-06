import { Scene, PerspectiveCamera, WebGLRenderer, OrbitControls as CameraControls } from 'three';
declare class App {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: CameraControls;
    constructor();
    viewLoop(): void;
    render(): void;
    update(): void;
}
export default App;
