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
	_currentSystem = _selectedSystem;
	
	document.getElementById("layer1").checked = false;
	document.getElementById("layer0").checked = true;
}

function starMapJump()
{
	let i;
	
	for (i=0; i<STAR_COUNT; i++)
	{
		_map.systems[i].current = false;
		
		if (_selectedSystem == _map.systems[i])
		{
			_map.systems[i].current = true;
			if (!_map.systems[i].visited)
			{
				pathAddStep({ system: _map.systems[i] });
			}
		}
	}
}

function drawStarMap()
{
	let i, a, n, clicked;
	
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "#000";
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
		
		if (_map.systems[i] == _selectedSystem)
		{
			drawCircularSelection(_map.systems[i].mapPosition, 5);
		}
		
		if (getDistance(_map.systems[i].mapPosition, _cursor) < 10)
		{
			drawCircularSelection(_map.systems[i].mapPosition, 5);
			
			if (clicked)
			{
				_selectedSystem = _map.systems[i];
			}
		}
	}
	
	ctx.globalCompositeOperation = "screen";
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(_x(_map.path.steps[0].system.mapPosition.x), _y(_map.path.steps[0].system.mapPosition.y));
	for (i=1; i<_map.path.steps.length; i++)
	{
		ctx.lineTo(_x(_map.path.steps[i].system.mapPosition.x), _y(_map.path.steps[i].system.mapPosition.y));
	}
	ctx.strokeStyle = "rgba(0, 190, 255, 0.2)";
	ctx.lineWidth = _scale(3);
	ctx.stroke();
	
	ctx.globalCompositeOperation = "source-over";
	ctx.lineCap = "butt";
	
	drawGuiStripes();
	drawGuiButton("\u00BB", 4, 1, true, starMapNext);
	drawGuiButton("JUMP", 5, 3, (_selectedSystem && !_selectedSystem.current), starMapJump);
	drawGuiButton("ZOOM", 8, 3, (_selectedSystem && _selectedSystem.current), starMapZoom);
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
	
	for (i=0; i<PATH_ITERATIONS; i++)
	{
		_map.path.steps.length = 0;
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
