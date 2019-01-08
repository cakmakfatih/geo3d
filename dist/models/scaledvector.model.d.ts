export declare class VectorGenerator {
    multiplier: number;
    xOffset: number;
    zOffset: number;
    x: number;
    y: number;
    z: number;
    constructor(multiplier: number, xOffset: number, zOffset: number);
    generateVector(coords: number[], y?: number): ScaledVector;
}
export interface ScaledVector {
    x: number;
    y: number;
    z: number;
}
