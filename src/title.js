"use strict";

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
	
	if (!_started)
	{
		drawGuiButton("EASY", -3, 3, true, titleSetEasy);
		drawGuiButton("NORMAL", 0, 3, true, titleSetNormal);
		drawGuiButton("HARD", 3, 3, true, titleSetHard);
	}
	else
	{
		drawGuiButton("START", 6, 3, true, titleStart);
	}
}
