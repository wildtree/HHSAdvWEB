//
// HHSAdv for WEB / adventure engine
//     Copyright(c)2012-2024 ZOBplus hiro <hiro@zob.jp>
//

class RuleBlock
{
	constructor(buf)
	{
		var header = ((buf[0] & 0xff) << 8) | (buf[1] & 0xff);
		this._action = (header & 0x8000) >> 15;
		this._op     = (header & 0x7000) >> 12;
		this._type   = (header & 0x00e0) >>  5;
		this._id     = (header & 0x001f);

		this._body_offset = (buf[2] & 0xff);
		this._body_value  = (buf[3] & 0xff);
		this._body_type   = (this._body_offset & 0xe0) >> 5;
		this._body_id     = (this._body_offset & 0x1f);
	}

    get action() { return this._action; }
    get op() { return this._op; }
    get type() { return this._type; }
    get id() { return this._id; }
    get body_type() { return this._body_type; }
    get body_id() { return this._body_id; }
    get value() { return this._body_value; }
    get offset() { return this._body_offset; }
    getOperand1(params, user)
    {
		var v = 0;
		switch (this.type)
		{
		case 0: break;
		case 1: v = user.fact(this.id); break;
		case 2: v = user.place(this.id); break;
		case 3: params.random(0); v = params.table(this.id); break;
		case 4: v = user.map(this.offset - 1, this.id); break; 
		}
		return v;
    }
    getOperand2(params, user)
    {
		var v = this.value;
		if (this.body_type != 0 && this.type != 4)
		{
	    	switch(this.body_type)
		    {
		    case 1: v = user.fact(this.body_id); break;
	    	case 2: v = user.place(this.body_id); break;
		    case 3: params.random(0); v = params.table(this.body_id); break;
		    }
		}
		return v;
    }
    get actCmp() { return this.action == 0; }
    get actAction() { return this.action == 1; }
    doCompare(params, user)
    {
		var ok = false;
		var v1 = this.getOperand1(params, user);
		var v2 = this.getOperand2(params, user);
		switch (this.op)
		{
		case 1: ok = (v1 == v2); break;
		case 2: ok = (v1 != v2); break;
		case 3: ok = (v1 > v2);  break;
		case 4: ok = (v1 >= v2); break;
		case 5: ok = (v1 < v2);  break;
		case 6: ok = (v1 <= v2); break;
		}
		return ok;
    }
    doAction(global)
    {
		var ok = false;
		var user = global.userData;
		var params = global.zSystem;
		var message = global.message;

		switch(this.op)
		{
		case 1:
		    if (user.map(params.mapId - 1, this.value) != 0)
	    	{
				params.mapId = user.map(params.mapId - 1, this.value);
				return true;
	    	}
		    // teacher check
		    if (user.fact(1) == params.mapId && params.random() > 85)
	    	{
				message.print(0xb5); // U are arrested by the teacher!!
				global.draw(0);
				user.fact(1, 0);
				global.gameOver();
			return false;
		    }
		    message.print(0xb6); // You cannot move!
		    return true;
		case 2:
		    var v1 = this.offset;
		    var v2 = this.getOperand2(params, user);
	    	switch (this.type)
		    {
		    case 1: user.fact(this.id, v2); break;
	    	case 2: user.place(this.id, v2); break;
		    case 3: params.table(this.id, (v2 & 0xff)); break;
		    case 4: user.map(v1 - 1, this.id, v2); break;
	    	}
		    if (this.type == 2 || this.type == 1)
		    {
				return true;
		    }
	    	if (this.type == 3)
		    {
				if (this.id == 5)
				{
				    params.random(0);
				}
		    }
		    return true;
		case 3:
		    message.print(this.value);
		    return true;
		case 4:
		    // dialogue box by this.value
		    global.dialog(this.value);
	    	return true;
		case 5:
		    if (this.value == 0)
	    	{
				params.mapId = params.mapView;
				params.mapView = 0;
		    }
		    else
	    	{
				params.mapView = params.mapId;
				params.mapId = this.value;
		    }
		    return true;
		case 6: // play sound by this._body_value;
			global.play(this.value);
		    return true;
		case 7: // Game Over
		    switch(this.value)
	    	{
		    case 0:
				// clear color filter
				global.graphics.colorFilter = undefined;
				global.draw_screen(true);
				global.gameOver();
				user.fact(1, 0);
				break;
		    case 1:
				// set color filter sepia
				global.graphics.colorFiler = ZGraphics.sepiaFilter;
				global.draw_screen(false);
				global.gameOver();
				break;
		    case 2:
				// set color filter red
				global.graphics.colorFiler = ZGraphics.redFilter;
				global.draw_screen(false);
				global.gameClear();
				return false;
		    }
		    global.gameOver();
	    	return false;
		}
		return ok;
    }
}

