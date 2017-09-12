"use strict";

function titleAgain()
{
	_gameState = GAME_STATE_NEW;
}

function titleStart()
{
	animationStart(animationTitleHide, 1);
}

function titleSkip()
{
	_sceneTime = 60;
}

function drawTitle()
{
	let i, a, s;
	
	if (_gameState == GAME_STATE_READY)
	{
		a = [];
		
		for (i=0; i<_cats.length; i++)
		{
			if (_cats[i].location != null)
			{
				a.push(_cats[i].name);
			}
		}
		
		if (a.length > 1)
		{
			s = "Where are " + a.join(", ") + "?";
		}
		else
		{
			s = "Where is " + a + "?";
		}
		
		// ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, _windowWidth, _windowHeight);
		
		ctx.fillStyle = "#fff";
		ctx.font = _scale(15) + "px Arial";
		ctx.textAlign = "center";
		
		if (_sceneTime > 0.5)
		{
			ctx.fillText("This is the xxxxxxxxxx freighter", _x(0), _y(-160));
		}
		
		if (_sceneTime > 1.5)
		{
			ctx.fillText("and its captain, Jeff.", _x(0), _y(-90));
		}
		
		if (_sceneTime > 2.0)
		{
			ctx.fillText("He is shipping goods from planet to planet", _x(0), _y(-70));
		}
		
		if (_sceneTime > 2.5)
		{
			ctx.fillText("with his four companions.", _x(0), _y(-50));
		}
		
		if (_sceneTime > 3)
		{
			ctx.fillText(_cats[0].name + ((_cats[0].location != null && _sceneTime > 3.5) ? "?!" : ""), _x(-100), _y(20));
		}
		
		if (_sceneTime > 4)
		{
			ctx.fillText(_cats[1].name + ((_cats[1].location != null && _sceneTime > 4.5) ? "?!" : ""), _x(100), _y(20));
		}
		
		if (_sceneTime > 5)
		{
			ctx.fillText(_cats[2].name + ((_cats[2].location != null && _sceneTime > 5.5) ? "?!" : ""), _x(-100), _y(100));
		}
		
		if (_sceneTime > 6)
		{
			ctx.fillText("and " + _cats[3].name + ((_cats[3].location != null && _sceneTime > 6.5) ? "?!" : ""), _x(100), _y(100));
		}
		
		if (_sceneTime > 7)
		{
			ctx.fillText(s, _x(0), _y(130));
		}
		
		function localDrawCat(cat, p)
		{
			drawMultipleShape([
				[ SHAPE_CAT_HEAD_AWAKE, { x: 50, y: -40 }, 10, cat.colors[0], cat.colors[1] ],
				[ SHAPE_CAT_EYE, { x: 75, y: -65 }, 10, null, cat.colors[2] ],
				[ SHAPE_CAT_EYE, { x: 115, y: -65 }, 10, null, cat.colors[2] ]
			], p, 0.4);
		}
		
		if (_sceneTime > 1.0)
		{
			drawShip({ x: 0, y: -130 }, 2);
		}
		
		if (_sceneTime > 3.5 && _cats[0].location == null)
		{
			localDrawCat(_cats[0], { x: -139, y: 10 });
		}
		
		if (_sceneTime > 4.5 && _cats[1].location == null)
		{
			localDrawCat(_cats[1], { x: 61, y: 10 });
		}
		
		if (_sceneTime > 5.5 && _cats[2].location == null)
		{
			localDrawCat(_cats[2], { x: -139, y: 90 });
		}
		
		if (_sceneTime > 6.5 && _cats[3].location == null)
		{
			localDrawCat(_cats[3], { x: 61, y: 90 });
		}
	}
	
	switch (_gameState)
	{
		case GAME_STATE_NEW:
			drawGuiButton("EASY", -3, 3, true, resetEasy);
			drawGuiButton("NORMAL", 0, 3, true, resetNormal);
			drawGuiButton("HARD", 3, 3, true, resetHard);
		break;
		
		case GAME_STATE_INTRO:
			_gameState = GAME_STATE_READY;
		break;
		
		case GAME_STATE_READY:
			drawGuiButton("START", 6, 3, true, titleStart);
		break;
		
		case GAME_STATE_WON:
			ctx.fillText("Congrats!", _x(-100), _y(0));
			drawGuiButton("AGAIN", 6, 3, true, titleAgain);
		break;
		
		case GAME_STATE_LOST:
			ctx.fillText("You ran out of fuel :(", _x(-100), _y(0));
			drawGuiButton("AGAIN", 6, 3, true, titleAgain);
		break;
	}
}
