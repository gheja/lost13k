let _windowWidth;
let _windowHeight;
let _windowScale;
let _lowFps = 0;

let canvas = null;
let ctx = null;

let _body = null;
let _layers = [];

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
let _lastSceneTime = 0;

let _textBubble = {
	timeLeft: 0,
	text: []
};
let _cats = [ ];
let _cat = null;
let _gameState = 0;

let _playerPosition = { x: 0, y: 0 };

function checkWinCondition()
{
	let i;
	
	for (i=0; i<_cats.length; i++)
	{
		if (_cats[i].location != null)
		{
			return false;
		}
	}
	
	return true;
}

function popupWin()
{
	animationStart(animationTitleShow, 1);
	_gameState = GAME_STATE_WON;
}

function drawMain()
{
	animationStep();
}

function setupTheCats(countToLose)
{
	let i, j, l;
	
	_cats = [
		// if location == null then the cat is on the ship
		{ colors: [ "#222", "#444", "#ff0" ], location: null, name: "Bobby" },
		{ colors: [ "#eee", "#ccc", "#06b" ], location: null, name: "Marshmallow" },
		{ colors: [ "#777", "#999", "#0df" ], location: null, name: "Bubble" },
		{ colors: [ "#c61", "#a51", "#1f3" ], location: null, name: "Winston" }
	];
	
	arrayShuffle(_cats);
	
	while (countToLose > 0)
	{
		for (i=0; i<_map.path.length; i++)
		{
			for (j=1; j<_map.path[i].bodies.length; j++)
			{
				if (randFloat() < 0.001)
				{
					// always lose the last cat in the array
					_cats[4 - countToLose].location = _map.path[i].bodies[j];
					countToLose--;
					
					console.log(_map.path[i].bodies[j]);
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
		path: [ ],
		noiseLayers: [ ]
	};
	
	_map.noiseLayers.push(
		getNoiseLayer(3, [ 120, 0, 120 ]),
		getNoiseLayer(2, [ 0, 128, 255 ]),
		getNoiseLayer(3, [ 255, 120, 0 ])
	);
	
	regenerateStars();
	regeneratePath();
	regenerateAllBodies();
	setupTheCats(1);
	
	_gameState = GAME_STATE_INTRO;
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
	layerCreate(drawTitle); // title/game over/restart screen
	
	restartWormhole();
	
	eventResize();
	
	_layers[4].visible = true;
	
	reset();
	
	draw();
}

window.onload = init;
