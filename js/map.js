//
// HHSAdv for WEB / MAP data handler
//     Copyright(c)2012-2024 ZOBplus hiro <hiro@zob.jp>
//

class MessageMap
{
	constructor(buf)
	{
		this._cmdId = buf[0];
		this._objId = buf[1];
		this._msgId = buf[2] - 1;
	}
	get cmdId() { return this._cmdId; }
	get objId() { return this._objId; }
	get msgId() { return this._msgId; }
}

class Room 
{
    static VECTOR_SIZE = 0x400;
    static RELATION_SIZE = 0x100;
    static MESSAGE_SIZE = 0x500;
    static BLOCK_SIZE   = Room.VECTOR_SIZE + Room.RELATION_SIZE + Room.MESSAGE_SIZE;
    static MAX_MESSAGES = 100;

	constructor(id, buf)
	{
		this._id = id;
		this._messages = new Array(Room.MAX_MESSAGES);
		this._isBlank = false;
		var m = Room.VECTOR_SIZE + Room.RELATION_SIZE;
		// map data
		this._data = new Uint8Array(Room.VECTOR_SIZE);
		for (var v = 0 ; v < Room.VECTOR_SIZE ; v++)
		{
			this._data[v] = buf[v];
		}
		// message
		for (var n = 0 ; m < Room.BLOCK_SIZE ; n++)
		{
			var msg = "";
			var lh = buf[m++];
			var ll = buf[m++];
			var len = (lh << 8) | ll;
			if (len == 0) break;
			var mb = new Array(len);
			for(var i = 0 ; i < len ; i++)
			{
				mb[i] = buf[m++];
			}
			// UTF8 -> Javascript conversion!!
			var msg = "";
			var p = 0;
			var cc = 0;
			while (p < len)
			{
				var b = mb[p++];
				if (b < 0x80) cc = b;
				else if ((b >> 5) === 0x06)	cc = ((b & 0x1f) << 6) | (mb[p++] & 0x3f);
				else if ((b >> 4) === 0x0e)	cc = ((b & 0x0f) << 12) | ((mb[p++] & 0x3f) << 6) | (mb[p++] & 0x3f);
				else cc = ((b & 0x07) << 18) | ((mb[p++] & 0x3f) << 12) | ((mb[p++] & 0x3f) << 6) | (mb[p++] & 0x3f);
				msg += String.fromCharCode(cc);
			}
			this._messages[n] = msg;
		}
		this._message = this._messages[0]; // map message.
		// parse relation table
		this._map = new Array(n);
		var mb = new Uint8Array(3);
		var o = Room.VECTOR_SIZE;
		for (var i = 0 ; i <= n ; i++)
		{
			for (var j = 0 ; j < 3 ; j++)
			{
				mb[j] = buf[o + 3 * i + j];
			}
			this._map[i] = new MessageMap(mb);
			if (this._map[i].cmdId == 0) break;
		}
	}
    get data() { return this._data; }
    get isBlank() { return this._isBlank; }
    blank()
    {
		this._isBlank = true;
    }
    get id() { return this._id; }
    message(msg)
    {
		if (msg != undefined)
		{
	    	this._message = msg;
		}
		return this._message;
    };
    find(c, o)
    {
		for (var i = 0 ; i < this._map.length ; i++)
		{
	    	var mm = this._map[i];
	    	if (mm.cmdId == 0) break;
		    if (mm.cmdId == c && mm.objId == o)
		    {
				return this._messages[mm.msgId];
	    	}
		}
		return null;
    }

	drawOutline(g, i, c)
	{
		var x0 = this._data[i++];
		var y0 = this._data[i++];
		while(true)
		{
			var x1 = this._data[i++];
			var y1 = this._data[i++];
			if (y1 == 0xff)
			{
				if (x1 == 0xff)
				{
					break;  // end of lines.
				}
				x0 = this._data[i++];
				y0 = this._data[i++];
				continue;
			}
			g.line(x0, y0, x1, y1, c);
			x0 = x1;
			y0 = y1;
		}
		return i;
	}
	
