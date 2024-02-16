//
// HHSAdv for WEB / global variables
//     Copyright(c)2012-2024 ZOBplus hiro <hiro@zob.jp>
//

class SystemFlags
{
	constructor()
	{
    	this.gameover = false;
    	this.dialogId = null;
	}
};

class Global
{
	constructor()
	{
		this.BASE_URI    = document.URL.replace(/\/[^/]+$/, "");
		this.CANVAS_ID   = "HHSAdv";
		this._zSystem    = new ZSystem();
		this._message    = new Message();
		this._zaudio     = new ZAudio(this.BASE_URI);
		this._userData   = new UserData(this.BASE_URI + "/data/data.dat");
		this._dictionary = new Dictionary(this.BASE_URI + "/data/highd.com");
		this._rules      = new Rules(this.BASE_URI + "/data/rule.dat");
		this.flags       = new SystemFlags();
		this._db         = new Database();
		this._graphics   = new ZGraphics(document.getElementById(this.CANVAS_ID));
		this._maps       = new ZMap(this.BASE_URI + "/data/map.dat");
		this._objects    = new ZObjRoot(this.BASE_URI + "/data/thin.dat");
		this._zSystem.mapId = 1; // set the first map id

		this.db.loadprefs(this);
		var mute = document.getElementById("mute");
		if (mute != undefined)
		{
			mute.addEventListener('click', () => {
				this.db.saveprefs(this);
			});
		}
	}

    loadCompleted(f)
    {
		var timerId = setInterval(() =>
		{
	    	if (this._dictionary.loaded &&
				this._userData .loaded &&
				this._rules.loaded &&
				this._maps.loaded &&
				this._objects.loaded)
	    	{
				clearInterval(timerId);
				if (f != undefined) f();
		    }
		}, 200);
    }
	get db() { return this._db; }
    get zSystem() { return this._zSystem; }
    get userData() { return this._userData; }
    get message() { return this._message; }
    get dictionary() { return this._dictionary; }
	get graphics() { return this._graphics; }
	get maps() { return this._maps; }
	get objects() { return this._objects; }
	get rules() { return this._rules; }
	get zaudio() { return this._zaudio; }
	get muted() {
		const mute = document.getElementById("mute");
		if (mute == undefined)
		{
			return false;
		}
		return mute.checked;
	}
	set mute(v) {
		var mute = document.getElementById("mute");
		if (mute != undefined)
		{
			mute.checked = v;
		}
	}

	play(n)
	{
		if (this.muted) return;
		this.zaudio.play(n);
	}
    findMessage()
    {
		var mapId = this.zSystem.mapId;
		var cmdId = this.zSystem.cmdId;
		var objId = this.zSystem.objId;

		var msg = this.maps.get(mapId).find(cmdId, objId);
		if (msg == null)
		{
		    msg = "ダメ";
		}
		return msg;
    }
    msgout(id)
    {
		if ((id & 0x80) == 0)
		{
	    	this.message.printStr(this.findMessage());
		}
		else
		{
	    	this.message.print(id);
		}
    }

	parse(cmdLine)
    {
		var args = cmdLine.split(/\s+/);
		var cmd = null;
		var obj = null;
		if (args.length > 0)
		{
			cmd = args[0];
			if (args.length > 1)
			{
				obj = args[1];
			}
		}
		this.message.printStr(">>> " + args.join(' '));

		this.zSystem.cmdId = this.dictionary.searchV(cmd);
		this.zSystem.objId = this.dictionary.searchO(obj);
		this.zSystem.random(0); // update random table.
		this.userData.progress(this);
		if (this.flags.gameover)
		{
			return; // game over 
		}
		this.rules.interpreter(this);
		this.checkTeacher();
	//	if (this.flags.dialogId != null)
	//	{
	//	    return;
	//	}
    	this.draw_screen(true);
    }
    checkTeacher()
    {
		if (this.flags.gameover || this.userData.fact(1) == this.zSystem.mapId)
		{
			return;
		}
		var rd = 100 + this._zSystem.mapId + ((this.userData.fact(1) > 0) ? 1000 : 0);
		var rz = this.zSystem.getRandom(3000);
		if (rd < rz)
		{
			this.userData.fact(1, 0);
		}
		else
		{
			this.userData.fact(1, this.zSystem.mapId);
		}
		switch (this.zSystem.mapId)
		{
		case 1:
		case 48:
		case 50:
		case 51:
		case 52:
		case 53:
		case 61:
		case 64:
		case 65:
		case 66:
		case 67:
		case 68:
		case 69:
		case 70:
		case 71:
		case 72:
		case 73:
		case 74:
		case 75:
		case 76:
		case 77:
		case 83:
		case 86:
			this.userData.fact(1, 0);
			break;
		}
    }
	check_darkness()
	{
		var dim = false;
		switch(this.zSystem.mapId)
		{
		case 47:
		case 48:
		case 49:
		case 61:
		case 64:
		case 65:
		case 67:
		case 68:
		case 69:
		case 71:
		case 74:
		case 75:
		case 77:
			if (this.userData.fact(7) != 0)
			{
				if (this.userData.fact(6) != 0)
				{
					dim = true;
					this.graphics.colorFilter = ZGraphics.blueFilter;
				}
			}
			else
			{
				// map to 84
				// black out...
				this.zSystem.mapView = this.zSystem.mapId;
				this.zSystem.mapId = 84;

			}
			break;
		default:
			if (this.userData.fact(6) != 0)
			{
				this.graphics.colorFilter = undefined;
			}
			break;
		}
		return dim;
	}
    draw_screen(b)
    {
	   	this.check_darkness();
		var room = this._maps.get(this.zSystem.mapId);
		room.draw(this._graphics);
		if (b && !this.flags.gameover)
		{
			if (room.isBlank)
			{
				this.message.print(0xcc);
			}
			else
			{
				this.message.printStr(room.message());
			}
		}
	    for (var i = 0 ; i < 12 ; i++)
	    {
		if (this.userData.place(i) == this.zSystem.mapId)
		{
			if (i == 1 && this.userData.fact(0) != 1)
			{
				this.objects.draw(this.graphics, i+1, true);
			}
			else
			{
				this.objects.draw(this._graphics, i+1);
			}
			if (b && !this.flags.gameover)
			{
				this.message.print(0x96 + i);
			}
		}
	    }
	    if (this.userData.fact(1) == this.zSystem.mapId)
	    {
		    this.objects.draw(this._graphics, 14);
		    if (b && !this.flags.gameover)
		    {
			    this.message.print(0xb4);
		    }
	    }
		this.graphics.applyFilter(); // apply color filter
    }

