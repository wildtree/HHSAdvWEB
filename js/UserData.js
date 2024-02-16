//
// HHSAdv for WEB / User Data
//     Copyright(c)2012-2024 ZOBplus hiro <hiro@zob.jp>
//


class MapLink
{
	constructor(b)
	{
		this._n = b[0];
		this._s = b[1];
		this._w = b[2];
		this._e = b[3];
		this._u = b[4];
		this._d = b[5];
		this._i = b[6];
		this._o = b[7];
	}

    set(id, v)
	{
		switch(id)
		{
		case 0: this._n = v; break;
		case 1: this._s = v; break;
		case 2: this._w = v; break;
		case 3: this._e = v; break;
		case 4: this._u = v; break;
		case 5: this._d = v; break;
		case 6: this._i = v; break;
		case 7: this._o = v; break;
		}
    };
    get(id)
    {
		var v = -1;
		switch(id)
		{
		case 0: v = this._n; break;
		case 1: v = this._s; break;
		case 2: v = this._w; break;
		case 3: v = this._e; break;
		case 4: v = this._u; break;
		case 5: v = this._d; break;
		case 6: v = this._i; break;
		case 7: v = this._o; break;
		}
		return v;
    };
    get n() { return this._n; }
    get s() { return this._s; }
    get w() { return this._w; }
    get e() { return this._e; }
    get u() { return this._u; }
    get d() { return this._d; }
    get i() { return this._i; }
    get o() { return this._o; }
    get pack()
	{
		var packed = new Uint8Array(8);
		for (var i = 0 ; i < packed.length ; i++)
		{
	    	packed[i] = this.get(i);
		}
		return packed;
    }
    set unpack(buf)
	{
		for (var i = 0 ; i < buf.length ; i++)
		{
	    	this.set(i, buf[i]);
		}
    }
}

class UserData
{
	static LINK_SIZE = 8;
    static LINKS = 87;
    static ITEMS = 12;
    static FLAGS = 15;
    static ITEMS_OFFSET = 0x301;
    static FLAGS_OFFSET = 0x311;
    static RECORD_SIZE  = 0x800;
    static PACKED_SIZE  = UserData.LINKS * UserData.LINK_SIZE + UserData.ITEMS + UserData.FLAGS;
	static zInventoryLabels = [
		"ネクタイ",
		"制服",
		"鍵",
		"懐中電灯",
		"乾電池",
		"ビデオテープ",
		"ファイル",
		"ダイナマイト",
		"塩酸",
		"ジャッキ",
		"マッチ",
		"ペンチ"
	];


	constructor(uri)
	{
		this._map = new Array(UserData.LINKS);
		this._place = new Uint8Array(UserData.ITEMS);
		this._fact = new Uint8Array(UserData.FLAGS);
		this._loaded = false;
		this._orig = null;
		fetch(uri).then((res) => res.blob()).then((blob) => blob.arrayBuffer()).then((abuf) => {
			this._orig = new Uint8Array(abuf);
			this.init(this._orig);
		});
		this._loaded = true;
	}
	init(buf)
	{
		for (var i = 0 ; i < UserData.LINKS ; i++)
		{
			var lb = new Uint8Array(UserData.LINK_SIZE);
			for (var j = 0 ; j < UserData.LINK_SIZE ; j++)
			{
				lb[j] = buf[i * UserData.LINK_SIZE + j];
			}
			this._map[i] = new MapLink(lb);
		}
		for (var i = 0 ; i < UserData.ITEMS ; i++)
		{
			this._place[i] = buf[UserData.ITEMS_OFFSET + i];
		}
		for (var i = 0 ; i < UserData.FLAGS ; i++)
		{
			this._fact[i] = buf[UserData.FLAGS_OFFSET + i];
		}
	}
	restore() { this.init(this._orig); }
	get loaded() { return this._loaded; }
    get packed_size() { return UserData.PACKED_SIZE; }
    map(id, d, x)
    {
		if (x == undefined)
		{
	    	return this._map[id].get(d);
		}
		else
		{
	    	this._map[id].set(d, x);
		}
    }
    place(id, x)
    {
		if (x == undefined)
		{
	    	return this._place[id];
		}
		else
		{
	    	this._place[id] = x;
		}
    }
    fact(id, x)
    {
		if (x == undefined)
		{
	    	return this._fact[id];
		}
		else
		{
	    	this._fact[id] = x;
		}
    }
    get places() {return this._place.length; }
    get facts() { return this._fact.length; }

    progress(global)
    {
		if (this._fact[3] > 0 && this._fact[7] == 1)
		{
	    	// light on ... battery update
		    --this._fact[3];
		    if (this._fact[3] < 8 && this._fact[3] > 0)
	    	{
				this._fact[6] = 1; // dim
				global.message().print(0xd9);
	    	}
	    	if (this._fact[3] == 0)
	    	{
				this._fact[7] = 0; // light off forever...
				global.message().print(0xc0);
	    	}
		}
		// count down
		if (this._fact[11] > 0)
		{
	    	if (--this._fact[11] == 0)
	    	{
				// soundplay #2
				global.message.print(0xd8);
				if (this._place[7] == 48)
				{
			    	this._map[75 - 1].set(0, 77);
				    this._map[68 - 1].set(2, 77);
				    global.message.print(0xda);
				}
				if (this._place[7] == 255 || this._place[7] == global.zSystem.mapId)
				{
				    // You must die!!
				    // change color filter to red if possible!
				    global.message.print(0xcf);
				    global.message.print(0xcb);
				    global.gameOver();
				}
				else
				{
				    this._place[7] = 0; // explosion ... lost the dynamite
				}
		    }
		}
    }
    get pack()
    {
		var packed = new Uint8Array(UserData.PACKED_SIZE);
		var p = 0;
		for (var i = 0 ; i < UserData.LINKS ; i++)
		{
	    	var m = this._map[i];
		    var pp = m.pack;
		    for (var j = 0 ; j < UserData.LINK_SIZE ; j++)
	    	{
				packed[p++] = pp[j];
		    }
		}
		for (var i = 0 ; i < UserData.ITEMS ; i++)
		{
		    packed[p++] = this._place[i];
		}
		for (var i = 0 ; i < UserData.FLAGS ; i++)
		{
	    	packed[p++] = this._fact[i];
		}
		return packed;
    }
    set unpack(buf)
    {
		var p = 0;
		for (var i = 0 ; i < UserData.LINKS ; i++)
		{
	    	for (var j = 0 ; j < UserData.LINK_SIZE ; j++)
	    	{
				this._map[i].set(j, buf[p++]);
	    	}
		}
		for (var i = 0 ; i < UserData.ITEMS ; i++)
		{
	    	this._place[i] = buf[p++];
		}
		for (var i = 0 ; i < UserData.FLAGS ; i++)
		{
		    this._fact[i] = buf[p++];
		}
    }
    getLabel(i)
    {
		if (i >= 0 && i < UserData.ITEMS)
		{
	    	return UserData.zInventoryLabels[i];
		}
		return undefined;
    }
}
