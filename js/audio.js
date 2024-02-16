//
// HHSAdv for WEB 
//     Copyright(c)2012-2024 ZOBplus hiro <hiro@zob.jp>
//

class ZAudio
{
    static sources = [
        "highschool", "charumera", "explosion", "",  "in_toilet", "acid",
    ];
    constructor(base_uri)
    {
        this._base_uri = base_uri;
    }
    get base_uri() { return this._base_uri; }
    play(n)
    {
        if (n < 0 || n >= ZAudio.sources.length || ZAudio.sources[n] == "") return;
        var m = new Audio();
        m.src = this.base_uri + "/data/" + ZAudio.sources[n] + ".mp3";
        m.load();
        m.volume = 1.0;
        m.loop = false;
        m.play();
    }
}