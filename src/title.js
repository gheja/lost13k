"use strict";

function titleAgain()
{
	_gameState = GAME_STATE_NEW;
}

function titleSetEasy()
{
	reset();
}

function titleSetNormal()
{
	reset();
}

function titleSetHard()
{
	reset();
}

function titleStart()
{
	animationStart(animationTitleHide, 1);
}

function drawTitle()
{
	// ctx.globalCompositeOperation = "source-over";
	// ctx.fillStyle = "#000";
	
	ctx.fillRect(0, 0, _windowWidth, _windowHeight);
	
	ctx.fillStyle = "#fff";
	ctx.font = _scale(15) + "px Arial";
	/*
	ctx.fillText("This is the Lorem Ipsum freighter");
	ctx.fillText("shipping goods from planets to planets");
	ctx.fillText("And moons, occasionally.");
	"This is the captain, Jeff"
	"and his four cats as companions for the rides"
	"Bubble"
	"Bobby"
	"Marshmallow"
	"and Winston"
	"and Winston?"
	"Where's Winston?"
	*/
	
	switch (_gameState)
	{
		case GAME_STATE_NEW:
			drawGuiButton("EASY", -3, 3, true, titleSetEasy);
			drawGuiButton("NORMAL", 0, 3, true, titleSetNormal);
			drawGuiButton("HARD", 3, 3, true, titleSetHard);
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
