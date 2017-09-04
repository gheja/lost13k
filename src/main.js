let canvas = null;
let ctx = null;

let _body = null;
let _layers = [];
let _frameNumber = 0;

let _map = null;
let _cursor = { x: 0, y: 0, clicked: false };


function drawMain()
{
	_layers[0].visible = document.getElementById("layer0").checked;
	_layers[1].visible = document.getElementById("layer1").checked;
	_layers[2].visible = document.getElementById("layer2").checked;
}

function reset()
{
	lastFrameTime = (new Date()).getTime();
	
	_map = {
		stars: [],
		path: {
			valid: false,
			steps: [],
			stepsShown: PATH_STEPS + 1
		}
	};
	
	regenerateStars();
	regeneratePath();
	regenerateBodies();
	regenerateLandscape();
}

function init()
{
	let tmp;
	
	_body = document.body;
	_body.onmousedown = eventMouseDown;
	_body.onmousemove = eventMouseMove;
	
	layerCreate("planets", drawSolar);
	layerCreate("starmap", drawStarMap);
	layerCreate("landscape", drawLandscape);
	
	reset();
	
	draw();
}

window.onload = init;