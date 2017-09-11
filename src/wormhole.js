"use strict";

const WORMHOLE_STEPS = 40;
const WORMHOLE_STARS = 150;
const WORMHOLE_VIEW_Z_STEP = 0.5;
const WORMHOLE_FADE_DURATION = 1;

let viewZ = 0;
let viewZX = 0;
let lastFrameTime = 0;

let csteps = [];
let cstars = [];
let va = 0;
let vb = 0;
let vx = -5;
let vy = -5;

function getStarColor()
{
	return hsla2rgba_(0.53 + randPlusMinus(0.06), 1, 0.6 + randPlusMinus(0.25), 1);
}

function generateStars()
{
	let i, x, y;
	
	cstars = [];
	
	for (i=0; i<WORMHOLE_STARS; i++)
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
		csteps.shift();
	}
	
	va = clamp(va + randPlusMinus(0.0005), -0.03, 0.03);
	vb = clamp(vb + randPlusMinus(0.0005), -0.025, 0.025);
	vx = clamp(vx + randPlusMinus(2), -20, 20);
	vy = clamp(vy + randPlusMinus(2), -20, 20);
	
	csteps.push({ a: va, b: vb, x: vx, y: vy });
}

function wormholeViewStep()
{
	let a;
	
	a = WORMHOLE_VIEW_Z_STEP *(_dt * 60);
	
	viewZ += a;
	viewZX += a;
	
	while (viewZX > 1)
	{
		pushStep(true);
		viewZX -= 1;
	}
}

function generateSteps()
{
	let i;
	
	csteps = [];
	
	for (i=0; i<WORMHOLE_STEPS; i++)
	{
		pushStep(false);
	}
}

//// main

let wormholeFrameNumber = 0;

function drawWormhole()
{
	let i, j, k, p, lastP, star, a, b, x, y, z, c, now, dt, lineStarted, state;
	
	wormholeFrameNumber++;
	
	// default:
	// ctx.globalCompositeOperation = "source-over";
	// ctx.fillStyle = "#000";
	
	// if (wormholeFrameNumber < 60)
	if (_animation.time < WORMHOLE_FADE_DURATION)
	{
		// fade in
		state = 0;
		ctx.clearRect(0, 0, _windowWidth, _windowHeight);
		x = _animation.time / WORMHOLE_FADE_DURATION;
	}
	else if (_animation.time < _animation.duration - WORMHOLE_FADE_DURATION)
	{
		// running
		state = 1;
	}
	else
	{
		// fade out
		state = 2;
		x = (_animation.time - (_animation.duration - WORMHOLE_FADE_DURATION)) / WORMHOLE_FADE_DURATION;
	}
	
	// running and fade out
	if (state > 0)
	{
		// fill screen with black
		ctx.fillRect(0, 0, _windowWidth, _windowHeight);
		
		// and set composition to clearing the black
		ctx.globalCompositeOperation = "destination-out";
		ctx.fillStyle = "#000";
	}
	
	// when fade in or out
	if (state != 1)
	{
		a = _windowWidth / 2;
		b = _windowHeight / 2;
		ctx.beginPath();
		
		// go to the center of the screen
		ctx.moveTo(a, b);
		
		// and draw an outward spiral
		for (i=0; i<x * 150; i++)
		{
			c = _scale(i * i * i / 1500);
			ctx.lineTo(a + cos(-i/30) * c, b + sin(-i/30) * c);
		}
		
		// then fill it
		ctx.fill();
	}
	
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
		
		for (j=0; j<WORMHOLE_STEPS; j++)
		{
			a += csteps[j].a;
			b += csteps[j].b;
			x += csteps[j].x;
			y += csteps[j].y;
			z -= WORMHOLE_VIEW_Z_STEP;
			
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
		
		if (star.z + viewZ > 1 && state != 2)
		{
			star.z -= 20;
		}
	}
	
	wormholeViewStep();
}

function restartWormhole()
{
	csteps = [];
	cstars = [];
	wormholeFrameNumber = 0;
	
	generateStars();
	generateSteps();
	
	viewZ = -20;
	viewZX = 0;
}
