var w = (this instanceof Panel) ? this : new Window('palette', 'HM_makeSprite', undefined, {resizeable: true});

// スクリプト設定確認
var textBoxValue;
if (app.settings.haveSetting('HM_makeSprite', 'textBox')) {
    textBoxValue = app.settings.getSetting('HM_makeSprite', 'textBox');
} else {
    textBoxValue = '5';
}

w.gr1 = w.add('group');
w.gr1.orientation = 'column';
w.gr1.alignment = ['fill', 'fill'];
w.gr2 = w.gr1.add('group');
w.gr2.orientation = 'row';
w.gr2.alignment = ['fill', 'top']
w.gr2.text1 = w.gr2.add('statictext' , undefined, '横の数');
w.gr2.textbox = w.gr2.add('edittext' , undefined, textBoxValue);
w.gr2.text1.alignment = ['left', 'center']
w.gr2.textbox.alignment = ['fill', 'center']
w.gr2.textbox.minimumSize = [48, 32]
w.gr1.text2 = w.gr1.add('statictext' , undefined, '縦の数は自動で設定されます。');
w.gr3 = w.gr1.add('group');
w.gr3.orientation = 'row';
w.gr3.alignment = ['fill', 'top'];
w.gr3.btn = w.gr3.add('button', undefined, 'スプライトシートを作成');
w.gr3.btn.alignment = ['fill', 'top'];
w.gr4 = w.gr1.add('group');
w.gr4.orientation = 'row';
w.gr4.alignment = ['right', 'bottom'];
w.gr4.text3 = w.gr4.add('statictext' , undefined, 'version: 1.0.1');

w.onResize = function(){
    w.layout.resize();
}

w.layout.layout();
if (w instanceof Window) w.show();

w.gr3.btn.onClick = function () {
    makeSprite(Number(w.gr2.textbox.text));
};

function makeSprite(item_rowLength) {
    if (isNaN(item_rowLength) || item_rowLength <= 0) {
        alert("自然数を入力してください", 'Warning');
        return;
    }

    app.settings.saveSetting('HM_makeSprite', 'textBox', w.gr2.textbox.text);

    //選択しているアイテムを選択
    var item = app.project.activeItem;

    //itemがコンポジションまたはフッテージかどうか
    if (item instanceof CompItem || item instanceof FootageItem) {

        //プロパティを取得
        var item_width = item.width;
        var item_height = item.height;
        var item_frameRate = item.frameRate;
        var item_duration = item.duration * item_frameRate;

        //作成するコンポジションの設定
        var item_columnLength = Math.ceil(item_duration / item_rowLength);
        var compName;
        var comp_width = item_width * item_rowLength;
        var comp_height = item_height * item_columnLength;
        var comp_duration = 1 / item_frameRate;
        var comp_frameRate = item_frameRate;

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
            var positionX = (i % item_rowLength) * item_width
            var positionY = Math.floor(i / item_rowLength) * item_height;
            var positionValue = [positionX, positionY];
            var anchorPointValue = [0, 0];

            //値の設定
            topLayer.position.setValue(positionValue);
            topLayer.anchorPoint.setValue(anchorPointValue);
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
}