	draw(g)
	{
		if (this.isBlank)
		{
			// map is blank 
			g.gcls(0);
			return;
		}
		// fill whole area by ble
		g.gcls(1);
		var p = this._data[0] * 3 + 1; // skip HALF tone data.
		p = this.drawOutline(g, p, 7);
		var x0 = this._data[p++];
		var y0 = this._data[p++];
		while (x0 != 0xff || y0 != 0xff)
		{
			var cc = this._data[p++];
			g.paint(x0, y0, cc, 7);
			x0 = this._data[p++];
			y0 = this._data[p++];
		}
		if (this._data[p] == 0xff && this._data[p + 1] == 0xff)
		{
			p += 2;
		}
		else
		{
			p = this.drawOutline(g, p, 7);
		}
		if (this._data[p] == 0xff && this._data[p + 1] == 0xff)
		{
			p += 2;
		}
		else
		{
			p = this.drawOutline(g, p, 0);
		}
		g.tonePaint(this._data);
	}
}

class ZMap
{
	static BLOCK_SIZE = 0xa00;
	constructor(uri)
	{
		this._mapid;
		this._loaded = false;
		fetch(uri).then((res) => res.blob()).then((blob) => blob.arrayBuffer()).then((abuf) => {
			var buf = new Uint8Array(abuf);
    		var num = Math.ceil(buf.length / ZMap.BLOCK_SIZE); 
    		this._rooms = new Array(num);

		    var rb = new Uint8Array(ZMap.BLOCK_SIZE);
    		for (var i = 0 ; i < num ; i++)
    		{
				var offset = i * ZMap.BLOCK_SIZE;
				for (var j = 0 ; j < ZMap.BLOCK_SIZE ; j++)
				{
			    	rb[j] = buf[offset + j];
				}
				this._rooms[i] = new Room(i, rb);
				if (i == 0 || i == 84 || i == 85)
				{
	    			this._rooms[i].blank();
				}
    		}
			this._loaded = true;
		});
	}
	get rooms() { return this._rooms.length; }
    get(id) { return this._rooms[id]; }
	get loaded() { return this._loaded; }
}

class ZObject
{
	constructor(buf)
	{
		this._v = new Uint8Array(buf);
	}

	_drawOutline(g, ofst, col, ox, oy)
	{
		var x0, y0, x1, y1;
		var p = ofst;
		x0 = (this._v[p++] & 0xff);
		y0 = (this._v[p++] & 0xff);
		for(;;)
		{
			x1 = (this._v[p++] & 0xff);
			y1 = (this._v[p++] & 0xff);
			if (y1 == 0xff)
			{
				if (x1 == 0xff) break;
				x0 = (this._v[p++] & 0xff);
				y0 = (this._v[p++] & 0xff);
				continue;
			}
			g.line(x0 + ox, y0 + oy, x1 + ox, y1 + oy, col);
			y0 = y1;
			x0 = x1;
		}
		return p;
	}
	_draw(g, pre, ofst)
	{
		var o = ofst;
		var b = (this._v[o++] & 0xff);
		var xs = (this._v[o++] & 0xff) / 2;
		var ys = (this._v[o++] & 0xff);
		if (pre) b = 8; // OLIVE 0xc0c000ff
		o = this._drawOutline(g, o, b, xs, ys);
		var x0 = (this._v[o++] & 0xff);
		var y0 = (this._v[o++] & 0xff);
		while (x0 != 0xff || y0 != 0xff)
		{
			var c = (this._v[o++] & 0xff);
			if (pre) c = b;
			g.paint(xs + x0, ys + y0, c, b);
			x0 = (this._v[o++] & 0xff);
			y0 = (this._v[o++] & 0xff);
		}
	}
	draw(g, offset)
	{
		this._draw(g, true, (offset) ? 256 : 0);
		this._draw(g, false,(offset) ? 256 : 0);
	}
}

