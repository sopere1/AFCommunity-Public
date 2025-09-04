// *************************************************************
// Fields for Adding Camera Traps
// *************************************************************

import { FieldProps } from "./types";

const CAMERA_TYPES: string[] = [
    "BTC-6HD-940 Browning",
    "BTC-6HD-MAX Browning",
    "BTC-7E Browning",
    "BTC-6HDPX Browning",
    "BTC-5HDP Browning",
    "HC500 Reconyx",
    "HC550 Reconyx",
    "HF4K Covert Reconyx",
    "CamPark",
    "WOSPORTS Mini"
];

const CAMERA_IDS: string[] = [
    "USGSBR001",
    "USGSBR002",
    "USGSBR003",
    "USGSBR004",
    "USGSBR005",
    "USGSBR006",
    "USGSBR007",
    "USGSBR008",
    "USGSBR009",
    "USGSBR010",
    "USGSBR011",
    "USGSBR012",
    "USGSBR013",
    "USGSBR014",
    "USGSBR015",
    "USGSBR016",
    "USGSBR017",
    "USGSBR018",
    "USGSBR019",
    "USGSBR020",
    "USGSBR021",
    "USGSBR022",
    "USGSBR023",
    "USGSBR024",
    "USGSBR025",
    "USGSBR026",
    "USGSBR027",
    "AFCBR028",
    "AFCBR029",
    "AFCBR030",
    "AFCBR031",
    "AFCBR032",
    "AFCBR033",
    "AFCBR034",
    "AFCBR035",
    "AFCBR036",
    "AFCBR037",
    "AFCBR038",
    "AFCBR039",
    "AFCBR040",
    "AFCBR041",
    "AFCBR042",
    "AFCBR043",
    "AFCBR044",
    "AFCBR045",
    "AFCBR046",
    "AFCBR047",
    "AFCBR048",
    "OXYRE01",
    "OXYRE02",
    "OXYRE03",
    "OXYRE04",
    "OXYBR001",
    "OXYBR002",
    "OXYBR003",
    "OXYBR004",
    "OXYBR005",
    "OXYBR006",
    "OXYBR007",
    "OXYBR008",
    "OXYBR009",
    "OXYBR010",
    "OXYBR011",
    "OXYBR012",
    "OXYBR013",
    "OXYBR014",
    "OXYBR015",
    "CamPark1",
    "CamPark2",
    "CamPark3",
    "CamPark4",
    "CamPark5",
    "CamPark6",
    "WoSports Mini",
    "AFCRE1",
    "AFCRE2",
    "AFCRE3",
    "Other"
];

const LOCK_NUMBERS: string[] = [
    "399",
    "415",
    "Other"
];

export const CAMERA_TRAP_DEF = {
    site: {
        label: "Site Name",
        type: "text",
        required: true
    },
    crds: {
        label: "Coordinates (Lat, Lon)",
        type: "text",
        required: true
    },
    date: {
        name: "datetime",
        label: "Date/Time",
        type: "datetime",
        required: true
    },
    type: {
        label: "Camera Type",
        type: "dropdown",
        options: CAMERA_TYPES,
        required: true
    },
    camera_id: {
        label: "Camera ID",
        type: "dropdown",
        options: CAMERA_IDS,
        required: true
    },
    perc: {
        label: "Battery Percentage",
        type: "text",
        required: true
    },
    mem: {
        label: "Name of Memory Card",
        type: "text",
        required: true
    },
    lock: {
        label: "Lock Number",
        type: "dropdown",
        options: LOCK_NUMBERS,
        required: true
    },
    status: {
        name: "next",
        label: "Date of Next Set or Pull",
        type: "next-action",
        required: true,
    },
    comment: {
        label: "Comments",
        type: "text",
        required: true
    }
};

export const ADD_TRAP_FIELDS: FieldProps[] = Object.entries(CAMERA_TRAP_DEF).map(
    ([name, config]) => ({
        name,
        ...config,
    })
);

// *************************************************************
// Fields for Adding Wildlife Sightings 
// *************************************************************

const OBSERVATION_TYPES = [
    "Saw the animal.",
    "Heard the animal.",
    "Saw a remote sensing camera take a photo (e.g. wildlife trail camera, doorbell/security camera).",
    "Saw evidence of the animal’s presence (e.g. disturbed property, scat).",
    "Had a negative or dangerous interaction with the animal.",
    "Other"
]

export const WILD_SIGHT_DEF = {
    title: {
        label: "Title",
        type: "text",
        required: true
    },
    observer: {
        label: "Who Observed the Animal?",
        type: "dropdown",
        options: [
            "Me",
            "Other"
        ],
        required: true
    },
    location: {
        label: "Location of Sighting",
        type: "autocomplete",
        required: true
    },
    date: {
        name: "datetime",
        label: "Date/Time",
        type: "datetime",
        required: true
    },
    species: {
        label: "Species",
        type: "text",
        required: false
    },
    number: {
        label: "Number of Species Observed",
        type: "text",
        required: false
    },
    type: {
        label: "How was the Animal Observed?",
        type: "dropdown",
        options: OBSERVATION_TYPES,
        required: true
    },
    image: {
        name: "image",
        label: "Image of Sighting",
        type: "file",
        required: true
    },
    // photo upload + consent handling
    comments: {
        label: "Comments",
        type: "text",
        required: true
    },
}

export const ADD_SIGHT_FIELDS: FieldProps[] = Object.entries(WILD_SIGHT_DEF).map(
    ([name, config]) => ({
        name,
        ...config,
    })
);

// *************************************************************
// Fields for Geographic Areas
// *************************************************************

export const GEO_AREA_DEF = {
    name: {
        label: "Name of Area",
        type: "text",
        required: true
    },
    description: {
        label: "Brief Description of Area",
        type: "text",
        required: true
    },
    geom: {
        label: "Upload Area Geometry (GeoJSON)",
        type: "file",
        required: true
    }
}

export const ADD_AREA_FIELDS: FieldProps[] = Object.entries(GEO_AREA_DEF).map(
    ([name, config]) => ({
        name,
        ...config,
    })
);

// *************************************************************
// Fields for Communities
// *************************************************************

export const COMMUNITY_DEF = {
    name: {
        label: "Name of Community",
        type: "text",
        required: true
    },
    description: {
        label: "Brief Description of Community",
        type: "text",
        required: true
    },
    image: {
        name: "image",
        label: "Cover Image",
        type: "file",
        required: true
    },
}

export const ADD_COMMUNITY_FIELDS: FieldProps[] = Object.entries(COMMUNITY_DEF).map(
    ([name, config]) => ({
        name,
        ...config,
    })
);
