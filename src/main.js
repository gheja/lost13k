let _windowWidth;
let _windowHeight;
let _windowScale;
let _windowMax;
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
	huge: false,
	text: []
};
let _cats = [ ];
let _cat = null;
let _gameState = 0;

let _playerPosition = { x: 0, y: 0 };

let _audioCtx;
let _audioSourceObj;
let _firstUserInteraction = true;
let _logRescues = false;
let _totalCatsRescued = 0;
let _zenMode = false;
let _drawShapeLineWidth = 2.5;

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

function gameFinish(newGameState)
{
	animationStart(animationTitleShow, 1);
	_gameState = newGameState;
}

function drawMain()
{
	animationStep();
}

function toggleRecap()
{
	let i, u;
	
	u = [];
	
	if (_textBubble.timeLeft > 0)
	{
		_textBubble.timeLeft = 0;
		return;
	}
	
	if (!_zenMode)
	{
		for (i=0; i<_cats.length; i++)
		{
			if (_cats[i].location != null)
			{
				u = u.concat(breakText(_cats[i].name + " was " + describeBody(_cats[i].location) + ".", 60));
			}
		}
	}
	else
	{
		u = [ "Everyone is on board.", "Let's explore the galaxy!" ];
	}
	
	showTextBubble(u);
	_textBubble.huge = true;
	_textBubble.timeLeft = 9999;
}

function setupTheCats(countToLose)
{
	let i, j, l;
	
	_cats = [
		// if location == null then the cat is on the ship
		{ colors: [ "#222", "#444", "#ff0" ], location: null, name: "Bobby", himHer: "him" },
		{ colors: [ "#eee", "#ccc", "#06b" ], location: null, name: "Marshmallow", himHer: "her" },
		{ colors: [ "#777", "#999", "#0df" ], location: null, name: "Bubble", himHer: "her" },
		{ colors: [ "#c61", "#a51", "#1f3" ], location: null, name: "Winston", himHer: "him" }
	];
	
	// make sure the first cat lost is Winston
	if (_totalCatsRescued != 0)
	{
		arrayShuffle(_cats);
	}
	
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
					
					if (countToLose == 0)
					{
						return;
					}
				}
			}
		}
	}
}

function reset(countToLose, logRescues, resources)
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
	
	_zenMode = countToLose == 0;
	
	regenerateStars();
	regeneratePath();
	regenerateAllBodies();
	setupTheCats(countToLose);
	
	_resources[0] = resources[0];
	_resources[1] = resources[1];
	_resources[2] = resources[2];
	
	// _logRescues = logRescues;
	_logRescues = true;
	
	_gameState = GAME_STATE_INTRO;
	_sceneTime = 0;
	_p4 = 0;
}

function resetEasy()
{
	reset(1, false, [ 5, 5, 5 ]);
}

function resetNormal()
{
	reset(1, true, [ 3, 3, 3 ]);
}

function resetHard()
{
	reset(2, true, [ 5, 5, 5 ]);
}

function resetHarder()
{
	reset(3, true, [ 5, 5, 5 ]);
}

function resetZen()
{
	reset(0, false, [ 999, 999, 999 ]);
}

function musicGenerate()
{
	let exception;
	
	try
	{
		let songGen = new sonantx.MusicGenerator(_music);
		_audioCtx = new AudioContext();
		
		songGen.createAudioBuffer(function(buffer) {
			_audioSourceObj = _audioCtx.createBufferSource();
			_audioSourceObj.loop = true;
			_audioSourceObj.buffer = buffer;
			_audioSourceObj.connect(_audioCtx.destination);
		});
	}
	catch (exception)
	{
	}
}

function musicStart()
{
	_audioSourceObj.start();
}

function shareOnTwitter()
{
	window.open("https://twitter.com/intent/tweet?text=All%20my%20cats%20are%20now%20back%20on%20board!%0APlay%20Where%20is%20Winston%20%23js13k%20game%20by%20%40gheja_%20here:%20js13kgames.com%2Fentries%2Fwhere-is-winston");
}

function init()
{
	let tmp;
	
	_lastFrameTime = (new Date()).getTime();
	
	_body = document.body;
	_body.addEventListener("touchstart", eventMouseDown);
	_body.addEventListener("mousedown", eventMouseDown);
	_body.addEventListener("mousemove", eventMouseMove);
	window.addEventListener("orientationchange", eventResize);
	window.addEventListener("resize", eventResize);
	
	layerCreate(drawSolar); // planets
	layerCreate(drawStarMap); // star map
	layerCreate(drawLandscape); // landscape
	layerCreate(drawWormhole); // wormhole
	layerCreate(drawTitle); // title/game over/restart screen
	
	restartWormhole();
	
	eventResize();
	
	musicGenerate();
	
	// title screen
	_layers[4].visible = true;
	
	_totalCatsRescued = _get("totalCatsRescued", 0);
	
	if (_totalCatsRescued == 0)
	{
		resetEasy();
	}
	else
	{
		_gameState = GAME_STATE_NEW;
	}
	
	draw();
}

window.onload = init;
