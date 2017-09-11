function getNoiseLayer(pow, color)
{
	// heightmap generation using random midpoint displacement
	
	// 0 1 2 3 4 5 6 7 8
	// x               x - init
	// .       x       . - 4
	// .   x   .   x   . - 2
	// . x . x . x . x . - 1
	
	let x, y, step, max_elevation, size, map, p, d, a, b, canvas, ctx;
	
	size = 2048;
	
	canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	
	ctx = canvas.getContext("2d");
	
	map = [];
	
	// initialize the grid with default values
	for (x=0; x<=size; x++)
	{
		map[x] = [];
		
		for (y=0; y<=size; y++)
		{
			map[x][y] = 0;
		}
	}
	
	step = size;
	max_elevation = 1;
	
	while (step > 0)
	{
		for (y=0; y<size; y+=step)
		{
			for (x=step; x<size; x+= step * 2)
			{
			map[x][y] = (map[x - step][y] + map[x + step][y]) / 2 + randPlusMinus(max_elevation);
			}
		}
		
		for (x=0; x<size; x+=step)
		{
			for (y=step; y<size; y+=step * 2)
			{
				map[x][y] = (map[x][y - step] + map[x][y + step]) / 2 + randPlusMinus(max_elevation);
			}
		}
		
		step = Math.floor(step / 2);
		max_elevation /= 2;
	}
	
	// normalization
	min = 1.0;
	max = 0.0;
	
	// find limits
	for (x=0; x<size; x++)
	{
		for (y=0; y<size; y++)
		{
			min = Math.min(min, map[x][y]);
			max = Math.max(max, map[x][y]);
		}
	}
	
/*
	// normalize map
	for (x=0; x<size; x++)
	{
		for (y=0; y<size; y++)
		{
			map[x][y] = (map[x][y] - min) * (1 / (max - min));
		}
	}
*/
	d = ctx.getImageData(0, 0, size, size);
	
	// normalization + output
	for (x=0; x<size; x++)
	{
		for (y=0; y<size; y++)
		{
			a = Math.pow((map[x][y] - min) * (1 / (max - min)), pow);
			
			b = Math.floor(Math.pow(a, 15) * 255);
			
			// map[x][y] = (map[x][y] - min) * (1 / (max - min));
			
			d.data[(y * size + x) * 4] = clamp(color[0] + b, 0, 255);
			d.data[(y * size + x) * 4 + 1] = clamp(color[1] + b, 0, 255);
			d.data[(y * size + x) * 4 + 2] = clamp(color[2] + b, 0, 255);
			d.data[(y * size + x) * 4 + 3] = Math.floor(a * 255);
		}
	}
	
	ctx.putImageData(d, 0, 0);
	
	return canvas;
}

function aNoise()
{
}

/*
function aNoise()
{
	let x, y, d, b, c, e;
	
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, _windowWidth, _windowHeight);
	
	d = ctx.getImageData(0, 0, _windowWidth, _windowHeight);
	
	b = getNoiseLayer();
	c = getNoiseLayer();
	e = getNoiseLayer();
	
	for (x=0; x<512; x++)
	{
		for (y=0; y<512; y++)
		{
			br = clamp(Math.floor(b[x][y] * 300 + c[x][y] *  30 + e[x][y] *  50, 0, 255));
			bg = clamp(Math.floor(b[x][y] * 120 + c[x][y] * 200 + e[x][y] * 255, 0, 255));
			bb = clamp(Math.floor(b[x][y] *  30 + c[x][y] * 255 + e[x][y] * 120, 0, 255));
			
			d.data[(y * _windowWidth + x) * 4] = br;
			d.data[(y * _windowWidth + x) * 4 + 2] = bg;
			d.data[(y * _windowWidth + x) * 4 + 3] = bb;
		}
	}
	
	ctx.putImageData(d, 0, 0);
}
*/
