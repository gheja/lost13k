"use strict";

let _animation = {
	position: 1,
	time: 0,
	duration: 1,
	callback: null
};

function animationStart(callback, duration)
{
	_animation.position = 0;
	_animation.time = 0;
	_animation.duration = duration;
	_animation.callback = callback;
	_animation.callback.call();
}

function animationStep()
{
	if (_animation.position == 1)
	{
		return;
	}
	
	_animation.time += Math.min(_dt, _animation.duration);
	_animation.position = Math.min(1, _animation.time / _animation.duration);
	_animation.callback.call();
}

function animationPlanetLanding()
{
	_p3 = clamp(Math.pow(_animation.position, 2) * 100, 0, 1);
	_p2 = 1 - Math.pow(1 - _animation.position, 2);
	_p3Reversed = false
	
	if (_p3 == 1)
	{
		_layers[0].visible = false;
	}
}

function animationPlanetLeaving()
{
	_p2 = 1;
	_p3 = Math.pow(_animation.position, 3);
	_p3Reversed = true;
	
	if (_p3 == 1)
	{
		_layers[2].visible = false;
	}
}

function animationSystemZoomIn()
{
	_p4 = Math.pow(_animation.position, 3);
	_p4Reversed = false;
	
	if (_p4 == 1)
	{
		_layers[1].visible = false;
	}
}

function animationSystemZoomOut()
{
	_p4 = Math.pow(1 - _animation.position, 3);
	_p4Reversed = true;
	
	if (_p4 == 0)
	{
		_layers[0].visible = false;
	}
}

function animationWormhole()
{
	if (_animation.position == 0)
	{
		_layers[3].visible = true;
		restartWormhole();
	}
	else if (_animation.position < 0.25)
	{
	}
	else if (_animation.position < 1)
	{
		_layers[0].visible = true;
		_layers[1].visible = false;
	}
	else if (_animation.position == 1)
	{
		_layers[3].visible = false;
	}
}

function animationTitleHide()
{
	_layers[1].visible = true;
	
	if (_animation.position == 1)
	{
		_layers[4].visible = false;
	}
}

function animationTitleShow()
{
	if (_animation.position == 1)
	{
		_p4 = 0;
		_layers[4].visible = true;
		_layers[2].visible = false;
	}
}
