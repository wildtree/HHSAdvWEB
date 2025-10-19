//
// HHSAdv for WEB / Messages
//     Copyright(c)2012-2024 ZOBplus hiro <hiro@zob.jp>
//

class Message
{
	constructor()
	{
		this._msgtbl = new Array(
		"そんな物まで拾うなんてあなたは暇ですねー。",
		"そんな物は持っていません。",
		"見ての通りです。べつに変わった所はありません。",
		"そんなことでは、開きません。",
		"このドアには、鍵は付いていませんよ。",
		"こんなもの開けてどうするんですか？ なんの意味もありませんよ。",
		"そんなとこ登ると危ないですよ。",
		"固定されていて動かせません。体力の無駄ですね。",
		"えっ！！誰と話すのですか？話し相手などはいませんよ。",
		"ここでそんな物を使ってもなんの役にも立ちませんよ。",
		"ここは一応県立高校ですから公共物破損罪で訴えられますよ。",
		"それを見せたところで何も起こりませんよ。",
		"逃げてばかりいないで問題を解決してください。",
		"あなたはケンカ慣れしていません。下手に挑むと痛い目にあいますよ。",
		"そんな物を付けてもゲームには何の関係もありませんよ。もっと有効的なことをしましょう。",
		"あまり訳のわからない物を食べると腹をこわしますよ。",
		"あまり変な物を飲むとあたりますよ。　",
		"何を言っても意味がありませんよ。",
		"作ろうにも材料がありませんよ。",
		"そんな物あげてもあなたが損をするだけですよ。",
		"そんな過激なことはやめて、もっと冷静に行動してください。",
		"ネクタイ（ＮＥＣＫＴＩＥ）が落ちています。",
		"制服（ＵＮＩＦＯＲＭ）が掛かっています。",
		"鍵（ＫＥＹ）が置いてあります。",
		"懐中電灯（ＬＩＧＨＴ）が落ちています。",
		"電池（ＣＥＬＬ）があります。",
		"ビデオテープ（ＴＡＰＥ）が落ちています。",
		"ファイル（ＦＩＬＥ）が落ちています。",
		"ダイナマイト（ＤＹＮＡＭＩＴＥ）が落ちています。",
		"塩酸（ＨＣＬ）が置いてあります。",
		"ジャッキ（ＪＡＣＫ）があります。",
		"マッチ（ＭＡＴＣＨ）が置いてあります。",
		"ペンチ（ＰＩＮＣＥＲＳ）がありました。",
		"エンジ色のハイハイスクールのネクタイです。",
		"ずいぶん大きな制服ですね。ＬＬサイズでしょうか？",
		"ずいぶん錆ついた鍵ですね。",
		"まだ使えますが電池が入っていません。",
		"新品ではありませんがまだ使えそうです。",
		"長い間人目に触れなかったらしくホコリまみれです。",
		"たくさんのホコリをかぶっています。ずいぶん大切な物のようですね。",
		"壁の一枚ぐらいは簡単にブットバせそうです。",
		"まだだいぶ入っています。劇薬ですよ！",
		"手軽に使えそうな道具です。",
		"少し湿っていますが、一・二本は使えそうですよ。",
		"錆ていますが使えそうですよ。",
		"私はその名詞は理解できません。",
		"もっとわかり易い動詞で入力してください。",
		"私にはあなたの入力する言葉が理解できません。",
		"ナニ？ ナニ？",
		"意味のないこと言わないでください。",
		"ナンだと。何言っていやがんでー！！",
		"○○○先生の亡霊がこっちを睨んでいるゾ。はやく逃げないと・・・",
		"あなたは○○○先生に捕まり四畳半の部屋に閉じ込められ、身包みはがされ、さんざん罵られ馬鹿にされたあげく、学校の外につまみだされてしまいました。 ",
		"そっちはいけないんだよー、知らなかったのか。",
		"「ＰＵＬＬ Ｌ××××、ＣＵＴ Ｃ××××」と書いてあります。",
		"持っていないものを読める訳ないでしょがあ。",
		"塩酸は、こぼれてしまいました。",
		"あなたはハイハイスクールの生徒と認められないので立ち入りを禁じるです。",
		"あなたは男の子（ＢＯＹ）ですか？女の子（ＧＩＲＬ）ですか？（ここであまり悩まないように）",
		"あなたはナンなんですか！？",
		"あなたはハイハイスクールの生徒と証明できないので入れません。",
		"わざわざ開くにおよびません。",
		"持っていない物をどうしろというのですか。",
		"電池が切れちまったんだよーん。",
		"いかにもソフトをコピーしそうな先生です。",
		"そこからは入れません。",
		"出ることは不可能です。",
		"テープを入れることが出来ません。",
		"錆が取れました。",
		"ずいぶん高いです。上に届きそうですよ。",
		"放射能が漏れてきました。",
		"あなたはハイハイスクールの危機を救いました！感謝します！",
		"ハイハイスクールの校歌を歌います。",
		"きさまそれでも軍人か。歯をくいしばれ！修正してやるうっ。－－ふりだしにもどる－－",
		"あなたは大けがをしました。けがを治して始めから。",
		"真っ暗闇です。どこへも行けません。",
		"そんな物はありません。",
		"屋上から落ちて、",
		"ダイナマイトが爆発して、",
		"鍵が掛かっていて開きません。",
		"錆ついていて開きません。",
		"ＤＡＴＡをＤＩＳＫへＳＡＶＥします。",
		"ＤＡＴＡをＤＩＳＫからＬＯＡＤします。",
		"ＦＩＬＥ Ｎｏ．（１，２，３）を ＩＮＰＵＴしてください。",
		"ピアノを演奏します。",
		"水が流れます。",
		"鍵が開きました。",
		"ダイナマイトが爆発しました。",
		"電池の残りが少なくなってきました。",
		"洞窟に穴が開きました。",
		"ライトの明かりがつきました。",
		"ダイナマイトに火がつきました。危険です！",
		"ネクタイを締めたのでハイハイスクールの生徒として学校（ＳＣＨＯＯＬ）に入る事が出来ます。",
		"制服を着たので立派なハイハイスクールの生徒です。",
		"これを使えば重たい物を動かす事が出来ます。",
		"ケーブル（ＣＡＢＬＥ）が引きちぎれてしまいました。",
		"赤（ＲＥＤ）と黄色（ＹＥＬＬＯＷ）の、どちらのケーブルを切りますか？",
		"あなたはまだ出られないのですか？",
		"もーいー加減に終わりにしていいかな！",
		"３年１組の教室を思い出して！",
		"コピーをしてはいかーんっ！",
		"ヒントに頼るのですか？だめですねーっ！");

		this._innerBuffer = new Array();
		this._maxLines = 10;
	}
    maxLines(n)
    {
		if (n == undefined)
		{
	    	return this._maxLines;
		}
		this._maxLines = n;
		if (this._innerBuffer.length >= n)
		{
	    	this._innerBuffer = this._innerBuffer.slice(n - this._innerBuffer.length);
		}
    }
    output(str)
    {
		if (this._innerBuffer.length >= this._maxLines)
		{
	    		var drop = this._innerBuffer.shift();
		}
		this._innerBuffer.push(str);
		var o = "";
		for (var i = 0 ; i < this._innerBuffer.length ; i++)
		{
	    		o += this._innerBuffer[i] + "<br />";
		}
	
		var div = document.getElementById("msgarea");
		if (div != null)
		{
	    		div.innerHTML = o;
			div.scrollTop = div.scrollHeight;
		}
    }
    print(msgid) 
    {
		var msg = null;
		if ((msgid & 0x80) == 0)
		{
		}
		else
		{
		    msgid &= 0x7f; // drop MSB
	    	msg = this._msgtbl[msgid - 1];
	    	this.output(msg);
		}
    }
    printOk() { this.output("Ｏ．Ｋ．"); }
    printStr(str) { this.output(str); }
    getMessage(n) { this._msgtbl[n - 1]; }
    gameOver()
    {
		this.output("ＧａｍｅＯｖｅｒ");
		window.confirm("ＧａｍｅＯｖｅｒ\n\nタイトル画面へ戻ります。");
		document.location = "index.html";
    }
    gameClear()
    {
	this.output("Ｃｏｎｇｒａｔｕｌａｔｉｏｎｓ！");
	// window.confirm("Ｃｏｎｇｒａｔｕｌａｔｉｏｎｓ！\nあなたはハイハイスクールの危機を救いました！感謝します！\n\nタイトル画面へ戻ります。");
	// document.location = "ending.html";
    	const container = document.getElementById('credits_container');
    	const content = document.getElementById('credits_content');
	const durationSeconds = 35; // 35 seconds

    	// 1. コンテナを表示
    	container.style.display = 'block';

	// 2. 🔴 重要な修正: スクロール開始位置を画面の下に設定
    	// contentは bottom: 0; がCSSで設定されているため、初期位置はOKです。
    	// まずアニメーションを停止してリセット
    	content.style.animation = 'none';
    
    	// 3. 高さと距離を計測
    
    	// ブラウザにDOMをレンダリング（描画）させるためのハック。
    	// これがないと、display: block にしても contentHeight が 0 になることがある。
    	void content.offsetHeight; 

    	const viewportHeight = window.innerHeight;
    	const contentHeight = content.offsetHeight; // ここで正しい高さを取得
    
    	// 総移動距離：コンテンツの高さ + 画面の高さ
    	const totalDistance = contentHeight + viewportHeight; 
	// 最終的なtransform値（上に移動＝負の値）
    	const finalTransformValue = -contentHeight; // 最終的にコンテンツが画面上へ完全に消える位置
    
    	// カスタムCSS変数を定義
    	content.style.setProperty('--scroll-distance', `-${contentHeight}px`);
    
    	// 4. アニメーションを再開・設定
    	const animationName = 'scrollUpCustom';
    
    	// durationSeconds をCSSアニメーションの duration に設定
    	content.style.animationName = animationName;
    	content.style.animationDuration = `${durationSeconds}s`;

    	// animation-timing-function: linear; （一定速度で滑らかに）
    	content.style.animationTimingFunction = 'linear';

    	// animation-fill-mode: forwards; （終了時に最後のフレームの状態を維持）
    	content.style.animationFillMode = 'forwards';

    	// 3. アニメーション終了時の処理 (任意: 画面を閉じるなど)
    	content.addEventListener('animationend', () => {
        	container.style.display = 'none'; // 終了後に画面を非表示にする場合
		window.confirm("Ｃｏｎｇｒａｔｕｌａｔｉｏｎｓ！\nあなたはハイハイスクールの危機を救いました！感謝します！\n\nタイトル画面へ戻ります。");
		document.location = "index.html";
    	}, { once: true });
    }
}
