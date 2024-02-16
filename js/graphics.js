// Graphics routine for HHSAdv with HTML5 Canvas
// Copyright(c) 2012-2024 ZOBPlus hiro <hiro@zob.jp>
//

class Point
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}
}

class RGBA
{
	constructor(r, g, b, a)
	{
		this.red = r;
		this.green = g;
		this.blue = b;
		this.alpha = a;
	}
    rgba(i)
    {
		var r = null;
		switch (i)
		{
			case 0: r = this.red; break;
			case 1: r = this.green; break;
			case 2: r = this.blue; break;
			case 3: r = this.alpha; break;
		}
		return r;
    }

    get to_i()
    {
		return (this.red << 24) | (this.green << 16) | (this.blue << 8) | this.alpha;
    };

    get to_s()
    {
		return "rgb(" + this.red + ", " + this.green + ", " + this.blue + ")";
	}
}

class Bitmap
{
	constructor(ctx, width, height)
	{
		this.width = width;
		this.height = height;
		this.context = ctx;
		this.data = new Uint8Array(width * height);
	}
	//get data() { return this.bitmap.data; }
	get image()
	{
		var bitmap = this.context.createImageData(this.width, this.height);
		for (var i = 0 ; i < this.width * this.height ; i++)
		{
			bitmap.data[4 * i + 0] = this.data[4* i + 0];
			bitmap.data[4 * i + 1] = this.data[4* i + 1];
			bitmap.data[4 * i + 2] = this.data[4* i + 2];
			bitmap.data[4 * i + 3] = this.data[4* i + 3];
		}
		return bitmap;
	}
}

class ZGraphics
{
	static blueFilter = [
		0.0, 0.0, 0.1,
		0.0, 0.0, 0.2,
		0.0, 0.0, 0.7,
	];
	
	static redFilter = [
		0.7, 0.0, 0.0,
		0.2, 0.0, 0.0,
		0.1, 0.0, 0.0,
	];
	
	static sepiaFilter = [
		0.269021, 0.527950, 0.103030,
		0.209238, 0.410628, 0.080135,
		0.119565, 0.234644, 0.045791,
	];
	
	constructor(canvas)
	{
		this.zctx = canvas.getContext('2d');
		this.zctx.imageSmoothingEnabled = true;
		this.zctx.mozImageSmoothingEnabled = true;
		this.zctx.webkitImageSmoothingEnabled = true;
		this.zctx.msImageSmoothingEnabled = true;
		this.width = 256;
		this.height = 152;
		this.canvas = document.createElement("canvas");
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.context = this.canvas.getContext('2d');
    	this.buf = new Bitmap(this.context, this.width, this.height); 
		this.bitmap = this.context.createImageData(this.width, this.height);
		this.cf = undefined;
		for (var i = 0 ; i < this.width * this.height ; i++)
		{
			this.bitmap.data[4*i + 0] = 0x00;
			this.bitmap.data[4*i + 1] = 0x00;
			this.bitmap.data[4*i + 2] = 0x00;
			this.bitmap.data[4*i + 3] = 0xff;
		}
		this.preset = new Array(
			new RGBA(0x00, 0x00, 0x00, 0xff),
			new RGBA(0x00, 0x00, 0xff, 0xff),
			new RGBA(0xff, 0x00, 0x00, 0xff),
			new RGBA(0xff, 0x00, 0xff, 0xff),
			new RGBA(0x00, 0xff, 0x00, 0xff),
			new RGBA(0x00, 0xff, 0xff, 0xff),
			new RGBA(0xff, 0xff, 0x00, 0xff),
			new RGBA(0xff, 0xff, 0xff, 0xff),
			new RGBA(0xc0, 0xc0, 0x00, 0xff),  // OLIVE
			new RGBA(0xf4, 0xbe, 0x9b, 0xff),  // 肌色
			new RGBA(0x80, 0x00, 0x00, 0xff)   // MAROON
		);
		this.gflush();
	}
	set colorFilter(f) { this.cf = f; }
	get colorFilter() { return this.cf; }
	applyFilter()
	{
		if (this.colorFilter != undefined)
		{
			for (var i = 0 ; i < this.width * this.height ; i++)
			{
				var index = i * 4;
				var red   = this.bitmap.data[index + 0];
				var green = this.bitmap.data[index + 1];
				var blue  = this.bitmap.data[index + 2];
				this.bitmap.data[index + 0] = Math.round(this.colorFilter[0] * red + this.colorFilter[1] * green + this.colorFilter[2] * blue);
				this.bitmap.data[index + 1] = Math.round(this.colorFilter[3] * red + this.colorFilter[4] * green + this.colorFilter[5] * blue);
				this.bitmap.data[index + 2] = Math.round(this.colorFilter[6] * red + this.colorFilter[7] * green + this.colorFilter[8] * blue);
			}
		}
		this.gflush();
	}
    c2rgba(c)
    {
		return this.preset[c];
    }


