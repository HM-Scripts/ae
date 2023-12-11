var w = (this instanceof Panel) ? this : new Window('palette', 'HM_makeSprite', undefined, {resizeable: true});

// スクリプト設定確認
var textBoxValue;
if (app.settings.haveSetting('HM_makeSprite', 'textBox')) {
    textBoxValue = app.settings.getSetting('HM_makeSprite', 'textBox');
} else {
    textBoxValue = '5';
}

/*--------------- UI生成 ここから---------------*/
w.gr1 = w.add('group');
w.gr1.orientation = 'column';
w.gr1.alignment = ['fill', 'fill'];

gr11 = w.gr1.add('group');
gr11.orientation = 'row';
gr11.alignment = ['fill', 'top'];
gr11.text1 = gr11.add('statictext', undefined, 'シートの横幅：');
gr11.dwn1 = gr11.add('dropdownlist', undefined, ['Free', '256 px', '512 px', '1024 px', '2048 px', '4096 px']);
gr11.dwn1.minimumSize = [48, 32];
gr11.dwn1.selection = 0;

gr12 = w.gr1.add('group');
gr12.orientation = 'row';
gr12.alignment = ['fill', 'center'];
gr12.text2 = gr12.add('statictext', undefined, '横の数：');
gr12.textbox = gr12.add('edittext' , undefined, textBoxValue);
gr12.check = gr12.add('checkbox', undefined, '自動');
gr12.textbox.alignment = ['fill', 'center'];
gr12.textbox.minimumSize = [48, 32];
gr12.check.alignment = ['fill', 'right'];

run_btn = w.gr1.add('button', undefined, 'スプライトシートを作成');
run_btn.alignment = ['fill', 'top'];
w.gr1.text2 = w.gr1.add('statictext' , undefined, '縦の数は自動で設定されます。');

w.grv = w.gr1.add('group');
w.grv.orientation = 'row';
w.grv.alignment = ['right', 'bottom'];
version_text = w.grv.add('statictext' , undefined, 'version: 1.1.1');

w.onResize = function(){
    w.layout.resize();
};

w.layout.layout();
if (w instanceof Window) w.show();

/*--------------- UI生成 ここまで ---------------*/

//チェックボタンクリック時にテキストボックスの有効性を切り替え
gr12.check.onClick = function () {
    if(gr12.check.value == true) {
        gr12.textbox.enabled = false;
    } else {
        gr12.textbox.enabled = true;
    }
};

run_btn.onClick = function () {

    var numofWidth = 0;

    //チェックボックスの値を取得
    if(gr12.check.value == false) {

        //テキストボックスの値を取得し、数値に変換
        numofWidth = Number(gr12.textbox.text);
    
        //自然数ではない場合、終了
        if (isNaN(numofWidth) || numofWidth <= 0 || numofWidth % 1 != 0) {
            alert('自然数を入力してください', 'Warning');
            return;
        }
        app.settings.saveSetting('HM_makeSprite', 'textBox', numofWidth);
    }

    //選択しているアイテムを取得
    var item = app.project.activeItem;

    //itemがコンポジションまたはフッテージかどうか
    if (item instanceof CompItem || item instanceof FootageItem) {

        //プロパティを取得
        var item_width = item.width;
        var item_height = item.height;
        var item_frameRate = item.frameRate;
        var item_duration = item.duration * item_frameRate;

        //設定を取得
        var resolution_index = gr11.dwn1.selection.index;
        var resolution = 0;
        if (resolution_index != 0) {
            resolution = Math.pow(2, (resolution_index + 7));
        }

        //自動にチェックされてた場合、フレーム数から最適な数を取得
        if (numofWidth == 0) {
            var i = 1;
            while (true) {
                if (i * i >= item_duration) {
                    numofWidth = i;
                    break;
                }
                i++;
            }
        }

        //作成するコンポジションの設定
        var item_columnLength = Math.ceil(item_duration / numofWidth);
        var sheet_width = item_width * numofWidth;
        var sheet_height = item_height * item_columnLength;
        var compName;
        var comp_width = resolution == 0 ? sheet_width : resolution;
        var comp_height = resolution == 0 ? sheet_height : Math.ceil(sheet_height * (comp_width / sheet_width));
        var comp_duration = 1 / item_frameRate;
        var comp_frameRate = item_frameRate;
        var sheet_scale = comp_width / sheet_width * 100;

        //同名のアイテムがないか
        var count = 0;
        while (true) {
            count++;
            compName = "Sprite" + String(count);
            var itemExists = false;

            //プロジェクト内のアイテム名と一致しないことを確認
            for (var i = 1; i<= app.project.numItems; i++) {
                if (app.project.item(i).name === compName) {
                    itemExists = true;
                    break;
                }
            }

            //存在しなければwhileループから離脱
            if (!itemExists) {
                break;
            }
        }

        app.beginUndoGroup("HM_makeSprite");

        var newComp = app.project.items.addComp(compName, comp_width, comp_height, 1, comp_duration, comp_frameRate);

        if (newComp == null) {
            alert("スプライトの作成に失敗しました。", 'Error')
            return;
        }

        //レイヤーにitemを追加
        var newLayer = newComp.layers.add(item);
        newLayer.startTime += 1 / item_frameRate;

        //コンポジションに配置
        for (var i = 0; i < item_duration; i++) {
            var topLayer = newComp.layer(1);
            var positionX = (i % numofWidth) * item_width
            var positionY = Math.floor(i / numofWidth) * item_height;
            var positionValue = [0, 0];
            var anchorPointValue = [-positionX, -positionY];

            //値の設定
            topLayer.position.setValue(positionValue);
            topLayer.anchorPoint.setValue(anchorPointValue);
            topLayer.scale.setValue([sheet_scale, sheet_scale]);
            topLayer.startTime -= 1 / item_frameRate; //レイヤーをX秒前に移動
            if (i + 1 != item_duration) {
                topLayer.duplicate();
            }
        }

        alert('コンポジション "' + compName + '" を作成しました。', 'Result')
        app.endUndoGroup();
    } else {
        //コンポジションまたはフッテージが選択されていない
        if (item == null) {
            alert("スプライトを作成するコンポジションかフッテージを選択してください。", 'Error');
        }
        //複数選択されている。
        else {
            alert("アイテムが複数選択されています。\nスプライトを作成するコンポジションかフッテージを1つだけ選択してください。", 'Error');
        }
    }
};