"use strict";

const PALETTE_LENGTH = 5000;
let landscapeSettings = null;

let _p = 1;
let _p2 = 1;
let _p3 = 1;
let _p3Reversed = false;

function passingSceneTime(x)
{
	if (_lastSceneTime < x && _sceneTime >= x)
	{
		return true;
	}
	
	return false;
}

function landscapeLerp(a, b, x, pow)
{
	return a + (b - a) * Math.pow(x,pow);
}

function buildLandscapePalette(settings)
{
	let i, a, result;
	
	settings.palette = [];
	
	for (i=0; i<PALETTE_LENGTH; i++)
	{
		a = i / PALETTE_LENGTH;
		
		settings.palette[i] = hsla2rgba_(
			landscapeLerp(settings.h1, settings.h2, a, settings.pow),
			landscapeLerp(settings.s1, settings.s2, a, settings.pow),
			landscapeLerp(settings.l1, settings.l2, a, settings.pow),
			Math.pow(a, 1 - settings.density * 0.88)
		);
	}
}

function landscapeLeave()
{
	animationStart(animationPlanetLeaving, 1);
	consumeResource();
	_cursor.clicked = false;
	_layers[0].visible = true;
	// _layers[2].visible = false;
}

function shake(power, distance)
{
	return randFloat() * distance * power;
}

function drawLandscape()
{
	let i, n, c1, c2, p1, p2;
	
	_p = clamp(_p2, 0, 1);
	
	ctx.fillRect(0, 0, _windowWidth, _windowHeight);
	
	ctx.fillStyle = "rgba(255,255,255,0.5)";
	for (i=0; i<landscapeSettings.stars.length; i++)
	{
		_arc(_parallaxPosition(landscapeSettings.stars[i], 10), 2, 0, 1, 1);
	}
	
	// sun mask - no stars between planet and sun please
	ctx.fillStyle = "#000";
	_arc(_parallaxPosition(landscapeSettings.sun, 5), landscapeSettings.sun.radius, 0, 1, 1);
	
	// moons
	for (i=0; i<landscapeSettings.moons.length; i++)
	{
		ctx.fillStyle = landscapeSettings.moons[i].color;
		_arc(_parallaxPosition(landscapeSettings.moons[i], 4), landscapeSettings.moons[i].radius, 0, 1, 1);
	}
	
	// atmosphere
	for (i=0; i<_windowHeight; i++)
	{
		n = clamp(Math.floor((i / _windowHeight * PALETTE_LENGTH) * (Math.pow((_p + 0.2), 0.9))), 0, PALETTE_LENGTH - 1);
		
		ctx.fillStyle = landscapeSettings.palette[n];
		ctx.fillRect(0, i, _windowWidth, 1);
	}
	
	// sun
	ctx.globalCompositeOperation = 'screen';
	ctx.fillStyle = landscapeSettings.sun.color;
	_arc(_parallaxPosition(landscapeSettings.sun, 5), landscapeSettings.sun.radius, 0, 1, 1);
	
	function puthill(hill, top, p)
	{
		let i;
		
		ctx.beginPath();
		ctx.moveTo(0, _scale(_parallax(top, p)) + _windowHeight / 2);
		for (i=0; i<hill.length; i++)
		{
			ctx.lineTo((i + 1) * _windowWidth / hill.length, _scale(_parallax(hill[i] * 30 + top, p)) + _windowHeight / 2);
		}
		ctx.lineTo(_windowWidth, _windowHeight);
		ctx.lineTo(0, _windowHeight);
		ctx.fill();
	}
	
	// hill mask
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = "#000";
	puthill(landscapeSettings.hill1, 80.5, 2);
	
	// hills
	ctx.globalCompositeOperation = 'screen';
	puthill(landscapeSettings.hill1, 80.5, 2);
	ctx.fillStyle = landscapeSettings.hillColor;
	puthill(landscapeSettings.hill1, 80, 2);
	puthill(landscapeSettings.hill2, 120, 1.6);
	
	ctx.globalCompositeOperation = 'source-over';
	// sun color:
	ctx.fillStyle = hsla2rgba_(0.0, 1, 0.5, 0.33);
	puthill(landscapeSettings.hill1, 80, 2);
	
	i = _windowHeight * (1 - _p3);
	
	drawShip({ x: 200 + shake(1 - _p, 10), y: 100 - Math.pow(1 - _p, 0.7) * 400 + shake(1 - _p, 4) }, 5);
	_playerPosition.x = 200;
	_playerPosition.y = 100;
	
	if (_p3 < 1)
	{
		ctx.fillStyle = "#000";
		
		if (!_p3Reversed)
		{
			ctx.clearRect(0, 0, _windowWidth, i - _scale(5));
			ctx.fillRect(0, i - _scale(5), _windowWidth, _scale(5));
		}
		else
		{
			ctx.clearRect(0, i + _scale(5), _windowWidth, _windowHeight - i + _scale(5));
			ctx.fillRect(0, i, _windowWidth, _scale(5));
		}
	}
	
	if (_cat)
	{
		if (_animation.position == 1)
		{
			if (passingSceneTime(1))
			{
				showTextBubble([ _cat.name + "!" ]);
			}
			
			if (passingSceneTime(1.5))
			{
				_cat.state = 1;
			}
			
			if (_sceneTime > 2 && _sceneTime < 10)
			{
				n = Math.floor((_sceneTime - 2) * 5);
				_cat.position.x = -160 + n * 10;
				_cat.state = n % 2 ? 2 : 3;
			}
			
			if (passingSceneTime(10))
			{
				_cat.position.x = 1000;
			}
			
			if (passingSceneTime(10.5))
			{
				// _cat.position.x = 1000;
			}
			
			if (passingSceneTime(11.5))
			{
				showTextBubble([ "Good to see you again, " + arrayPick([ "buddy", _cat.name ]) + "." ]);
			}
			
			if (passingSceneTime(13))
			{
				_cat.location = null;
			}
			
			if (passingSceneTime(15))
			{
				if (checkWinCondition())
				{
					popupWin();
				}
			}
		}
		
		drawCat();
	}
	
	if (_animation.position == 1)
	{
		_highlightedResourceCode = RESOURCE_ROCKET;
	}
	
	drawGuiButton("LEAVE", 3, 3, true, landscapeLeave);
	drawGuiResources();
}

