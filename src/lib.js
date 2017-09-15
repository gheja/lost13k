"use strict";

const PI = Math.PI;
const PI2 = 2 * PI;
// const PI2 = 6.283;

var _raf = window.requestAnimationFrame;

function _scale(x)
{
	return x * _windowScale;
}

function _x(x)
{
	return _windowWidth / 2 + _scale(x);
}

function _y(y)
{
	return _windowHeight / 2 + _scale(y);
}

function _rscale(x)
{
	return x / _windowScale;
}

function _rx(x)
{
	return _rscale(x) - _rscale(_windowWidth / 2);
}

function _ry(y)
{
	return _rscale(y) - _rscale(_windowHeight / 2);
}

function _parallax(x, distance)
{
	return x + 400 * (1 / (distance)) * (1 - _p);
}

function _parallaxPosition(p, distance)
{
	return {
		x: p.x,
		y: _parallax(p.y, distance)
	};
}

function screenCoordinates(p)
{
	return [ _x(p[0]), _y(p[1]) ];
}

function clamp(x, min, max)
{
	if (x < min)
	{
		return min;
	}
	
	if (x > max)
	{
		return max;
	}
	
	return x;
}

function sin(x)
{
	return Math.sin(x * PI2);
}

function cos(x)
{
	return Math.cos(x * PI2);
}

function randFloat()
{
	return Math.random();
}

function randPlusMinus(x)
{
	return (randFloat() - 0.5) * x * 2;
}

function goFullScreen()
{
	// based on https://developers.google.com/web/fundamentals/native-hardware/fullscreen/
	
	let d = window.document.documentElement;
	(d.requestFullscreen || d.mozRequestFullScreen || d.webkitRequestFullScreen || d.msRequestFullscreen).call(d);
}

function arrayPick(a)
{
	return a[Math.floor(randFloat() * a.length)];
}

/*
// Closure Compiler does not like ES6 at the moment for some reason
// "$jscomp is not defined"
function arrayShuffle(a)
{
	// thx https://stackoverflow.com/a/6274381/460571
	for (let i = a.length; i; i--)
	{
		let j = Math.floor(Math.random() * i);
		[a[i - 1], a[j]] = [a[j], a[i - 1]];
	}
}
*/

function arrayShuffle(a) {
	// thx https://stackoverflow.com/a/6274381/460571
	var j, x, i;
	
	for (i = a.length; i; i--)
	{
		j = Math.floor(Math.random() * i);
		x = a[i - 1];
		a[i - 1] = a[j];
		a[j] = x;
	}
}

function _arc(p, r, a, b, fill, stroke)
{
	ctx.beginPath();
	ctx.arc(_x(p.x), _y(p.y), _scale(r), a * PI2, b * PI2);
	if (fill)
	{
		ctx.fill();
	}
	
	if (stroke)
	{
		ctx.stroke();
	}
}



//// landscape
function hslaConvert(p, q, t)
{
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1/6) return p + (q - p) * 6 * t;
	if (t < 3/6) return q;
	if (t < 4/6) return p + (q - p) * 6 * (4/6 - t);
	return p
}

function hsla2rgba(h, s, l, a)
{
	// thanks Mohsen! https://stackoverflow.com/a/9493060/460571
	let p, q, r, g, b;
	
	if (l < 0.5)
	{
		q = l * (1 + s);
	}
	else
	{
		q = l + s - l * s;
	}
	
	p = 2 * l - q;
	
	r = Math.floor(hslaConvert(p, q, h + 1/3) * 255);
	g = Math.floor(hslaConvert(p, q, h) * 255);
	b = Math.floor(hslaConvert(p, q, h - 1/3) * 255);
	
	return [ r, g, b, a ];
}

function hsla2rgba_(h, s, l, a)
{
	let c;
	
	c = hsla2rgba(h, s, l, a);
	
	return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + c[3] + ")";
}



//// 3drotate
function pos2(x, y, z, a, b)
{
	let s = sin(b);
	let c = cos(b);
	let s2 = sin(a);
	let c2 = cos(a);
	let distortion = 0.0025;
	let p, x2, y2, w;
	
	w = Math.pow(10, z / 10);
	
	x2 = c2 * x + s2 * y;
	y2 = s2 * x - c2 * y;
	
	return [
		(x2 * c) * w,
		(y2 + s * x2 * y2 * distortion) * w
	];
}

