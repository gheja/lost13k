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
	
	function localPopText(time, x, y, text)
	{
		let a;
		
		a = clamp(_sceneTime - time, 0, 0.2) * 5;
		
		ctx.fillStyle = "rgba(255,255,255," + a + ")";
		ctx.fillText(text, _x(x), _y(y - (a - 1) * 3));
	}
	
	// ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, _windowWidth, _windowHeight);
	
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
		
		
		// texts
		
		localPopText(1, 0, -100, "This is the Bobcat-13 freighter");
		localPopText(2, 0, -80, "and its captain, Jeff.");
		localPopText(3, 0, -5, "He is shipping goods");
		localPopText(4, 0, 15, "from planet to planet");
		localPopText(5, 0, 35, "with his four companions.");
		localPopText(6, -135, 100, _cats[0].name + ((_cats[0].location != null && _sceneTime > 6.7) ? "?!" : ""));
		localPopText(7, -45, 120, _cats[1].name + ((_cats[1].location != null && _sceneTime > 7.7) ? "?!" : ""));
		localPopText(8, 45, 100, _cats[2].name + ((_cats[2].location != null && _sceneTime > 8.7) ? "?!" : ""));
		localPopText(9, 135, 120, "and " + _cats[3].name + ((_cats[3].location != null && _sceneTime > 9.7) ? "?!" : ""));
		
		if (!_zenMode)
		{
			if (_sceneTime < 17)
			{
				localPopText(11, 0, 160, s);
			}
			
			if (passingSceneTime(13))
			{
				showTextBubble([ "I think I remember where I saw " + t + "." ]);
				_textBubble.timeLeft = 4;
			}
			
			if (_sceneTime < 24)
			{
				localPopText(17.5, 0, 160, "Where?");
			}
			
			if (passingSceneTime(19))
			{
				toggleRecap();
			}
			
			localPopText(25, 0, 160, "Okay then, let's find " + t + "!");
		}
		else
		{
			localPopText(11, 0, 160, "Let's go and see the galaxy!");
			
			if (_sceneTime > 12)
			{
				_sceneTime = 60;
			}
		}
		
		
		// objects
		
		if (_sceneTime > 1.0)
		{
			drawShip({ x: -115, y: -140 }, 0.35);
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
		
		if (_sceneTime > 6 && _cats[0].location == null)
		{
			localDrawCat(_cats[0], { x: -170, y: 90 });
		}
		
		if (_sceneTime > 7 && _cats[1].location == null)
		{
			localDrawCat(_cats[1], { x: -80, y: 110 });
		}
		
		if (_sceneTime > 8 && _cats[2].location == null)
		{
			localDrawCat(_cats[2], { x: 10, y: 90 });
		}
		
		if (_sceneTime > 9 && _cats[3].location == null)
		{
			localDrawCat(_cats[3], { x: 100, y: 110 });
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
