import { Scene, PerspectiveCamera, WebGLRenderer, OrbitControls as CameraControls } from 'three';
declare class App {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: CameraControls;
    constructor(data: any);
    viewLoop(): void;
    render(): void;
    update(): void;
}
export default App;