function getDistance(p1, p2)
{
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getAngle(p1, p2)
{
	return Math.atan2(p1.y - p2.y, p2.x - p1.x) / PI2;
}

//// event handling
function eventMouseDown(e)
{
	let exception;
	
	if (_firstUserInteraction)
	{
		// do not throw an error when music is still loading
		try
		{
			musicStart();
			_firstUserInteraction = false;
		}
		catch (exception)
		{
		}
	}
	
	eventMouseMove(e);
	_cursor.clicked = true;
}

function eventMouseMove(e)
{
	e.preventDefault();
	_cursor.x = _rx(e.clientX * window.devicePixelRatio);
	_cursor.y = _ry(e.clientY * window.devicePixelRatio);
}

function eventResize()
{
	let i;
	
	_windowWidth = window.innerWidth * window.devicePixelRatio;
	_windowHeight = window.innerHeight * window.devicePixelRatio;
	_windowScale = Math.min(_windowWidth, _windowHeight) / 400;
	_windowMax = Math.max(_windowWidth, _windowHeight);
	
	for (i=0; i<_layers.length; i++)
	{
		_layers[i].canvas.width = _windowWidth;
		_layers[i].canvas.height = _windowHeight;
		_layers[i].canvas.style.width = (_windowWidth / window.devicePixelRatio) + 'px';
		_layers[i].canvas.style.height = (_windowHeight / window.devicePixelRatio) + 'px';
	}
}

function tryToConsumeResource()
{
	if (_zenMode)
	{
		return true;
	}
	
	if (_resources[_highlightedResourceCode] != 0)
	{
		_resources[_highlightedResourceCode]--;
		return true;
	}
	
	return false;
}


//// canvas layers
function layerCreate(drawFunction)
{
	let a;
	
	a = { visible: false, canvas: document.createElement("canvas"), draw: drawFunction };
	
	a.ctx = a.canvas.getContext("2d");
	
	_body.appendChild(a.canvas);
	
	_layers.push(a);
	
	// OR, to return index:
	// return _layers.push(a) - 1;
}

function draw()
{
	let i, time;
	
	_raf(draw);
	
	time = (new Date()).getTime();
	_dt = (time - _lastFrameTime) / 1000;
	_lastFrameTime = time;
	
	_lastSceneTime = _sceneTime;
	_sceneTime += _dt;
	_totalTime += _dt;
	
	if (_animation.position != 1)
	{
		_sceneTime = 0;
	}
	
	_textBubble.timeLeft -= _dt;
	
	_highlightedResourceCode = -1;
	
	drawMain();
	
	for (i=0; i<_layers.length; i++)
	{
		_layers[i].canvas.style.display = _layers[i].visible ? "block" : "none";
		if (_layers[i].visible)
		{
			canvas = _layers[i].canvas;
			ctx = _layers[i].ctx;
			
			// reset to some default values
			ctx.globalCompositeOperation = "source-over";
			ctx.lineCap = "butt";
			ctx.miterLimit = 1;
			ctx.lineJoin = "round";
			ctx.fillStyle = "#000";
			
			_layers[i].draw.call();
			
			if (DEBUG_BORDER == 1)
			{
				ctx.lineWidth = 1;
				
				ctx.beginPath();
				ctx.rect(_x(-350), _y(-180), _scale(700), _scale(355));
				ctx.strokeStyle = "#ff0";
				ctx.stroke();
				
				ctx.beginPath();
				ctx.rect(_x(-200), _y(-180), _scale(400), _scale(355));
				ctx.rect(_x(-200), _y(-200), _scale(400), _scale(400));
				ctx.strokeStyle = "#f00";
				ctx.stroke();
				
			}
		}
	}
	
	drawTextBubble();
	
	// reset clicking state
	_cursor.clicked = false;
}



///// common gui elements
function drawCircularSelection(p, radius)
{
	let a, c;
	
	ctx.lineCap = "butt";
	ctx.lineWidth = _scale(2);
	
	c = _totalTime;
	
	ctx.strokeStyle = "#fff";
	
	_arc(p, radius, c + 0/6, c + 1/6, 0, 1);
	_arc(p, radius, c + 2/6, c + 3/6, 0, 1);
	_arc(p, radius, c + 4/6, c + 5/6, 0, 1);
}

function drawGuiStripe(x, y, width, color, outline)
{
	ctx.beginPath();
	ctx.moveTo(_x(x), _y(y));
	ctx.lineTo(_x(x + width), _y(y));
	ctx.lineTo(_x(x + width - 8), _y(y + 12));
	ctx.lineTo(_x(x + - 8), _y(y + 12));
	ctx.closePath();
	
	ctx.strokeStyle = color;
	ctx.fillStyle = color;
	
	if (outline)
	{
		ctx.lineWidth = _scale(5);
		ctx.stroke();
		
		ctx.strokeStyle = "#000";
		ctx.lineWidth = _scale(2);
		ctx.stroke();
	}
	
	ctx.fill();
}

function drawGuiBase(skipStripes)
{
	let i;
	
	if (!skipStripes)
	{
		for (i = -400; i < 400; i += 20)
		{
			drawGuiStripe(i, -196, 10, "#222", false);
			drawGuiStripe(i, 184, 10, "#222", false);
		}
	}
}

function drawGuiButton(title, x, size, enabled, callback)
{
	let c;
	
	if (_animation.position < 1)
	{
		enabled = false;
	}
	
	c = "#0ac";
	
	if (enabled)
	{
		if (_cursor.x > x * 20 - 5 && _cursor.x < x * 20 + size * 20 - 10 + 5 && _cursor.y > 175)
		{
			if (_cursor.clicked)
			{
				c = "#0ac";
				callback.call();
			}
			else
			{
				c = "#fff";
			}
		}
	}
	else
	{
		c = "#222";
	}
	
	drawGuiStripe(x * 20, 184, size * 20 - 10, c, true);
	ctx.fillStyle = "#000";
	ctx.textAlign = "center";
	ctx.font = _scale(10) + "px Arial";
	ctx.fillText(title, _x(x * 20 + (size - 1) * 10 + 1), _y(184 + 9.5));
}

function drawGuiResource(title, resourceCode, x, size)
{
	let background, foreground;
	
	// empty
	if (_resources[resourceCode] == 0)
	{
		background = "rgba(0,0,0,0.8)";
		foreground = "#777";
		
		if (_highlightedResourceCode == resourceCode)
		{
			background = "#d00";
			foreground = "#fff";
		}
	}
	else // available
	{
		background = "rgba(0,128,0,0.6)";
		foreground = "#0a0";
		
		if (_highlightedResourceCode == resourceCode)
		{
			background = "rgba(0,255,0,0.8)";
			foreground = "#fff";
		}
	}
	
	drawGuiStripe(x * 20, -196, size * 20 - 10, background, false);
	ctx.fillStyle = foreground;
	ctx.textAlign = "center";
	ctx.font = _scale(9) + "px Arial";
	ctx.fillText(title + ": " + (_zenMode ? "\u221E" : _resources[resourceCode]), _x(x * 20 + (size - 1) * 10 + 1), _y(-196 + 9.5));
}

function drawGuiResources()
{
	drawGuiResource("Long jump fuel", RESOURCE_LONG_JUMP, -7, 5);
	drawGuiResource("Short jump fuel", RESOURCE_SHORT_JUMP, -2, 5);
	drawGuiResource("Rocket fuel", RESOURCE_ROCKET, 3, 5);
}

function drawShip(p, scale)
{
	let i, a;
	
	_drawShapeLineWidth = 8 * scale;
	
	drawMultipleShape([
		[ SHAPE_SHIP, { x: 0, y: 0 }, 10, "#755", "#533" ],
		[ SHAPE_SHIP_WINDOW1, { x: 0, y: 0 }, 10, "#3ac", "#533" ],
		[ SHAPE_SHIP_WINDOW2, { x: 0, y: 0 }, 10, "#3ac", "#533" ],
		[ SHAPE_SHIP_DOOR, { x: 0, y: 0 }, 10, "#322", "#533" ],
		[ SHAPE_SHIP_CARGO, { x: 0, y: 0 }, 10, "#722", "#611" ],
		[ SHAPE_SHIP_CARGO, { x: 130, y: 0 }, 10, "#960", "#750" ],
		[ SHAPE_SHIP_CARGO, { x: 260, y: 0 }, 10, "#02b", "#018" ],
		[ SHAPE_SHIP_CARGO, { x: 390, y: 0 }, 10, "#070", "#050" ],
	], p, scale);
	
	_drawShapeLineWidth = 2;
}

function drawCat()
{
	let i, a, scale, shapes;
	
	scale = 1;
	
	ctx.fillStyle = "#000"
	ctx.strokeStyle = "#900";
	ctx.lineWidth = _scale(2 * scale);
	
	// states: 0: sleeping, 1: awake, 2: running 1, 3: running 2
	
	shapes = [];
	
	if (_cat.state == 0 || _cat.state == 1)
	{
		shapes.push([ SHAPE_CAT_BODY_SLEEPING, { x: 0, y: 0 }, 10, _cat.colors[0], _cat.colors[1] ]);
	}
	
	switch (_cat.state)
	{
		case 0:
			shapes.push([ SHAPE_CAT_HEAD_AWAKE, { x: 50, y: -16 }, 10, _cat.colors[0], _cat.colors[1] ]);
		break;
		case 1:
			shapes.push(
				[ SHAPE_CAT_HEAD_AWAKE, { x: 50, y: -40 }, 10, _cat.colors[0], _cat.colors[1] ],
				[ SHAPE_CAT_EYE, { x: 75, y: -65 }, 10, null, _cat.colors[2] ],
				[ SHAPE_CAT_EYE, { x: 115, y: -65 }, 10, null, _cat.colors[2] ]
			);
		break;
		case 2:
			shapes.push(
				[ SHAPE_CAT_BODY_RUNNING_1, { x: 0, y: 40 }, 10, _cat.colors[0], _cat.colors[1] ],
				[ SHAPE_CAT_HEAD_RUNNING, { x: 230, y: 0 }, 10, _cat.colors[0], _cat.colors[1] ],
				[ SHAPE_CAT_EYE, { x: 280, y: -60 }, 10, null, _cat.colors[2] ]
			);
		break;
		case 3:
			shapes.push(
				[ SHAPE_CAT_BODY_RUNNING_2, { x: 0, y: 40 }, 10, _cat.colors[0], _cat.colors[1] ],
				[ SHAPE_CAT_HEAD_RUNNING, { x: 230, y: 0 }, 10, _cat.colors[0], _cat.colors[1] ],
				[ SHAPE_CAT_EYE, { x: 280, y: -60 }, 10, null, _cat.colors[2] ]
			);
		break;
	}
	
	drawMultipleShape(shapes, _parallaxPosition(_cat.position, 1.6), 0.15);
}

function showTextBubble(text)
{
	_textBubble.timeLeft = text.length * TEXT_BUBBLE_TIME;
	_textBubble.huge = false;
	_textBubble.text = text;
}

function drawTextBubble()
{
	let i, fontHeight, padding, boxLeft, boxTop, boxWidth, boxHeight, n, a, m;
	
	if (_textBubble.timeLeft <= 0)
	{
		return;
	}
	
	fontHeight = 12;
	
	ctx.strokeStyle = "#fff";
	ctx.fillStyle = "#fff";
	padding = 2;
	
	if (!_textBubble.huge)
	{
		boxWidth = _scale(200);
		boxLeft = _x(_playerPosition.x) - boxWidth * 0.8;
	}
	else
	{
		boxWidth = _scale(400);
		boxLeft = _x(-200);
	}
	
	
	boxHeight = _scale((fontHeight + 2) * _textBubble.text.length + _scale(padding * 2));
	boxTop = Math.round(_y(_playerPosition.y - 10) - boxHeight);
	
	ctx.font = _scale(fontHeight) + "px Arial";
	ctx.textAlign = "left";
	
	ctx.lineWidth = _scale(2);
	ctx.beginPath();
	ctx.moveTo(boxLeft, boxTop);
	ctx.lineTo(boxLeft, boxTop + boxHeight);
	ctx.lineTo(_x(_playerPosition.x - 5), _y(_playerPosition.y - 10));
	ctx.lineTo(_x(_playerPosition.x), _y(_playerPosition.y - 5));
	ctx.lineTo(_x(_playerPosition.x + 5), _y(_playerPosition.y - 10));
	ctx.lineTo(boxLeft + boxWidth, boxTop + boxHeight);
	ctx.lineTo(boxLeft + boxWidth, boxTop);
	ctx.closePath();
	
	ctx.fill();
	ctx.stroke();
	
	m = Math.round(_scale(fontHeight + 2));
	
	ctx.fillStyle = "#000";
	
	for (i=0; i<_textBubble.text.length; i++)
	{
		ctx.fillText(_textBubble.text[i], boxLeft + _scale(5), boxTop + (i + 1) * m + _scale(padding));
	}
}

function drawShape(shape, p, scale, fill, stroke)
{
	let i;
	
	ctx.beginPath();
	for (i=0; i<shape.length; i+=2)
	{
		if (i == 0)
		{
			ctx.moveTo(_x(shape[i] * scale + p.x), _y(shape[i+1] * scale + p.y));
		}
		else
		{
			ctx.lineTo(_x(shape[i] * scale + p.x), _y(shape[i+1] * scale + p.y));
		}
	}
	
	if (fill)
	{
		ctx.fillStyle = fill;
		ctx.fill();
	}
	
	if (stroke)
	{
		ctx.strokeStyle = stroke;
		ctx.lineWidth = _scale(_drawShapeLineWidth);
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.stroke();
	}
}

function drawMultipleShape(shapes, p, scale)
{
	let i;
	
	for (i=0; i<shapes.length; i++)
	{
		drawShape(shapes[i][0], { x: shapes[i][1].x * scale + p.x, y: shapes[i][1].y * scale + p.y }, shapes[i][2] * scale, shapes[i][3], shapes[i][4]);
	}
}
