"use strict";

function generateBody(parent, size, r, speed, type)
{
	let a = {
		parent: parent,
		def: arrayPick(BODY_TYPE_DEFINITIONS[type]),
		radiusBase: size,
		radiusScale: randFloat(),
		radius: 0,
		orbitRadius: r,
		orbitPosition: randFloat(),
		center: { x: 0, y: 0 },
		position: { x: 0, y: 0 },
		speed: speed * (randFloat() + 0.5) * 5 * 60,
		type: type,
		childCount: 0,
		landscapeSettings: null,
		visited: false
	};
	
	a.radius = a.radiusBase * (a.radiusScale + 0.8);
	
	if (parent)
	{
		parent.childCount++;
	}
	
	// randomize color a bit
	a.def[0] *= 1 + randPlusMinus(0.025);
	
	return a;
}

function updateBodies()
{
	let i, b;
	
	for (i=0; i<_currentSystem.bodies.length; i++)
	{
		b = _currentSystem.bodies[i];
		b.orbitPosition += b.speed * _dt;
		
		if (b.type == BODY_TYPE_STAR)
		{
			b.center.x = 0;
			b.center.y = 0;
			b.position.x = 0;
			b.position.y = 0;
		}
		else
		{
			b.center.x = b.parent.position.x;
			b.center.y = b.parent.position.y;
			b.position.x = b.center.x + cos(b.orbitPosition) * b.orbitRadius;
			b.position.y = b.center.y + sin(b.orbitPosition) * b.orbitRadius;
		}
	}
}

function drawBodies()
{
	let i, j, a, b, c, stripes, clicked;
	
	ctx.fillStyle = "#211";
	ctx.fillRect(0, 0, _windowWidth, _windowHeight);
	ctx.lineCap = "round";
	
	for (i=0; i<_currentSystem.bodies.length; i++)
	{
		b = _currentSystem.bodies[i];
		
		if (b.type == BODY_TYPE_PLANET)
		{
			ctx.lineWidth = _scale(1.5);
		}
		else
		{
			ctx.lineWidth = _scale(1);
		}
		
		if (!_lowFps)
		{
			stripes = b.orbitRadius * 0.8;
			
			for (j=0; j<stripes; j++)
			{
				c = ((stripes - j) / stripes);
				
				if (b.type == BODY_TYPE_PLANET)
				{
					ctx.strokeStyle = hsla2rgba_(b.parent.def[0], b.parent.def[1], b.parent.def[2], c);
				}
				else
				{
					ctx.strokeStyle = "rgba(0,200,255," + c + ")";
				}
				
				a = b.orbitPosition - j * 2 * 1/(stripes * 2 * 1.1);
				
				_arc(b.center, b.orbitRadius, a - 1 / (stripes * 5), a, 0, 1);
			}
		}
		else
		{
			ctx.strokeStyle = "#444";
			_arc(b.center, b.orbitRadius, 0, 1, 0, 1);
		}
	}
	
	ctx.globalCompositeOperation = "source-over";
	
	for (i=0; i<_currentSystem.bodies.length; i++)
	{
		b = _currentSystem.bodies[i];
		
		if (b.visited)
		{
			ctx.lineWidth = _scale(2);
			ctx.strokeStyle = "#0a0";
			_arc(b.position, b.radius + 1.5, 0, 1, 0, 1);
			// drawCircularSelection(b.position, b.radius + 2, 10, 600, "#0a0");
		}
		
		// planet
		if (b.type == BODY_TYPE_PLANET)
		{
			// atmosphere
			ctx.lineWidth = _scale(1);
			ctx.strokeStyle = hsla2rgba_(0.4, 0.2, 0.8, 0.7);
			_arc(b.position, b.radius + 1.5, 0, 1, 0, 1);
		}
		
		ctx.fillStyle = hsla2rgba_(b.def[0], b.def[1], b.def[2], 1);
		_arc(b.position, b.radius, 0, 1, 1);
		
		// no shadow on the star
		if (b.type == BODY_TYPE_STAR)
		{
			continue;
		}
		
		// planet
		if (b.type == BODY_TYPE_PLANET)
		{
			c = b.orbitPosition + 0.25;
		}
		// moon
		else
		{
			c = b.parent.orbitPosition + 0.25;
		}
		
		if (!_lowFps)
		{
			// sunny side
			ctx.fillStyle = hsla2rgba_(_currentSystem.bodies[0].def[0], _currentSystem.bodies[0].def[1], _currentSystem.bodies[0].def[2], 0.2);
			_arc(b.position, b.radius, 0, 1, 1);
		}
		
		// shadow
		ctx.fillStyle = "rgba(0,0,0,0.4)";
		_arc(b.position, b.radius, c - 0.5, c, 1);
	}
	
	clicked = false;
	
	if (_cursor.clicked && _cursor.y > -180 && _cursor.y < 180)
	{
		clicked = true;
		_selectedBody = null;
	}
	
	for (i=0; i<_currentSystem.bodies.length; i++)
	{
		b = _currentSystem.bodies[i];
		
/*
		if (b == _currentBody)
		{
			ctx.fillStyle = "#040";
			ctx.lineWidth = _scale(2);
			_arc(b.position, b.radius + 4, 0, 1, 0, 1);
		}
*/
		
		if (b.type != BODY_TYPE_STAR)
		{
			
			if (getDistance(b.position, _cursor) < b.radius + 4 || _selectedBody == b)
			{
				if (clicked)
				{
					_selectedBody = b;
				}
				drawCircularSelection(b.position, b.radius + 2);
				
				break;
			}
		}
	}
}