    rgba2c(rgba)
    {
		var c = 0;
		switch(rgba.to_i)
		{
		case 0x000000ff: c = 0; break;
		case 0x0000ffff: c = 1; break;
		case 0xff0000ff: c = 2; break;
		case 0xff00ffff: c = 3; break;
		case 0x00ff00ff: c = 4; break;
		case 0x00ffffff: c = 5; break;
		case 0xffff00ff: c = 6; break;
		case 0xffffffff: c = 7; break;
		case 0xc0c000ff: c = 8; break; // OLIVE
		case 0xf4be9bff: c = 9; break; // 肌色
		case 0x800000ff: c =10; break; // MAROON
		}
		return c;
    }

    gflush()
    {
		this.context.putImageData(this.bitmap, 0, 0);
	    this.zctx.drawImage(this.canvas, 0, 0, this.width, this.height, 0, 0, this.zctx.canvas.width, this.zctx.canvas.height);
    }

    psetrgba(x, y, rgba)
    {
		var index = (x + this.width * y) * 4;
		this.bitmap.data[index+0] = rgba.red;
		this.bitmap.data[index+1] = rgba.green;
		this.bitmap.data[index+2] = rgba.blue;
		this.bitmap.data[index+3] = rgba.alpha;
    }

    pset(x, y, c)
    {
		var rgba = this.c2rgba(c);
		this.psetrgba(x, y, rgba);
	    this.buf[x + this.width * y] = c;
    }

    pget(x, y)
    {
	    return this.buf[x + this.width * y];
    }

    line(sx, sy, ex, ey, c)
    {
		var dy = ey - sy;
		var ddy = 1;
		if (dy < 0)
		{
			ddy = -1;
			dy = -dy;
		}
		var wy = Math.floor(dy / 2);

		var dx = ex - sx;
		var ddx = 1;
		if (dx < 0)
		{
			ddx = -1;
			dx = -dx;
		}
		var wx = Math.floor(dx / 2);

		this.pset(sx, sy, c);
		if (dx > dy)
		{
			var y = sy;
			for (var x = sx ; x != ex ; x += ddx)
			{
				this.pset(x, y, c);
				wx -= dy;
				if (wx < 0)
				{
					wx += dx;
					y += ddy;
				}
			}
		}
		else
		{
			var x = sx;
			for (var y = sy ; y != ey ; y += ddy)
			{
				this.pset(x, y, c);
				wy -= dx;
				if (wy < 0)
				{
					wy += dy;
					x += ddx;
				}
			}
		}
		this.pset(ex, ey, c);
		//this.gflush();
    }

