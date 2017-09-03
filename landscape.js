"use strict";

const PALETTE_LENGTH = 5000;

let landscapeSettings = {
	h1: 0,
	s1: 0.2,
	l1: 0.3,
	
	h2: 0.16,
	s2: 1.0,
	l2: 0.59,
	
	pow: 3.42,
	
	density: 0.32,
	
	position: 0,
	palette: [],
	
	autoUpdate: false,
	autoPosition: true,
	hillColor: "",
	
	stars: [],
	moons: [],
	sun: null,
	hill1: [],
	hill2: []
};

let _p = 0;

function landscapeLerp(a, b, x)
{
	return a + (b - a) * Math.pow(x, landscapeSettings.pow);
}

function buildLandscapePalette()
{
	let i, a;
	
	for (i=0; i<PALETTE_LENGTH; i++)
	{
		a = i / PALETTE_LENGTH;
		
		landscapeSettings.palette[i] = hsla2rgba_(
			landscapeLerp(landscapeSettings.h1, landscapeSettings.h2, a),
			landscapeLerp(landscapeSettings.s1, landscapeSettings.s2, a),
			landscapeLerp(landscapeSettings.l1, landscapeSettings.l2, a),
			Math.pow(a, 1 - landscapeSettings.density * 0.88)
		);
	}
}

function drawLandscape()
{
	let i, n, c1, c2, a, p1, p2;
	
	if (landscapeSettings.autoPosition)
	{
		landscapeSettings.position += (1 - landscapeSettings.position) * 0.005 + 0.001;
		if (landscapeSettings.position > 1.1)
		{
			regenerateLandscape();
			landscapeSettings.position = 0;
		}
	}
	
	_p = clamp(landscapeSettings.position, 0, 1);
	
	a = 1;
	
	if (landscapeSettings.autoUpdate)
	{
		buildLandscapePalette();
	}
	
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	ctx.fillStyle = "rgba(255,255,255,0.5)";
	for (i=0; i<landscapeSettings.stars.length; i++)
	{
		_arc(landscapeSettings.stars[i].x, _parallax(landscapeSettings.stars[i].y, 10), 2, 0, 1, 1);
	}
	
	// sun mask - no stars between planet and sun please
	ctx.fillStyle = "#000";
	_arc(landscapeSettings.sun.x, _parallax(landscapeSettings.sun.y, 5), landscapeSettings.sun.radius, 0, 1, 1);
	
	// moons
	for (i=0; i<landscapeSettings.moons.length; i++)
	{
		ctx.fillStyle = landscapeSettings.moons[i].color;
		_arc(landscapeSettings.moons[i].x, _parallax(landscapeSettings.moons[i].y, 4), landscapeSettings.moons[i].radius, 0, 1, 1);
	}
	
	// atmosphere
	for (i=0; i<HEIGHT; i++)
	{
		n = clamp(Math.floor((i / HEIGHT * PALETTE_LENGTH) * (Math.pow((_p + 0.2), 0.9))), 0, PALETTE_LENGTH - 1);
		
		ctx.fillStyle = landscapeSettings.palette[n];
		ctx.fillRect(0, i, WIDTH, 1);
	}
	
	// sun
	ctx.globalCompositeOperation = 'screen';
	ctx.fillStyle = landscapeSettings.sun.color;
	_arc(landscapeSettings.sun.x, _parallax(landscapeSettings.sun.y, 5), landscapeSettings.sun.radius, 0, 1, 1);
	
	function puthill(hill, top, p)
	{
		let i;
		
		ctx.beginPath();
		ctx.moveTo(0, _scale(_parallax(top, p)) + HEIGHT / 2);
		for (i=0; i<hill.length; i++)
		{
			ctx.lineTo((i + 1) * WIDTH / hill.length, _scale(_parallax(hill[i] * 30 + top, p)) + HEIGHT / 2);
		}
		ctx.lineTo(WIDTH, HEIGHT);
		ctx.lineTo(0, HEIGHT);
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
	// ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function regenerateLandscape()
{
	let i, n, a;
	
	landscapeSettings.h1 = Math.random();
	if (randFloat() < 0.5)
	{
		landscapeSettings.h2 = landscapeSettings.h1 - 0.1 - Math.random() * 0.5;
	}
	else
	{
		landscapeSettings.h2 = landscapeSettings.h1 + 0.1 + Math.random() * 0.5;
		landscapeSettings.h2 = landscapeSettings.h1 + 0.1 + Math.random() * 0.5;
	}
	landscapeSettings.s2 = 0.2 + randFloat() * 0.5;
	landscapeSettings.pow = randFloat();
	landscapeSettings.density = randFloat();
	
	landscapeSettings.stars.length = 0;
	for (i=0; i<500; i++)
	{
		landscapeSettings.stars.push({ x: randPlusMinus(1200), y: randPlusMinus(1200) });
	}
	
	n = Math.floor(randFloat() * 3);
	landscapeSettings.moons.length = 0;
	for (i=0; i<n; i++)
	{
		a = arrayRandom(BODY_TYPE_DEFINITIONS[BODY_TYPE_MOON]);
		landscapeSettings.moons.push({
			x: randPlusMinus(180),
			y: randPlusMinus(40) - 130,
			color: hsla2rgba_(a[0], a[1], a[2], 1),
			radius: randFloat() * 25 + 5
		});
	}
	
	a = arrayRandom(BODY_TYPE_DEFINITIONS[BODY_TYPE_STAR]);
	landscapeSettings.sun = {
		x: randPlusMinus(60) - 120,
		y: randPlusMinus(40) + 80,
		color: hsla2rgba_(a[0], a[1], a[2], 1),
		radius: randFloat() * 30 + 50
	};
	
	a = arrayRandom(BODY_TYPE_DEFINITIONS[BODY_TYPE_PLANET]);
	landscapeSettings.hillColor = hsla2rgba_(a[0], a[1], a[2], 1);
	
	landscapeSettings.hill1.length = 0;
	landscapeSettings.hill2.length = 0;
	for (i=0; i<=10; i++)
	{
		landscapeSettings.hill1.push(randFloat());
		landscapeSettings.hill2.push(randFloat());
	}
	
	buildLandscapePalette();
}
