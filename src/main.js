let canvas = null;
let ctx = null;

let _body = null;
let _layers = [];
let _frameNumber = 0;

let _currentSystem = null;;
let _selectedSystem = null;
let _currentBody = null;
let _selectedBody = null;
let _map = null;
let _cursor = { x: 0, y: 0, clicked: false };


function reset()
{
	lastFrameTime = (new Date()).getTime();
	
	// pos: { x: float, y: float }
	// body: ...
	// system: { mapPosition: pos, bodies: [ body, body, ... ], visited: boolean, current: boolean }
	// systems: [ system, system, system ],
	// path: [ system, system, ... ]
	
	_map = {
		systems: [ ],
		path: [ ]
	};
	
	regenerateStars();
	regeneratePath();
	regenerateAllBodies();
	// regenerateLandscape();
}

function init()
{
	let tmp;
	
	_body = document.body;
	_body.onmousedown = eventMouseDown;
	_body.onmousemove = eventMouseMove;
	
	layerCreate(drawSolar); // planets
	layerCreate(drawStarMap); // star map
	layerCreate(drawLandscape); // landscape
	
	_layers[1].visible = true;
	
	reset();
	
	draw();
}

window.onload = init;