class RuleBase
{
    static BLOCK_SIZE = 96;
    static BLOCK_COUNT = RuleBase.BLOCK_SIZE / 4 - 1;
	
	constructor(buf)
	{
		this._rules = new Array(RuleBase.BLOCK_COUNT);
		this._map_id = buf[0];
		this._cmd_id = buf[1];
		this._obj_id = buf[2];
		for (var i = 0 ; i < RuleBase.BLOCK_COUNT ; i++)
		{
			var rb = new Uint8Array(4);
			for (var j = 0 ; j < 4 ; j++)
			{
				rb[j] = buf[4 + 4 * i + j];
			}
			this._rules[i] = new RuleBlock(rb);
		}
	}
    get endOfRule() { return (this._map_id == 0xff); }
    get mapId() { return this._map_id; }
    get cmdId() { return this._cmd_id; }
    get objId() { return this._obj_id; }
    about(m, c, o)
    {
		if (c == undefined && o == undefined)
		{
	    	// about(zSystem params)
		    var params = m;
	    	c = params.cmdId;
		    o = params.objId;
		    m = params.mapId;
		}
		if ((this._map_id == m || this._map_id == 0) &&
		    (this._cmd_id == c || this._cmd_id == 0) &&
		    (this._obj_id == o || this._obj_id == 0))
		{
		    return true;
		}
		return false;
    }
    condBlock(params, user) { return true; }
    run(global)
    {
		if (!this.about(global.zSystem))
		{
	    	return false;
		}
		var cond_ok = true;
		var act_ok  = true;
		var i = 0;
		while (this._rules[i].actCmp)
		{
		    cond_ok = this._rules[i++].doCompare(global.zSystem, global.userData);
	    	if (!cond_ok)
		    {
				return false;
	    	}
		}
		if (cond_ok)
		{
		    while (this._rules[i].op != 0)
		    {
				act_ok = this._rules[i++].doAction(global) && act_ok;
		    }
		    if (act_ok)
		    {
				global.message.printOk();
	    	}
		}
		return cond_ok;
    }
}

class Rules
{
    static MAX_RULES  = 256;
    static BLOCK_SIZE = 96;
	constructor(uri)
	{
		this._loaded = false;
		fetch(uri).then((res) => res.blob()).then((blob) => blob.arrayBuffer()).then((abuf) => {
			var buf = new Uint8Array(abuf);
			this._rules = new Array(Rules.MAX_RULES);
			var rb = new Uint8Array(Rules.BLOCK_SIZE);
			for (var i = 0 ; i < Rules.MAX_RULES ; i++)
			{
				var offset = i * Rules.BLOCK_SIZE;
				if (offset >= buf.length) break;
				for (var j = 0 ; j < Rules.BLOCK_SIZE ; j++)
				{
					rb[j] = buf[offset + j];
				}
				this._rules[i] = new RuleBase(rb);
			}
			this._loaded = true;
		});
	}
	get loaded() { return this._loaded; }
    interpreter(global)
    {
		var ok = false;
		for (var i = 0 ; this._rules[i] != undefined && !this._rules[i].endOfRule ; i++)
		{
	    	var rule = this._rules[i];
	    	if (rule.run(global))
	    	{
				ok = true;
				break;
	    	}
		}
		// dialog_id check ...
		//	if (global.flags.dialogId != null)
		//	{
		//	  return;
		//	}
		if (!ok)
		{
		    var msg = global.findMessage();
		    global.message.printStr(msg);
		}
		if (global.zSystem.mapId == 74)
		{
		    var msgid = 0;
		    global.userData.fact(13, global.userData.fact(13) + 1);
	    	switch (global.userData.fact(13))
		    {
		    case 4:  msgid = 0xe2; break;
		    case 6:  msgid = 0xe3; break;
		    case 10: msgid = 0xe4; break;
	    	}
		    if (msgid != 0)
		    {
				global.message.print(msgid);
	    	}
		}
    }
}
