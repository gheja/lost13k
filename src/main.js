let _windowWidth;
let _windowHeight;
let _windowScale;
let _lowFps = 0;

let canvas = null;
let ctx = null;

let _body = null;
let _layers = [];
// let _frameNumber = 0;

let _currentSystem = null;;
let _selectedSystem = null;
let _currentBody = null;
let _selectedBody = null;
let _catLocationBody = null;
let _map = null;
let _cursor = { x: 0, y: 0, clicked: false };

let _resources = [ 3, 3, 3 ];
let _highlightedResourceCode = -1;

let _lastFrameTime = 0;
let _dt = 0;
let _totalTime = 0;
let _sceneTime = 0;

function drawMain()
{
	animationStep();
}

function loseTheCat()
{
	let i, j;
	
	while (1)
	{
		for (i=0; i<_map.path.length; i++)
		{
			for (j=1; j<_map.path[i].bodies.length; j++)
			{
				if (randFloat() < 0.001)
				{
					_catLocationBody = _map.path[i].bodies[j];
					return;
				}
			}
		}
	}
}

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
	loseTheCat();
	
	console.log(describeBody(_catLocationBody));
}

function init()
{
	let tmp;
	
	_lastFrameTime = (new Date()).getTime();
	
	_body = document.body;
	_body.onmousedown = eventMouseDown;
	_body.onmousemove = eventMouseMove;
	_body.onresize = eventResize;
	
	layerCreate(drawSolar); // planets
	layerCreate(drawStarMap); // star map
	layerCreate(drawLandscape); // landscape
	layerCreate(drawWormhole); // wormhole
	
	restartWormhole();
	
	eventResize();
	
	_layers[1].visible = true;
	
	reset();
	
	draw();
}

window.onload = init;
