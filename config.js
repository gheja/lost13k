"use strict";

// const WIDTH = 1920;
// const HEIGHT = 1080;
// const WIDTH = 480;
// const HEIGHT = 270;
const WIDTH = 960;
const HEIGHT = 540;
const SCALE = Math.min(HEIGHT, WIDTH) / 400;

const BODY_TYPE_STAR = 0;
const BODY_TYPE_PLANET = 1;
const BODY_TYPE_MOON = 2;

// [ [ h, s, l, type ], [ ... ], ... ]
let BODY_TYPE_DEFINITIONS =
[
	// star == 0
	[ [ 0.13, 1.0, 0.7, "warm" ], [ 0.5, 0.4, 0.9, "cold" ], [ 0, 0.8, 0.4, "dying red" ] ],
	
	// planet == 1
	[ [ 0.55, 0.5, 0.8, "icy" ], [ 0.25, 0.5, 0.5, "forest" ], [ 0.12, 0.7, 0.5, "deserted" ], [ 0, 0.5, 0.5, "rusty red" ] ],
	
	// moon == 2
	[ [ 0.55, 0.2, 0.9, "icy" ], [ 0, 0.0, 0.3, "rocky" ] ]
];
