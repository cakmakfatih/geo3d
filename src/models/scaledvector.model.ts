export class VectorGenerator {
    multiplier: number;
    xOffset: number;
    zOffset: number;

    x: number;
    y: number;
    z: number;

    constructor(multiplier: number = 100000, xOffset: number, zOffset: number){
        this.multiplier = multiplier || 100000;

        this.xOffset = xOffset*this.multiplier;
        this.zOffset = zOffset*this.multiplier;
    }

    generateVector(coords: number[], y: number = 1): ScaledVector {
        return {
            x: coords[0]*this.multiplier - this.xOffset,
            y: y,
            z: coords[1]*this.multiplier - this.zOffset
        } as ScaledVector;
    }    
}

export interface ScaledVector {
    x: number;
    y: number;
    z: number;
};