    gameOver()
    {
		this.flags.gameover = true;
        this.message.gameOver();
    }
    gameClear()
    {
		this.flags.gameover = true;
		this.message.gameClear();
    }
    gameStart()
    {
		this.zSystem.mapId = 1;
		this.flags.gameover = false;
		// initialize
		this.userData.restore();
	    this.draw_screen(true);
    }

    dialog(type)
    {
        this.flags.dialogId = type;
		switch (type)
		{
		case 0: // gender check
			for(;;)
			{
				var gender = window.prompt('あなたは男の子（ＢＯＹ）ですか？\n女の子（ＧＩＲＬ）ですか？\n（ここであまり悩まないように）');
				gender = gender.replace(/^\s+/, "").replace(/\s+$/, "")
				if (gender.toUpperCase() == 'BOY')
				{
					this.userData.fact(0, 1);
					this.zSystem.dlgres = 1;
					this.zSystem.mapId = 3;
					break;
				}
				else if (gender.toUpperCase() == 'GIRL')
				{
					this.userData.fact(0, 2);
					this.zSystem.dlgres = 2;
					this.zSystem.mapId = 3;
					break;
				}
				window.confirm('"BOY"または"GIRL"のいずれかを入力してください。');
			}
			break;
		case 1: // save / load
			for (;;)
			{
				var fileno = window.prompt('ＦＩＬＥ Ｎｏ．（１，２，３）を ＩＮＰＵＴしてください。\n※データはブラウザ内に保存され、サーバには保存されません。');
				fileno = parseInt(fileno);
				if (fileno >= 1 && fileno <= 3)
				{
					if (this._zSystem.cmdId == 0xf)
					{
						this.saveGame(fileno);
					}
					else
					{
						this.loadGame(fileno);
					}
					break;
				}
				window.confirm("1～3の数値を入力してください。");
			}
			break;
		case 2: // inventory
			var str = "持ち物リスト:\n\n";
			for (var i = 0 ; i < this.userData.places ; i++)
			{
				if (this.userData.place(i) == 0xff)
				{
					str += this.userData.getLabel(i) + "\n";
				}
			}
			window.confirm(str);
			break;
		case 3: // cable choice
			for(;;)
			{
				var cable = window.prompt('赤（ＲＥＤ）と黄色（ＹＥＬＬＯＷ）の、どちらのケーブルを切りますか？');
				cable = cable.replace(/^\s+/, "").replace(/\s+$/, "")
				if (this.userData.place(11) != 0xff)
				{
					// no pinces.
					this.message.print(0xe0);
					break;
				}
				if (cable.toUpperCase() == 'YELLOW')
				{
					this.zSystem.dlgres = 0;
					this.graphics.colorFilter = ZGraphics.redFilter;
					this.draw_screen(false);
					this.message.print(0xc7);
					this.gameOver();
					break;
				}
				else if (cable.toUpperCase() == 'RED')
				{
					this.zSystem.dlgres = 1;
					this.userData.place(11, 0);
					this.zSystem.mapId = 74;
					break;
				}
				window.confirm('"YELLOW"または"RED"のいずれかを入力してください。');
			}
			break;
		default:
			this.flags.dialogId = null; // 
		}
    }
    saveGame(fileno)
	{
		this._db.saveGame(fileno, this.userData, this.zSystem);
	}
    loadGame(fileno)
    {
		this._db.loadGame(fileno, this.userData, this.zSystem);
		this._db.wait(this.loaded);
    }
	loaded()
	{
		this.draw_screen(true);
	}
    set gameOverHandler(f)
    {
		if (f != undefined)
		{
			this._gameOverHandler = f;
		}
		return this._gameOverHandler;
    }
    set gameClearHandler(f)
    {
		if (f != undefined)
		{
			this._gameClearHandler = f;
		}
		return this._gameClearHandler;
    }
}