function describeBodySize(b)
{
	if (b.radiusScale < 0.15)
	{
		return "tiny";
	}
	
	if (b.radiusScale < 0.25)
	{
		return "small";
	}
	
	if (b.radiusScale < 0.75)
	{
		return "medium sized";
	}
	
	if (b.radiusScale < 0.85)
	{
		return "big";
	}
	
	return "huge";
}

function describeMoons(b)
{
	if (b.childCount == 0)
	{
		return "no moons";
	}
	
	if (b.childCount == 1)
	{
		return "a moon";
	}
	
	return "a few moons";
}

function describeBody(b)
{
	let star;
	let s;
	
	s = "Oh, now I remember! Must be on ";
	
	if (b.type == BODY_TYPE_MOON)
	{
		s += "the [" + describeBodySize(b) + "] [" + b.def[3] + "] moon of ";
		
		// hack but cheap
		b = b.parent;
	}
	
	star = b.parent;
	s += "a [" + describeBodySize(b) + "] [" + b.def[3] + "] planet [with " + describeMoons(b) + "], ";
	
	s += "orbiting a [" + star.def[3] + "] sun."
	
	console.log(s);
}

function generateBodies()
{
	let i, j, a, result, planetCount, moonCount;
	
	result = [];
	
	result.push(generateBody(null, 13, 0, 0, BODY_TYPE_STAR));
	
	planetCount = Math.round(randFloat() * 3 + 1);
	
	for (i=0; i<planetCount; i++)
	{
		a = result.push(generateBody(result[0], 5, i * 40 + 45, 0.0001, BODY_TYPE_PLANET)) - 1;
		
		moonCount = Math.round(randFloat() * 3);
		
		for (j=0; j<moonCount; j++)
		{
			result.push(generateBody(result[a], 2, j * 8 + 8 + result[a].radius, 0.0005, BODY_TYPE_MOON));
		}
	}
	
	return result;
}

function regenerateAllBodies()
{
	let i;
	
	for (i=0; i<_map.systems.length; i++)
	{
		_map.systems[i].bodies = generateBodies();
	}
}

function solarNext()
{
}

function solarLand()
{
	_currentBody = _selectedBody;
	_currentBody.visited = true;
	
	generateOrLoadLandscape();
	animationStart(animationPlanetLanding, 5);
	
	_cat.state = 0;
	_cat.position = { x: -160, y: 140 };
	
	_cursor.clicked = false;
	// _layers[0].visible = false;
	_layers[2].visible = true;
}

function solarZoom()
{
	animationStart(animationSystemZoomOut, 0.5);
	
	_cursor.clicked = false;
	// _layers[0].visible = false;
	_layers[1].visible = true;
}

function drawSolar()
{
	ctx.fillRect(0, 0, _windowWidth, _windowHeight);
	
	updateBodies();
	drawBodies();
	
	_playerPosition.x = 160;
	_playerPosition.y = 150 + (Math.sin(_totalTime) * 5);
	
	drawShip(_playerPosition, 1.5);
	
	drawGuiButton("\u00BB", 2, 1, true, solarNext);
	drawGuiButton("LAND", 3, 3, (_selectedBody != null), solarLand);
	drawGuiButton("ZOOM", 6, 3, true, solarZoom);
	drawGuiResources();
}
