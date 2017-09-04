"use strict";

function drawStarMap()
{
	let i, a, n;
	
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	// star
	ctx.fillStyle = "#fff";
	for (i=0; i<_map.stars.length; i++)
	{
		_arc(_map.stars[i].x, _map.stars[i].y, 1.5, 0, 1, 1);
		
		if (getDistance(_map.stars[i], _cursor) < 10)
		{
			drawCircularSelection(_map.stars[i], 5);
		}
	}
}

function regenerateStars()
{
	let i, j, k, a, b, min;
	
	_map.stars.length = 0;
	_map.path.steps.length = 0;
	
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
				min = Math.min(min, getDistance(a, _map.stars[k]));
			}
			
			if (min > STAR_DISTANCE_TARGET)
			{
				break;
			}
		}
		
		_map.stars.push(a);
	}
}

function pathAddStep(a)
{
	a.star.visited = true;
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
			_map.stars[k].visited = false;
		}
		
		pathAddStep({
			star: arrayRandom(_map.stars),
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
				if (_map.stars[k].visited)
				{
					continue;
				}
				
				dist = getDistance(current.star, _map.stars[k]);
				angle = -getAngle(current.star, _map.stars[k]);
				
				if (dist > PATH_STEP_DISTANCE || angle < current.angleMin || angle > current.angleMax)
				{
					continue;
				}
				
				if (dist < minDist)
				{
					c = {
						star: _map.stars[k],
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
