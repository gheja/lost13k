"use strict";

let hasBeginning = true;
let hasEnd = true;
let starsTotal = 300;

let starsToRestart = 0;
let finished = false;

let canvas1 = null;
let ctx1 = null;

let canvas = null;
let ctx = null;
let body = null;
let gui = null;

let viewZ = 0;
let viewZStep = 0.5;
let lastFrameTime = 0;

let palette = [];

let settings = {
	a: 0,
	b: 0,
	distortion: 0.0025,
	n: 30,
	z: 1,
	
	autoB: false,
	autoUpdate: true
};

let settings2 = {
	steps: 40,
	stars: 250,
	diffA: 0.001,
	diffB: 0.001
};


let csteps = [];
let cstars = [];
let va = 0;
let vb = 0;
let vx = -5;
let vy = -5;

function getStarColor()
{
	// let x = [ "acf", "cde", "eef", "ffd", "ffa", "fe6", "fa3" ];
	// return "#" + x[Math.floor(randFloat() * x.length) ];
	
	// return hsla2rgba_(0.55 + randPlusMinus(0.075), 1, 0.75 + randPlusMinus(0.125), 0.5 + randPlusMinus(0.25));
	
	return hsla2rgba_(0.53 + randPlusMinus(0.06), 1, 0.6 + randPlusMinus(0.25), 1);
}

function generateStars()
{
	let i, x, y;
	
	cstars = [];
	
	for (i=0; i<settings2.stars; i++)
	{
		x = 0;
		y = 0;
		
		while (Math.sqrt(x * x + y * y) < 300)
		{
			x = randPlusMinus(600);
			y = randPlusMinus(600);
		}
		
		cstars.push({ x: x, y: y, z: - randFloat() * 20, length: randFloat() * 10, size: randFloat() * 12 + 2, color: getStarColor() });
	}
}

function pushStep(shift)
{
	if (shift)
	{
		viewZ += viewZStep;
		csteps.shift();
	}
	
	va = clamp(va + randPlusMinus(0.0005), -0.03, 0.03);
	vb = clamp(vb + randPlusMinus(0.0005), -0.025, 0.025);
	vx = clamp(vx + randPlusMinus(2), -20, 20);
	vy = clamp(vy + randPlusMinus(2), -20, 20);
	
	csteps.push({ a: va, b: vb, x: vx, y: vy });
}

function generateSteps()
{
	let i;
	
	csteps = [];
	
	for (i=0; i<settings2.steps; i++)
	{
		pushStep(false);
	}
}

//// main

let frameNumber = 0;

function draw()
{
	let i, j, k, p, lastP, star, a, b, x, y, z, c, now, dt, lineStarted;
	
	_raf(draw);
	
	now = (new Date()).getTime();
	dt = now - lastFrameTime;
	frameNumber++;
	
	lastFrameTime = now;
	
	if (finished)
	{
		return;
	}
	
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "#000";
	
	if (frameNumber < 100)
	{
		ctx.clearRect(0, 0, _windowWidth, _windowHeight);
		z = 0;
	}
	else if (frameNumber < 100)
	{
	}
	else
	{
		ctx.fillRect(0, 0, _windowWidth, _windowHeight);
		ctx.globalCompositeOperation = "destination-out";
		ctx.fillStyle = "#000";
		z = 100;
	}
	
	a = _windowWidth / 2;
	b = _windowHeight / 2;
	ctx.beginPath();
	ctx.moveTo(a, b)
	for (i=0; i<(frameNumber - z) * 3; i++)
	{
		c = _scale(i * i * i / 1500);
		ctx.lineTo(a + cos(-i/30) * c, b + sin(-i/30) * c);
	}
	ctx.fill();
	ctx.globalCompositeOperation = "lighter";
	
	ctx.lineWidth = _scale(1);
	
	for (i=0; i<cstars.length; i++)
	{
		star = cstars[i];
		
		k = 0;
		a = 0;
		b = 0;
		x = 0;
		y = 0;
		z = 0;
		lastP = null;
		
		for (j=0; j<settings2.steps; j++)
		{
			a += csteps[j].a;
			b += csteps[j].b;
			x += csteps[j].x;
			y += csteps[j].y;
			z -= viewZStep;
			
			ctx.strokeStyle = star.color;
			
			if (z - viewZ >= star.z - star.length && z - viewZ < star.z)
			{
				p = screenCoordinates(pos2(star.x + x, star.y + y, z, a, b));
				
				if (lastP !== null)
				{
					c = _scale(Math.pow(10, z / 10) * star.size);
					
					if (c >= 0.1)
					{
						ctx.beginPath();
						ctx.lineWidth = c;
						ctx.moveTo(lastP[0], lastP[1]);
						ctx.lineTo(p[0], p[1]);
						ctx.stroke()
					}
				}
				
				lastP = [ p[0], p[1] ];
			}
		}
		
		if (star.z + viewZ > 1)
		{
			if (starsToRestart > 0 || !hasEnd)
			{
				star.z -= 20;
				starsToRestart--;
			}
		}
	}
	
	pushStep(true);
}

function restartWormhole()
{
	generateStars();
	
	if (hasBeginning)
	{
		viewZ = -20;
	}
	else
	{
		viewZ = 0;
	}
	
	if (hasEnd)
	{
		starsToRestart = starsTotal;
	}
}

function init()
{
	let tmp;
	
	canvas1 = document.createElement("canvas");
	canvas1.width = _windowWidth;
	canvas1.height = _windowHeight;
	ctx1 = canvas1.getContext("2d");
	ctx1.fillStyle = "#600";
	ctx1.fillRect(0, 0, _windowWidth, _windowHeight);
	
	canvas = document.createElement("canvas");
	canvas.width = _windowWidth;
	canvas.height = _windowHeight;
	ctx = canvas.getContext("2d");
	
	body = document.body;
	body.appendChild(canvas1);
	body.appendChild(canvas);
	
	generateSteps();
	restartWormhole();
	
	lastFrameTime = (new Date()).getTime();
	
	draw();
	
	if (hasBeginning)
	{
		body.onclick = restartWormhole;
	}
}

var _raf = window.requestAnimationFrame;

window.onload = init;
