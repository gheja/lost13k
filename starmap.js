"use strict";

const PATH_STEPS = 10;
const PATH_STEP_DISTANCE = 100;
const PATH_ITERATIONS = 100;

const STAR_COUNT = 40;
const STAR_DISTANCE_TARGET = 30;
const STAR_DISTANCE_ITERATIONS = 100;

let canvas = null;
let ctx = null;
let body = null;
let gui = null;
let _layers = [];
let _frameNumber = 0;
let lastFrameTime = 0;

let map = {
	stars: [],
	path: {
		success: false,
		steps: [],
		stepsShown: PATH_STEPS + 1
	}
};

function drawStarMap()
{
	let i, a, n;
	
	lastFrameTime = (new Date()).getTime();
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	// star distance
	ctx.strokeStyle = "#333";
	ctx.lineWidth = _scale(2);
	for (i=0; i<map.stars.length; i++)
	{
		_arc(map.stars[i].x, map.stars[i].y, STAR_DISTANCE_TARGET, 0, 1, 0, 1);
		
	}
	
	// angle highlight
	ctx.lineWidth = _scale(2);
	n = Math.min(map.path.stepsShown, map.path.steps.length)
	for (i=0; i<n; i++)
	{
		if (i == n - 1)
		{
			ctx.strokeStyle = "#888";
		}
		else
		{
			ctx.strokeStyle = "#333";
		}
		a = map.path.steps[i];
		// _arc(a.star.x, a.star.y, PATH_STEP_DISTANCE, a.angleMin, a.angleMax, 0, 1);
		
		ctx.beginPath();
		ctx.moveTo(_x(a.star.x), _y(a.star.y));
		ctx.arc(_x(a.star.x), _y(a.star.y), _scale(PATH_STEP_DISTANCE), a.angleMin * PI2, a.angleMax * PI2);
		ctx.closePath();
		ctx.stroke();
	}
	
	if (map.path.stepsShown >= map.path.steps.length)
	{
		ctx.strokeStyle = map.path.success ? "#0e0" : "#e00";
	}
	else
	{
		ctx.strokeStyle = "#999";
	}
	ctx.lineWidth = _scale(3);
	
	// star highlight
	for (i=0; i<Math.min(map.path.stepsShown, map.path.steps.length); i++)
	{
		a = map.path.steps[i];
		_arc(a.star.x, a.star.y, 4, 0, 1, 0, 1);
	}
	
	// path highlight
	if (map.path.stepsShown > 0 && map.path.steps.length > 0)
	{
		ctx.beginPath();
		ctx.moveTo(_x(map.path.steps[0].star.x), _y(map.path.steps[0].star.y))
		for (i=0; i<Math.min(map.path.stepsShown, map.path.steps.length); i++)
		{
			a = map.path.steps[i];
			ctx.lineTo(_x(a.star.x), _y(a.star.y));
		}
		ctx.stroke();
	}
	
	// star
	ctx.fillStyle = "#fff";
	for (i=0; i<map.stars.length; i++)
	{
		_arc(map.stars[i].x, map.stars[i].y, 3, 0, 1, 1);
	}
}

function regenerateStars()
{
	let i, j, k, a, b, min;
	
	map.stars.length = 0;
	map.path.steps.length = 0;
	
	for (i=0; i<STAR_COUNT; i++)
	{
		for (j=0; j<STAR_DISTANCE_ITERATIONS; j++)
		{
			a = {
				x: randPlusMinus(180),
				y: randPlusMinus(180),
				visited: false
			}
			
			// don't generate stars too close
			min = 1000;
			for (k=0; k<i; k++)
			{
				min = Math.min(min, getDistance(a, map.stars[k]));
			}
			
			if (min > STAR_DISTANCE_TARGET)
			{
				break;
			}
		}
		
		map.stars.push(a);
	}
}

function pathAddStep(a)
{
	a.star.visited = true;
	map.path.steps.push(a);
}

function regeneratePath()
{
	let i, j, k, a, b, c, current, best, angle, dist, minDist;
	
	map.path.success = false;
	map.path.steps.length = 0;
	
	for (i=0; i<1; i++)
	{
		map.path.success = true;
		
		for (k=0; k<STAR_COUNT; k++)
		{
			map.stars[k].visited = false;
		}
		
		pathAddStep({
			star: arrayRandom(map.stars),
			angleMin: -0.3,
			angleMax: 0.3
		});
		
		for (j=0; j<PATH_STEPS; j++)
		{
			c = null;
			current = map.path.steps[map.path.steps.length - 1];
			
			console.log("current: " + current.angleMin + ", " + current.angleMax);
			
			minDist = 1000;
			for (k=0; k<STAR_COUNT; k++)
			{
				if (map.stars[k].visited)
				{
					continue;
				}
				
				dist = getDistance(current.star, map.stars[k]);
				angle = -getAngle(current.star, map.stars[k]);
				
				if (dist > PATH_STEP_DISTANCE || angle < current.angleMin || angle > current.angleMax)
				{
					continue;
				}
				
				if (dist < minDist)
				{
					c = {
						star: map.stars[k],
						angleMin: angle - 0.4,
						angleMax: angle + 0.4
					};
					
					minDist = dist;
				}
				
				console.log(k + ", " + dist + ", " + angle);
			}
			
			if (!c)
			{
				map.path.success = false;
				break;
			}
			
			pathAddStep(c);
		}
		
		if (map.path.success)
		{
			return true;
		}
	}
	
	return false;
}

let _demoState = 0;
let _demoA = 0;
let _demoB = 0;
function demoStep()
{
	switch (_demoState)
	{
		case 0:
			regenerateStars();
			_demoState = 1;
			_demoA = 0;
		break;
		
		case 1:
			regeneratePath();
			map.path.stepsShown = 0;
			_demoState = 2;
		break;
		
		case 2:
			map.path.stepsShown++;
			
			if (map.path.stepsShown > map.path.steps.length + 2)
			{
				if (_demoA > 5)
				{
					_demoState = 0;
				}
				else
				{
					_demoState = 1;
					_demoA++;
				}
			}
		break;
	}
}

function init()
{
	let tmp;
	
	body = document.body;
	
	layerCreate("starmap", drawStarMap);
	
	lastFrameTime = (new Date()).getTime();
	
	draw();
	
	gui = new dat.gui.GUI();
	
	gui.add(map.path, 'stepsShown').min(0).max(PATH_STEPS + 1).step(1);
	gui.add(window, 'regenerateStars');
	gui.add(window, 'regeneratePath');
	
	regenerateStars();
	regeneratePath();
	
/*
	// DEMO
	window.setInterval(demoStep, 100);
*/
}

var _raf = window.requestAnimationFrame;

window.onload = init;
