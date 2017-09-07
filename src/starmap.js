"use strict";

function starMapNext()
{
	let i;
	
	for (i=0; i<STAR_COUNT; i++)
	{
		if (_selectedSystem == _map.systems[i])
		{
			_selectedSystem = _map.systems[(i + 1) % STAR_COUNT];
			break;
		}
	}
}

function starMapZoom()
{
	_cursor.clicked = false;
	_layers[0].visible = true;
	_layers[1].visible = false;
}

function starMapJump()
{
	jumpToSystem(_selectedSystem);
	starMapZoom();
}

function drawStarMap()
{
	let i, a, n, clicked;
	
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	clicked = false;
	
	if (_cursor.clicked && _cursor.y > -180 && _cursor.y < 180)
	{
		clicked = true;
		_selectedSystem = null;
	}
	
	// star
	for (i=0; i<_map.systems.length; i++)
	{
		a = _map.systems[i].bodies[0].def;
		
		ctx.fillStyle = hsla2rgba_(a[0], a[1], a[2], 0.2);
		_arc(_map.systems[i].mapPosition.x, _map.systems[i].mapPosition.y, 2.5, 0, 1, 1);
		
		ctx.fillStyle = hsla2rgba_(a[0], a[1], a[2], 1);
		_arc(_map.systems[i].mapPosition.x, _map.systems[i].mapPosition.y, 1.5, 0, 1, 1);
		
		ctx.fillStyle = "#fff";
		_arc(_map.systems[i].mapPosition.x, _map.systems[i].mapPosition.y, 0.75, 0, 1, 1);
		
		if (_map.systems[i] == _currentSystem)
		{
			ctx.strokeStyle = "#050";
			_arc(_map.systems[i].mapPosition.x, _map.systems[i].mapPosition.y, 5, 0, 1, 0, 1);
		}
		
		if (_map.systems[i] == _selectedSystem)
		{
			drawCircularSelection(_map.systems[i].mapPosition, 7);
		}
		
		if (getDistance(_map.systems[i].mapPosition, _cursor) < 10)
		{
			drawCircularSelection(_map.systems[i].mapPosition, 7);
			
			if (clicked)
			{
				_selectedSystem = _map.systems[i];
			}
		}
	}
	
	ctx.globalCompositeOperation = "screen";
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(_x(_map.path.steps[0].mapPosition.x), _y(_map.path.steps[0].mapPosition.y));
	for (i=1; i<_map.path.steps.length; i++)
	{
		ctx.lineTo(_x(_map.path.steps[i].mapPosition.x), _y(_map.path.steps[i].mapPosition.y));
	}
	ctx.strokeStyle = "rgba(0, 190, 255, 0.2)";
	ctx.lineWidth = _scale(3);
	ctx.stroke();
	
	ctx.globalCompositeOperation = "source-over";
	ctx.lineCap = "butt";
	
	drawGuiStripes();
	drawGuiButton("\u00BB", 4, 1, true, starMapNext);
	drawGuiButton("JUMP", 5, 3, (_selectedSystem && _selectedSystem != _currentSystem), starMapJump);
	drawGuiButton("ZOOM", 8, 3, (_currentSystem && _selectedSystem == _currentSystem), starMapZoom);
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
}

function jumpToSystem(a)
{
	_currentSystem = a;
	_selectedSystem = a;
	
	if (!_currentSystem.visited)
	{
		_map.path.steps.push(a);
		_currentSystem.visited = true;
	}
}

function regeneratePath()
{
	let i, j, k, a, b, c, current, best, angle, dist, distanceMin, angleHeading;
	
	for (i=0; i<PATH_ITERATIONS; i++)
	{
		_map.path.steps.length = 0;
		_map.path.valid = true;
		
		for (k=0; k<STAR_COUNT; k++)
		{
			_map.systems[k].visited = false;
		}
		
		angleHeading = 0;
		
		jumpToSystem(arrayRandom(_map.systems));
		
		for (j=0; j<PATH_STEPS; j++)
		{
			c = null;
			distanceMin = 1000;
			
			for (k=0; k<STAR_COUNT; k++)
			{
				if (_map.systems[k].visited)
				{
					continue;
				}
				
				dist = getDistance(_currentSystem.mapPosition, _map.systems[k].mapPosition);
				angle = -getAngle(_currentSystem.mapPosition, _map.systems[k].mapPosition);
				
				if (dist > PATH_STEP_DISTANCE || angle < angleHeading - PATH_ANGLE_DIFF_MAX || angle > angleHeading + PATH_ANGLE_DIFF_MAX)
				{
					continue;
				}
				
				if (dist < distanceMin)
				{
					c = {
						system: _map.systems[k],
						angleHeading: angle
					};
					
					distanceMin = dist;
				}
			}
			
			if (!c)
			{
				_map.path.valid = false;
				break;
			}
			
			jumpToSystem(c.system);
			angleHeading = c.angleHeading;
		}
		
		if (_map.path.valid)
		{
			return true;
		}
	}
	
	return false;
}
