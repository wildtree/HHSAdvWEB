//
// System Parameters for HHSAdv WEB
//     Copyright(c)2012-2024 ZOBplus hiro <hiro@zob.jp>
//

class ZSystem
{
    constructor()
    {
        this._table = new Uint8Array(8);
    }
    
    get packed_size() { return 8;}
    table(id, x)
    {
    	if (x != undefined)
	    {
	        this._table[id] = x;
	    }
	    return this._table[id];
    }
    random(x)
    {
	    this._table[5] = Math.floor(Math.random() * 256);
	    if (x == undefined)
	    {
	        return this._table[5];
	    }
    }
    get mapId() { return this.table(0); }
    get mapView() { return this.table(1); }
    get cmdId() { return this.table(2); }
    get objId() { return this.table(3); }
    get dlgres() { return this.table(4); }
    get dlgOk() { return this.table(6); }
    get dlgMessage() { return this.table(7); }
    set mapId(x) { this.table(0, x); }
    set mapView(x) { this.table(1, x); }
    set cmdId(x) { this.table(2, x); }
    set objId(x) { this.table(3, x); }
    set dlgres(x) { this.table(4, x); }
    set dlgOk(x) { this.table(6, x); }
    set dlgMessage(x) { this.table(7, x); }
    getRandom(d) { return Math.floor(Math.random() * d); }
    get pack() { return this._table; }
    set unpack(buf) {
	    for (var i = 0 ; i < this._table.length ; i++)
	    {
	        this._table[i] = buf[i];
	    }
    }
}

