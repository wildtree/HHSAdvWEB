//
// HHSAdv for WEB 
//     Copyright(c)2012-2024 ZOBplus hiro <hiro@zob.jp>
//

class Database 
{
	static DBNAME  = "hhsadvdb";
	static STORENAME = "gamedata";
	static PREFSTORE = "prefs";
	static VERSION = 2;

	constructor()
	{
		this._dbh = undefined;
		this._done = false;
	}

	get database()
	{
	
	}

	requuest(f)
	{
		const req = indexedDB.open(Database.DBNAME,Database.VERSION);
		req.onsuccess = f;
		req.onupgradeneeded = (event) =>
		{
			const db = event.target.result;
			const oldver = event.oldVersion;
			const newver = event.newVersion;
			const migrations = {
				"1": () => {
					db.createObjectStore(Database.STORENAME, {keyPath:'id'});
				},
				"2": () => {
					db.createObjectStore(Database.PREFSTORE, {keyPath:'pref'});
				}
			}
			for (var v = oldver + 1 ; v <= newver ; v++)
			{
				if (migrations[v]) migrations[v]();
			}
		};
		req.onerror = (event) => 
		{
			window.alert("データベースを開けませんでした:" + req.error);
		};
	}

	saveprefs(g)
	{
		this.requuest((event) =>
		{
			const db = event.target.result;
			const trans = db.transaction(Database.PREFSTORE, 'readwrite');
			const objstore = trans.objectStore(Database.PREFSTORE);
			var mute = {
				pref: "mute",
				value: g.muted
			};
			objstore.put(mute);
		});
	}

	loadprefs(g)
	{
		this.requuest((event) => {
			const db = event.target.result;
			const trans = db.transaction(Database.PREFSTORE, 'readonly');
			const objstore = trans.objectStore(Database.PREFSTORE);
			var getreq = objstore.getAll();
			getreq.onsuccess = (event) => {
				const rows = event.target.result;
				if (rows == undefined) return;
				rows.forEach(element => {
					switch(element['pref'])
					{
					case 'mute': g.mute	= element['value']; break;
					}
				});
			};
		});
	}

	saveGame(fileno, user, system)
	{
		this.requuest((event) =>
		{
			const db = event.target.result;
			const trans = db.transaction(Database.STORENAME, 'readwrite');
			const objstore = trans.objectStore(Database.STORENAME);
			var udata = user.pack;
			var sdata = system.pack;
			var u = "";
			var s = "";
			for (var i = 0 ; i < user.packed_size ; i++)
			{
				u += String.fromCharCode(udata[i]);
			}
			for (var i = 0 ; i < system.packed_size ; i++)
			{
				s += String.fromCharCode(sdata[i]);
			}
			var d = {
				id: fileno,
				user: btoa(u),
				system: btoa(s),
			};
			objstore.put(d);
		});
	}

	loadGame(fileno, user, system)
	{
		this._done = false;
		this.requuest((event) =>
		{
			const db = event.target.result;
			const trans = db.transaction(Database.STORENAME, 'readonly');
			const objstore = trans.objectStore(Database.STORENAME);
			var getreq = objstore.get(fileno);
			getreq.onsuccess = (event) => {
				var d = event.target.result;
				var udata = new Uint8Array(user.packed_size);
				var sdata = new Uint8Array(system.packed_size);
				var u = atob(d['user']);
				var s = atob(d['system']);
				for (var i = 0 ; i < user.packed_size ; i++)
				{
					udata[i] = u.charCodeAt(i);
				}
				for (var i = 0 ; i < system.packed_size ; i++)
				{
					sdata[i] = s.charCodeAt(i);
				}
				user.unpack = udata;
				system.unpack = sdata;
				this._done = true;
			}
			trans.oncomplete = () => {  };
		});
	}

	wait(f)
	{
		var timerId = setInterval(() => {
			if (this._done)
			{
				clearInterval(timerId);
				if (f != undefined) f();
			}
		}, 200);
	}
}
