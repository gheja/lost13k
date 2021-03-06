"use strict";

let _p4 = 0;
let _p4Reversed = false;

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
	animationStart(animationSystemZoomIn, 0.5);
	
	_cursor.clicked = false;
	_layers[0].visible = true;
	// _layers[1].visible = false;
}

function starMapJump()
{
	if (tryToConsumeResource())
	{
		jumpToSystem(_selectedSystem);
		animationStart(animationWormhole, 3);
	}
}

function drawStarMap()
{
	let i, a, n, clicked;
	
	ctx.fillStyle = "#112";
	ctx.fillRect(0, 0, _windowWidth, _windowHeight);
	
	ctx.globalCompositeOperation = "screen";
	for (i=0; i<_map.noiseLayers.length; i++)
	{
		ctx.drawImage(_map.noiseLayers[i], 0, 0, NOISE_RESOLUTION, NOISE_RESOLUTION, 0, 0, _windowMax, _windowMax);
	}
	
	ctx.globalCompositeOperation = "source-over";
	
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
		_arc(_map.systems[i].mapPosition, 2.5, 0, 1, 1, 0);
		
		ctx.fillStyle = hsla2rgba_(a[0], a[1], a[2], 1);
		_arc(_map.systems[i].mapPosition, 1.5, 0, 1, 1, 0);
		
		ctx.fillStyle = "#fff";
		_arc(_map.systems[i].mapPosition, 0.75, 0, 1, 1, 0);
		
/*
		if (_map.systems[i] == _currentSystem)
		{
			ctx.strokeStyle = "#050";
			_arc(_map.systems[i].mapPosition, 5, 0, 1, 0, 1);
		}
*/
		
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
	ctx.moveTo(_x(_map.path[0].mapPosition.x), _y(_map.path[0].mapPosition.y));
	for (i=1; i<_map.path.length; i++)
	{
		ctx.lineTo(_x(_map.path[i].mapPosition.x), _y(_map.path[i].mapPosition.y));
	}
	ctx.strokeStyle = "rgba(0, 190, 255, 0.2)";
	ctx.lineWidth = _scale(3);
	ctx.stroke();
	
	ctx.strokeStyle = "rgba(0,200,0,0.25)";
	// little cheat with the highlight
	_arc(_currentSystem.mapPosition, SHORT_JUMP_DISTANCE - 2, 0, 1, 0, 1);
	
	_highlightedResourceCode = -1;
	
	if (_selectedSystem && (_currentSystem != _selectedSystem))
	{
		_highlightedResourceCode = RESOURCE_SHORT_JUMP;
		
		if (getDistance(_currentSystem.mapPosition, _selectedSystem.mapPosition) > SHORT_JUMP_DISTANCE || (_resources[RESOURCE_SHORT_JUMP] == 0 && _resources[RESOURCE_LONG_JUMP] > 0))
		{
			_highlightedResourceCode = RESOURCE_LONG_JUMP;
		}
	}
	
	ctx.globalCompositeOperation = "source-over";
	ctx.lineCap = "butt";
	
	if (_p4 > 0)
	{
		a = _windowHeight * _p4;
		i = _windowHeight / 2 - a / 2;
		
		ctx.fillStyle = "#000";
		
		ctx.fillRect(0, i - _scale(5), _windowWidth, a + _scale(5) * 2);
		ctx.clearRect(0, i, _windowWidth, a);
	}
	
	_playerPosition.x = _currentSystem.mapPosition.x;
	_playerPosition.y = _currentSystem.mapPosition.y - 12 + (Math.sin(_totalTime) * 5);
	
	// TODO: stroke scale
	drawShip({ x: _playerPosition.x - 20, y: _playerPosition.y }, 0.05);
	
	drawGuiButton("RECAP", -9, 3, true, toggleRecap);
	drawGuiButton("\u00BB", 2, 1, true, starMapNext);
	drawGuiButton("JUMP", 3, 3, (_selectedSystem && _selectedSystem != _currentSystem && (_resources[0] != 0 || _resources[1] != 0)), starMapJump);
	drawGuiButton("ZOOM", 6, 3, (_currentSystem && _selectedSystem == _currentSystem), starMapZoom);
	drawGuiResources();
}

function regenerateStars()
{
	let i, j, k, a, b, min;
	
	_map.systems.length = 0;
	_map.path.length = 0;
	
	for (i=0; i<STAR_COUNT; i++)
	{
		for (j=0; j<STAR_DISTANCE_ITERATIONS; j++)
		{
			a = {
				x: randPlusMinus(196),
				y: randPlusMinus(174) - 3,
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
			visited: false
		});
	}
}

function jumpToSystem(a)
{
	_currentSystem = a;
	_selectedSystem = a;
	_currentBody = null;
	_selectedBody = null;
	
	if (!_currentSystem.visited)
	{
		_map.path.push(a);
		_currentSystem.visited = true;
	}
}

function regeneratePath()
{
	let i, j, k, a, b, c, angle, distance, distanceMin, angleHeading, valid;
	
	for (i=0; i<PATH_ITERATIONS; i++)
	{
		valid = true;
		_map.path.length = 0;
		
		for (k=0; k<STAR_COUNT; k++)
		{
			_map.systems[k].visited = false;
		}
		
		angleHeading = 0;
		
		jumpToSystem(arrayPick(_map.systems));
		
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
				
				distance = getDistance(_currentSystem.mapPosition, _map.systems[k].mapPosition);
				angle = -getAngle(_currentSystem.mapPosition, _map.systems[k].mapPosition);
				
				if (distance > PATH_STEP_DISTANCE || angle < angleHeading - PATH_ANGLE_DIFF_MAX || angle > angleHeading + PATH_ANGLE_DIFF_MAX)
				{
					continue;
				}
				
				if (distance < distanceMin)
				{
					c = {
						system: _map.systems[k],
						angleHeading: angle
					};
					
					distanceMin = distance;
				}
			}
			
			if (!c)
			{
				valid = false;
				break;
			}
			
			jumpToSystem(c.system);
			angleHeading = c.angleHeading;
		}
		
		if (valid)
		{
			return true;
		}
	}
	
	return false;
}
