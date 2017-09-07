"use strict";

let systemSelected = null;

function starMapNext()
{
	let i;
	
	for (i=0; i<STAR_COUNT; i++)
	{
		if (systemSelected == _map.systems[i])
		{
			systemSelected = _map.systems[(i + 1) % STAR_COUNT];
			break;
		}
	}
}

function starMapZoom()
{
}

function starMapJump()
{
	let i;
	
	for (i=0; i<STAR_COUNT; i++)
	{
		_map.systems[i].current = false;
		
		if (systemSelected == _map.systems[i])
		{
			_map.systems[i].current = true;
		}
	}
}

function drawStarMap()
{
	let i, a, n, clicked;
	
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	clicked = false;
	
	if (_cursor.clicked && _cursor.y > -180 && _cursor.y < 180)
	{
		clicked = true;
		systemSelected = null;
	}
	
	// star
	ctx.fillStyle = "#fff";
	for (i=0; i<_map.systems.length; i++)
	{
		_arc(_map.systems[i].mapPosition.x, _map.systems[i].mapPosition.y, 1.5, 0, 1, 1);
		
		if (_map.systems[i] == systemSelected)
		{
			drawCircularSelection(_map.systems[i].mapPosition, 5);
		}
		
		if (getDistance(_map.systems[i].mapPosition, _cursor) < 10)
		{
			drawCircularSelection(_map.systems[i].mapPosition, 5);
			
			if (clicked)
			{
				systemSelected = _map.systems[i];
			}
		}
	}
	
	drawGuiStripes();
	drawGuiButton("\u00BB", 4, 1, true, starMapNext);
	drawGuiButton("JUMP", 5, 3, (systemSelected && !systemSelected.current), starMapJump);
	drawGuiButton("ZOOM", 8, 3, (systemSelected && systemSelected.current), function() { });
}

function regenerateStars()
{
	let i, j, k, a, b, min;
	
	_map.systems.length = 0;
	_map.path.steps.length = 0;
	
	for (i=0; i<STAR_COUNT; i++)
	{
		for (j=0; j<STAR_DISTANCE_ITERATIONS; j++)
		{
			a = {
				x: randPlusMinus(180),
				y: randPlusMinus(180),
			}
			
			// don't generate stars too close
			min = 1000;
			for (k=0; k<i; k++)
			{
				min = Math.min(min, getDistance(a, _map.systems[k].mapPosition));
			}
			
			if (min > STAR_DISTANCE_TARGET)
			{
				break;
			}
		}
		
		_map.systems.push({
			mapPosition: a,
			visited: false,
			current: false
		});
	}
}

function pathAddStep(a)
{
	a.system.visited = true;
	_map.path.steps.push(a);
}

function regeneratePath()
{
	let i, j, k, a, b, c, current, best, angle, dist, minDist;
	
	_map.path.valid = false;
	_map.path.steps.length = 0;
	
	for (i=0; i<PATH_ITERATIONS; i++)
	{
		_map.path.valid = true;
		
		for (k=0; k<STAR_COUNT; k++)
		{
			_map.systems[k].visited = false;
		}
		
		pathAddStep({
			system: arrayRandom(_map.systems),
			angleMin: -0.3,
			angleMax: 0.3
		});
		
		for (j=0; j<PATH_STEPS; j++)
		{
			c = null;
			current = _map.path.steps[_map.path.steps.length - 1];
			
			minDist = 1000;
			for (k=0; k<STAR_COUNT; k++)
			{
				if (_map.systems[k].visited)
				{
					continue;
				}
				
				dist = getDistance(current.system.mapPosition, _map.systems[k].mapPosition);
				angle = -getAngle(current.system.mapPosition, _map.systems[k].mapPosition);
				
				if (dist > PATH_STEP_DISTANCE || angle < current.angleMin || angle > current.angleMax)
				{
					continue;
				}
				
				if (dist < minDist)
				{
					c = {
						system: _map.systems[k],
						angleMin: angle - 0.4,
						angleMax: angle + 0.4
					};
					
					minDist = dist;
				}
			}
			
			if (!c)
			{
				_map.path.valid = false;
				break;
			}
			
			pathAddStep(c);
		}
		
		if (_map.path.valid)
		{
			return true;
		}
	}
	
	return false;
}
