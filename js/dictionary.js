//
// HHSAdv for WEB / dictionary
//     Copyright(c)2012-2024 ZOBplus hiro <hiro@zob.jp>
//

class ZWord
{
	constructor(buf)
	{
		this._word = "";
		this._id = -1;
		for (var i = 0 ; i < 4 ; i++)
		{
			var z = buf[i];
			if (z == 0) break;
			this._word += String.fromCharCode(z - 1);
			this._id = buf[4];
		}

	}
    get valid() { return this._id >= 0; }
    get id() { return this._id; }
    match(v)
    {
		var z = v + "    ";
		z = z.substr(0, 4);
		if (z.toUpperCase() == this._word.toUpperCase())
		{
	    	return true;
		}
		return false;
    };
}

class Dictionary
{
    static MAX_VERBS   = 100;
    static MAX_OBJS    = 100;
    static BLOCK_SIZE  = 5;
    static RECORD_SIZE = 0x200;
	constructor(uri)
	{
		this._cmdList = new Array(Dictionary.MAX_VERBS);
		this._objList = new Array(Dictionary.MAX_OBJS);
		this._loaded = false;
		fetch(uri).then((res) => res.blob()).then((blob) => blob.arrayBuffer()).then((abuf) => 
		{
			var buf = new Uint8Array(abuf);
		    var wb = new Uint8Array(5);
		    var len = 0
		    for (var i = 0 ; i < Dictionary.MAX_VERBS ; i++)
	    	{
				for (var j = 0 ; j < Dictionary.BLOCK_SIZE ; j++)
				{
			    	wb[j] = buf[i * Dictionary.BLOCK_SIZE + j];
				}
				len += Dictionary.BLOCK_SIZE;
				if (len >= Dictionary.RECORD_SIZE || wb[0] == 0)
				{
			    	break;
				}
				this._cmdList[i] = new ZWord(wb);
    		}
    		len = 0;
		    for (var i = 0 ; i < Dictionary.MAX_OBJS ; i++)
		    {
				for (var j = 0 ; j < Dictionary.BLOCK_SIZE ; j++)
				{
				    wb[j] = buf[Dictionary.RECORD_SIZE + i * Dictionary.BLOCK_SIZE + j];
				}
				len += Dictionary.BLOCK_SIZE;
				if (len >= Dictionary.RECORD_SIZE || wb[0] == 0) break;
				this._objList[i] = new ZWord(wb);
		    }
			this._loaded = true;
		});
	}

	get loaded() { return this._loaded; }

    searchV(v)
    {
		for (var i = 0 ; i < Dictionary.MAX_VERBS ; i++)
		{
	    	var cmd = this._cmdList[i];
		    if (cmd == undefined || !cmd.valid) break;
		    if (cmd.match(v)) return cmd.id;
		}
		return 0;
    }

    searchO(o)
    {
		for (var i = 0 ; i < Dictionary.MAX_OBJS ; i++)
		{
	    	var obj = this._objList[i];
		    if (obj == undefined || !obj.valid) break;
		    if (obj.match(o)) return obj.id;
		}
		return 0;
    }
}