class ZTeacher extends ZObject
{
	static r1 = [18,24,2,2,2,22,9,0xff];
	static r2 = [148,14,126,6,0,0];
	constructor(buf)
	{
		super(buf);
	}
	draw(g, offset)
	{
		var ox = -32;
		var x0, y0, x1, y1;

		y0 = 63;
		var p = 0;
		for (var i = 0 ; i <= 172 ; i += 2)
		{
			x0 = (this._v[p++] & 0xff);
			x1 = (this._v[p++] & 0xff);
			g.line(ox + x0, y0, ox + x1, y0, 1);
			++y0;
		}
		var c = 0;
		for (var j = 0 ; ZTeacher.r1[j] != 0xff ; j++)
		{
			c = (this._v[p++] & 0xff);
			if (c == 2) c = 10; // use MAROON instead of RED
			x0 = (this._v[p++] & 0xff);
			y0 = (this._v[p++] & 0xff);
			for (var k = 0 ; k <= ZTeacher.r1[j] + 1 ; k++)
			{
				x1 = (this._v[p++] & 0xff);
				y1 = (this._v[p++] & 0xff);
				g.line(ox + x0, y0, ox + x1, y1, c);
				x0 = x1;
				y0 = y1;
			}
			x0 = (this._v[p++] & 0xff);
			y0 = (this._v[p++] & 0xff);
			g.paint(ox + x0, y0, c, c);
		}
		x0 = (this._v[p++] & 0xff);
		y0 = (this._v[p++] & 0xff);
		g.paint(ox + x0, y0, c, c);
		for (var j = 120 ; j < 124 ; j++)
		{
			g.line(ox + j, 64, ox + j + 8, 110, 6);
			g.line(ox + j + 9, 110, ox + j + 11, 126, 7);
		}
	    g.line(ox + 125, 111, ox + 133, 109, 2);
    	g.line(ox + 133, 109, ox + 134, 110, 2);
    	g.line(ox + 134, 110, ox + 125, 112, 2);
    	g.line(ox + 125, 112, ox + 125, 111, 2);

    	g.line(ox + 120, 65, ox + 123, 64, 7);
    	g.line(ox + 123, 64, ox + 121, 62, 7);
    	g.line(ox + 121, 62, ox + 120, 65, 7);

    	g.paint(ox + 122, 63, 7, 7);

    	for(var k = 0 ; ZTeacher.r2[k + 1] != 0 ; k += 2)
    	{
        	x0 = ZTeacher.r2[k];
			c = 9;
        	for (var j = 0 ; j < ZTeacher.r2[k + 1] ; j += 2)
        	{
            	y0 = (this._v[p++] & 0xff);
            	y1 = (this._v[p++] & 0xff);
            	g.line(ox + x0, y0, ox + x0, y1, c);
            	++x0;
            	g.line(ox + x0, y0, ox + x0, y1, c);
            	++x0;
            	y0 = (this._v[p++] & 0xff);
            	y1 = (this._v[p++] & 0xff);
            	g.line(ox + x0, y0, ox + x0, y1, c);
            	++x0;
        	}
    	}
    	g.drawRect(ox + 148, 78, ox + 164, 84, 0);
    	g.fillRect(ox + 149, 79, ox + 163, 83, 7);
    	g.fillRect(ox + 155, 78, ox + 156, 84, 0);
    
    	for(;;)
    	{
        	x1 = (this._v[p++] & 0xff);
        	y1 = (this._v[p++] & 0xff);
        	if (y1 == 0xff)
        	{
            	if (x1 == 0xff) break;
            	x0 = (this._v[p++] & 0xff);
            	y0 = (this._v[p++] & 0xff);
            	continue;
        	}
        	g.line(ox + x0, y0, ox + x1, y1, 0);
        	x0 = x1;
        	y0 = y1;
    	}
		g.gflush();
	}
}

class ZObjRoot
{
	static BLOCK_SIZE = 0x200;
	constructor(uri)
	{
		this._objs = new Array(15);
		this._loaded = false;
		fetch(uri).then((res) => res.blob()).then((blob) => blob.arrayBuffer()).then((abuf) =>
		{
			var buf = new Uint8Array(abuf);
			for (var i = 0 ; i < 15 ; i++)
			{
				var tmp = new Uint8Array(0x200);
				for (var m = 0 ; m < ZObjRoot.BLOCK_SIZE ; m++)
				{
					tmp[m] = buf[m + i * ZObjRoot.BLOCK_SIZE];
				}
				if (i == 14)
				{
					this._objs[i] = new ZTeacher(tmp);
				}
				else
				{
					this._objs[i] = new ZObject(tmp);
				}
			}
			this._loaded = true;
		});
	}

	draw(g, id, offset)
	{
		if (id < 0 || id >= this._objs.length)
		{
			return;
		}
		this._objs[id].draw(g, offset);
	}
	get loaded() { return this._loaded; }
}