    paint(sx, sy, fgc, bgc)
    {
		var fifo = new Array();
		var cc = this.pget(sx, sy);
		if (cc == fgc || cc == bgc)
		{
			return;
		}
		fifo.push(new Point(sx, sy));
		while(fifo.length > 0)
		{
			var p = fifo.shift();
			cc = this.pget(p.x, p.y);
			if (cc == fgc || cc == bgc)
			{
				continue;
			}
			for (var l = p.x - 1 ; l >= 0 ; l--)
			{
				cc = this.pget(l, p.y);
				if (cc == fgc || cc == bgc)
				{
					break;
				}
			}
			++l;
			for (var r = p.x + 1 ; r < this.width ; r++)
			{
				cc = this.pget(r, p.y);
				if (cc == fgc || cc == bgc)
				{
					break;
				}
			}
			--r;
			this.line(l, p.y, r, p.y, fgc);
			for (var wx = l ; wx <= r ; wx++)
			{
				var uy = p.y - 1;
				if (uy >= 0)
				{
					cc = this.pget(wx, uy);
					if (cc != fgc && cc !=bgc)
					{
						if (wx == r)
						{
							fifo.push(new Point(wx, uy));
						}
						else
						{
							cc = this.pget(wx + 1, uy);
							if (cc == fgc || cc == bgc)
							{
								fifo.push(new Point(wx, uy));
							}
						}
					}
				}
				var ly = p.y + 1;
				if (ly < this.height)
				{
					cc = this.pget(wx, ly);
					if (cc != fgc && cc !=bgc)
					{
						if (wx == r)
						{
							fifo.push(new Point(wx, ly));
						}
						else
						{
							cc = this.pget(wx + 1, ly);
							if (cc == fgc || cc == bgc)
							{
								fifo.push(new Point(wx, ly));
							}
						}
					}
				}
			}
		}
		//this.gflush();
    }

    tonePaint(tone)
    {
		var pat = new Array(8);
		var col = new Array(8);
		for (var i = 0 ; i < 8 ; i++)
		{
			pat[i] = this.c2rgba(i);
			col[i] = this.c2rgba(i);
		}
		var p = 0;
		var n = tone[p++];
		for (var i = 1 ; i <= n ; i++)
		{
			var blue  = tone[p++];
			var red   = tone[p++];
			var green = tone[p++];
			pat[i] = new RGBA(red, green, blue, 0xff);
			blue = red = green = 0;
			for (var bit = 0 ; bit < 8 ; bit++)
			{
				var mask = (1 << bit);
				if ((pat[i].blue & mask) != 0)
				{
					++blue;
				}
				if ((pat[i].red & mask) != 0)
				{
					++red;
				}
				if ((pat[i].green & mask) != 0)
				{
					++green;
				}
			}
			red = (red == 0) ? 0 : red * 32 - 1;
			green = (green == 0) ? 0 : green * 32 - 1;
			blue = (blue == 0) ? 0 : blue * 32 - 1;
			col[i] = new RGBA(red, green, blue, 0xff);
		}
		// replace color if neccesarry.
		for (var wy = 0 ; wy < this.height ; wy++)
		{
			for (var wx = 0 ; wx < this.width ; wx++)
			{
				var cc = this.pget(wx, wy);
				this.psetrgba(wx, wy, col[cc]);
			}
		}
		//this.gflush();
    }

	drawRect(sx, sy, ex, ey, c)
	{
		if (sx > ex)
		{
			var tx = ex;
			ex = sx;
			sx = tx;
		}
		if (sy > ey)
		{
			var ty = ey;
			ey = sy;
			sy = ty;
		}
		for (var x = sx ; x <= ex ; x++)
		{
			this.pset(x, sy, c);
			if (sy == ey) continue;
			this.pset(x, ey, c);
		}
		for (var y = sx ; y <= ey ; y++)
		{
			this.pset(sx, y, c);
			if (sx == ex) continue;
			this.pset(ex, y, c);
		}
		this.gflush();
	}

    fillRect(sx, sy, ex, ey, c)
    {
		if (sx > ex)
		{
			var tx = ex;
			ex = sx;
			sx = tx;
		}
		if (sy > ey)
		{
			var ty = ey;
			ey = sy;
			sy = ty;
		}
		for (var y = sy ; y <= ey ; y++)
		{
			this.line(sx, y, ex, y, c);
		}
		this.gflush();
    }

    gcls(c)
    {
		if (c == null)
		{
			c = 0;
		}
		this.fillRect(0, 0, this.width - 1, this.height - 1, c);
    }
}
