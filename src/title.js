"use strict";

let _p5 = 0;

function titleAgain()
{
	_gameState = GAME_STATE_NEW;
	_sceneTime = 0;
}

function titleStart()
{
	animationStart(animationTitleHide, 1);
	_textBubble.timeLeft = 0;
}

function titleSkip()
{
	_sceneTime = 60;
}

function breakText(s, len)
{
	let i, j, k, result;
	
	j = 0;
	k = 0;
	
	result = [];
	
	for (i=0; i<s.length; i++)
	{
		if (s[i] == " ")
		{
			if (i - k > len)
			{
				result.push(s.substring(k, j));
				k = j + 1;
			}
			
			j = i;
		}
	}
	
	if (j != i)
	{
		result.push(s.substring(k, s.length));
	}
	
	return result;
}

function drawTitle()
{
	let i, a, s, t, u;
	
	function localDrawCat(cat, p)
	{
		drawMultipleShape([
			[ SHAPE_CAT_HEAD_AWAKE, { x: 50, y: -40 }, 10, cat.colors[0], cat.colors[1] ],
			[ SHAPE_CAT_EYE, { x: 75, y: -65 }, 10, null, cat.colors[2] ],
			[ SHAPE_CAT_EYE, { x: 115, y: -65 }, 10, null, cat.colors[2] ]
		], p, 0.4);
	}
	
	// ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, _windowWidth, _windowHeight);
	
	if (_gameState == GAME_STATE_READY)
	if (_gameState == GAME_STATE_READY)
	{
		a = [];
		u = [];
		
		_playerPosition.x = 0;
		_playerPosition.y = -65;
		
		for (i=0; i<_cats.length; i++)
		{
			if (_cats[i].location != null)
			{
				a.push(_cats[i].name);
				// u = u.concat(breakText(_cats[i].name + " was " + describeBody(_cats[i].location) + ".", 60));
				t = _cats[i].himHer;
			}
		}
		
		if (a.length > 1)
		{
			s = "Where are ";
			
			// shorter than any loop
			if (a.length == 2)
			{
				s += a[0] + " and " + a[1];
			}
			else
			{
				s += a[0] + ", " + a[1] + " and " + a[2];
			}
			
			s += "?";
			
			t = "them";
		}
		else
		{
			s = "Where is " + a[0] + "?";
		}
		
		ctx.fillStyle = "#fff";
		ctx.font = _scale(15) + "px Arial";
		ctx.textAlign = "center";
		
		if (_sceneTime > 1)
		{
			ctx.fillText("This is the Bobcat-13 freighter", _x(0), _y(-100));
		}
		
		if (_sceneTime > 2)
		{
			ctx.fillText("and its captain, Jeff.", _x(0), _y(-80));
		}
		
		if (_sceneTime > 4)
		{
			ctx.fillText("He is shipping goods", _x(0), _y(-5));
		}
		
		if (_sceneTime > 5)
		{
			ctx.fillText("from planet to planet", _x(0), _y(15));
		}
		
		if (_sceneTime > 6)
		{
			ctx.fillText("with his four companions.", _x(0), _y(35));
		}
		
		if (_sceneTime > 7)
		{
			ctx.fillText(_cats[0].name + ((_cats[0].location != null && _sceneTime > 7.5) ? "?!" : ""), _x(-135), _y(100));
		}
		
		if (_sceneTime > 8)
		{
			ctx.fillText(_cats[1].name + ((_cats[1].location != null && _sceneTime > 8.5) ? "?!" : ""), _x(-45), _y(120));
		}
		
		if (_sceneTime > 9)
		{
			ctx.fillText(_cats[2].name + ((_cats[2].location != null && _sceneTime > 9.5) ? "?!" : ""), _x(45), _y(100));
		}
		
		if (_sceneTime > 10)
		{
			ctx.fillText("and " + _cats[3].name + ((_cats[3].location != null && _sceneTime > 10.5) ? "?!" : ""), _x(135), _y(120));
		}
		
		if (!_zenMode)
		{
			if (_sceneTime > 11.5 && _sceneTime < 19)
			{
				ctx.fillText(s, _x(0), _y(160));
			}
			
			if (passingSceneTime(14))
			{
				showTextBubble([ "I think I remember where I saw " + t + "." ]);
				_textBubble.timeLeft = 4;
			}
			
			if (_sceneTime > 19.5 && _sceneTime < 22)
			{
				ctx.fillText("Where?", _x(0), _y(160));
			}
			
			if (passingSceneTime(20))
			{
				toggleRecap();
			}
			
			if (_sceneTime > 25)
			{
				ctx.fillText("Okay then, let's find " + t + "!", _x(0), _y(160));
			}
		}
		else
		{
			if (_sceneTime > 11.5)
			{
				ctx.fillText("Let's go and see the galaxy!", _x(0), _y(160));
				_sceneTime = 60;
			}
		}
		
		if (_sceneTime > 0.5)
		{
			// drawShip({ x: -110, y: -130 }, 0.3);
			drawShip({ x: -120, y: -140 }, 0.35);
		}
		
		if (_sceneTime > 7.5 && _cats[0].location == null)
		{
			localDrawCat(_cats[0], { x: -170, y: 90 });
		}
		
		if (_sceneTime > 8.5 && _cats[1].location == null)
		{
			localDrawCat(_cats[1], { x: -80, y: 110 });
		}
		
		if (_sceneTime > 9.5 && _cats[2].location == null)
		{
			localDrawCat(_cats[2], { x: 10, y: 90 });
		}
		
		if (_sceneTime > 10.5 && _cats[3].location == null)
		{
			localDrawCat(_cats[3], { x: 100, y: 110 });
		}
		
		if (_sceneTime > 2.0)
		{
			i = _sceneTime > 11.5 || _sceneTime < 14.5 || _zenMode;
			
			drawMultipleShape([
				[ SHAPE_GUY_HEAD, { x: 0, y: 0 }, 10, "#da8", "#b87" ],
				[ SHAPE_GUY_HAIR, { x: 0, y: 0 }, 10, "#a51", "#841" ],
				[ i ? SHAPE_GUY_EYE_NORMAL : SHAPE_GUY_EYE_SCARED, { x: 0, y: 0 }, 10, null, "#841" ],
				[ i ? SHAPE_GUY_EYE_NORMAL : SHAPE_GUY_EYE_SCARED, { x: 20, y: 0 }, 10, null, "#841" ],
				[ i ? SHAPE_GUY_MOUTH_NORMAL : SHAPE_GUY_MOUTH_SCARED, { x: 0, y: 0 }, 10, i ? null : "#b87", "#841" ]
			], { x: -20, y: -25 }, 0.6);
		}
	}
	
	if (_gameState == GAME_STATE_WON || _gameState == GAME_STATE_LOST)
	{
		if (_cats[0].location == null)
		{
			localDrawCat(_cats[0], { x: -120, y: 30 });
		}
		
		if (_cats[1].location == null)
		{
			localDrawCat(_cats[1], { x: -70, y: 50 });
		}
		
		if (_cats[2].location == null)
		{
			localDrawCat(_cats[2], { x: -10, y: 50 });
		}
		
		if (_cats[3].location == null)
		{
			localDrawCat(_cats[3], { x: 40, y: 30 });
		}
		
		i = _gameState == GAME_STATE_WON;
		
		drawMultipleShape([
			[ SHAPE_GUY_HEAD, { x: 0, y: 0 }, 10, "#da8", "#b87" ],
			[ SHAPE_GUY_HAIR, { x: 0, y: 0 }, 10, "#a51", "#841" ],
			[ i ? SHAPE_GUY_EYE_NORMAL : SHAPE_GUY_EYE_SCARED, { x: 0, y: 0 }, 10, null, "#841" ],
			[ i ? SHAPE_GUY_EYE_NORMAL : SHAPE_GUY_EYE_SCARED, { x: 20, y: 0 }, 10, null, "#841" ],
			[ i ? SHAPE_GUY_MOUTH_NORMAL : SHAPE_GUY_MOUTH_SCARED, { x: 0, y: 0 }, 10, i ? null : "#b87", "#841" ]
		], { x: -20, y: -25 }, 0.6);
	}
	
	ctx.fillStyle = "#fff";
	ctx.font = _scale(15) + "px Arial";
	
	switch (_gameState)
	{
		case GAME_STATE_NEW:
			if (_totalCatsRescued > 0)
			{
				ctx.fillText("Lost cats found: " + _totalCatsRescued, _x(0), _y(100));
			}
			
			if (_totalCatsRescued < 3)
			{
				// ctx.fillText("Find at least 3 lost cats on Normal difficulty", _x(0), _y(140));
				ctx.fillText("Find at least 3 lost cats on any difficulty", _x(0), _y(140));
				ctx.fillText("to unlock HARDER difficulty.", _x(0), _y(160));
			}
			else if (_totalCatsRescued < 5)
			{
				// ctx.fillText("Find at least 5 lost cats on Normal difficulty", _x(0), _y(140));
				ctx.fillText("Find at least 5 lost cats on any difficulty", _x(0), _y(140));
				ctx.fillText("to unlock ZEN mode.", _x(0), _y(160));
			}
			drawGuiButton("EASY", -6, 3, true, resetEasy);
			drawGuiButton("NORMAL", -3, 3, true, resetNormal);
			drawGuiButton("HARD", 0, 3, true, resetHard);
			drawGuiButton("HARDER", 3, 3, _totalCatsRescued >= 3, resetHarder);
			drawGuiButton("ZEN", 6, 3, _totalCatsRescued >= 5, resetZen);
		break;
		
		case GAME_STATE_INTRO:
			_gameState = GAME_STATE_READY;
		break;
		
		case GAME_STATE_READY:
			drawGuiButton("RECAP", -9, 3, _sceneTime > 26, toggleRecap);
			drawGuiButton("SKIP", 3, 3, _sceneTime < 26, titleSkip);
			drawGuiButton("START", 6, 3, _sceneTime > 26, titleStart);
		break;
		
		case GAME_STATE_WON:
			ctx.fillText("Congrats!", _x(0), _y(88));
			drawGuiButton("SHARE ON TWITTER", 0, 6, true, shareOnTwitter);
			drawGuiButton("AGAIN", 6, 3, true, titleAgain);
		break;
		
		case GAME_STATE_LOST:
			ctx.fillText("You ran out of fuel :(", _x(0), _y(88));
			ctx.fillText("Try again.", _x(0), _y(112));
			drawGuiButton("AGAIN", 6, 3, true, titleAgain);
		break;
	}
	
	a = 0;
	
	if (_p5 != 0)
	{
		for (i=0; i<30; i++)
		{
			a = clamp(_p5 * 2 + i/30 - 1, 0, 1);
			ctx.clearRect(0, i * (_windowHeight / 30) + (_windowHeight / 30 * a / 2), _windowWidth, (_windowHeight / 30) * a);
		}
	}
}