function generateOrLoadLandscape()
{
	let i, n, a, settings;
	
	if (_currentBody.landscapeSettings == null)
	{
		settings = {};
		
		settings.h1 = Math.random();
		settings.s1 = 0.2;
		settings.l1 = 0.3;
		
		if (randFloat() < 0.5)
		{
			settings.h2 = settings.h1 - 0.1 - Math.random() * 0.5;
		}
		else
		{
			settings.h2 = settings.h1 + 0.1 + Math.random() * 0.5;
			settings.h2 = settings.h1 + 0.1 + Math.random() * 0.5;
		}
		settings.s2 = 0.2 + randFloat() * 0.5;
		settings.l2 = 0.6;
		
		settings.pow = randFloat();
		settings.density = randFloat();
		
		settings.stars = [];
		for (i=0; i<500; i++)
		{
			settings.stars.push({ x: randPlusMinus(1200), y: randPlusMinus(1200) });
		}
		
		settings.moons = [];
		for (i=0; i<_currentBody.childCount; i++)
		{
			a = _currentBody.def;
			
			settings.moons.push({
				x: randPlusMinus(180),
				y: randPlusMinus(40) - 130,
				color: hsla2rgba_(a[0], a[1], a[2], 1),
				radius: randFloat() * 25 + 5
			});
		}
		
		a = _currentSystem.bodies[0].def;
		
		settings.sun = {
			x: randPlusMinus(60) - 120,
			y: randPlusMinus(40) + 80,
			color: hsla2rgba_(a[0], a[1], a[2], 1),
			radius: randFloat() * 30 + 50
		};
		
		a = _currentBody.def;
		
		settings.hillColor = hsla2rgba_(a[0], a[1], a[2], 1);
		
		settings.hill1 = [];
		settings.hill2 = [];
		for (i=0; i<=10; i++)
		{
			settings.hill1.push(randFloat());
			settings.hill2.push(randFloat());
		}
		
		buildLandscapePalette(settings);
		
		_currentBody.landscapeSettings = settings;
	}
	
	landscapeSettings = _currentBody.landscapeSettings;
}
