import type { GeoJsonObject } from 'geojson';
import { CAMERA_TRAP_DEF, WILD_SIGHT_DEF } from "./fields";

// Information for the current user
export type User = {
    uid: string;
    role: string;
    idToken: string;
} | null;

// Supports dynamic creation for sidebar input forms
export type FieldProps = {
    name: string;
    label: string;
    type: string;
    options?: string[];
    required: boolean;
};

// Holds information for camera traps
export type Camera = {
    [key in keyof typeof CAMERA_TRAP_DEF]: string;
} & {
    owner: string;
    status: string;
}

// Holds information for wildlife sightings
export type Sighting = {
    [key in keyof typeof WILD_SIGHT_DEF]: string;
} & {
    owner: string;
    crds: string;
    url: string;
}

// Holds information for user-defined geographic areas
export type GeoArea = {
    name: string;
    description: string;
    geom: GeoJsonObject;
    numCameras: number;
    numSightings: number;
    numSpecies: number;
    speciesDist: Record<string, number>;
    observerDist: Record<string, number>;
    hourBins: number[];
};

// Holds information for communities
export type Community = {
    owner: string;
    name: string;
    description: string;
    code: string;
    imageUrl: string;
};
