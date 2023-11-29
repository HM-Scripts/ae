var json_file = new File(Folder.appPackage.fsName + '/Libraries/jsx/json2.jsx');
if (json_file.exists && (typeof JSON !== 'object')) $.evalFile(json_file);

var version = "1.2.0";

var listFull = [];
var listShort = [];
var his = app.settings;
var hisLen = 0;
var hisLenList = [];
var hisLenMax = 5;

//履歴の数を確認
if (his.haveSetting('HM_makeFolders', 'hisLen')) {
    hisLen = Number(his.getSetting('HM_makeFolders', 'hisLen'));
    for (var i = 0; i < hisLen; i++) {
        hisLenList[i] = 'test';
    }
} else {
    his.saveSetting('HM_makeFolders', 'hisLen', '0');
}

//履歴の最大数の確認
if (his.haveSetting('HM_makeFolders', 'hisLenMax')) {
    hisLenMax = Number(his.getSetting('HM_makeFolders', 'hisLenMax'));
} else {
    his.saveSetting('HM_makeFolders', 'hisLenMax', '5');
}

/********** UI 生成 ここから **********/

var w = (this instanceof Panel) ? this : new Window('palette', 'HM_makeFolders', undefined, {resizeable: true});

w.gr1 = w.add('group');
w.gr1.orientation = 'column';
w.gr1.alignment = ['fill', 'fill'];

w.gr1.tabP = w.gr1.add('tabbedpanel');
w.gr1.tabP.alignment = ['fill', 'fill'];
tab1 = w.gr1.tabP.add('tab', undefined, '生成');
tab1.orientation = 'column';
tab2 = w.gr1.tabP.add('tab', undefined, 'プリセット保存');
tab2.orientation = 'column';
tab3 = w.gr1.tabP.add('tab', undefined, '設定');
tab3.orientation = 'column';

//Tab1
tab1.gr1 = tab1.add('group');
tab1.gr1.orientation = 'row';
tab1.gr1.alignment = ['fill', 'top'];
tab1.gr1.text1 = tab1.gr1.add('statictext' , undefined, 'プリセット');
tab1.gr1.textbox = tab1.gr1.add('edittext' , undefined);
tab1.gr1.opbtn = tab1.gr1.add('button', [0, 0, 32, 24], '開く');
tab1.gr1.text1.alignment = ['left', 'center'];
tab1.gr1.textbox.alignment = ['fill', 'center'];
tab1.gr1.opbtn.alignment = ['right', 'center'];
tab1.gr1.textbox.minimumSize = [96, 32];
tab1.run = tab1.add('button', undefined, 'フォルダ作成');
tab1.run.alignment = ['fill', 'top'];
tab1.run.minimumSize = [96, 32];
tab1.list = tab1.add('listbox', undefined, hisLenList, {showHeaders: true, columnTitles: ['最近使用した項目']});
tab1.list.alignment = ['fill', 'fill'];

//Tab2
tab2.gr1 = tab2.add('group');
tab2.gr1.orientation = 'row';
tab2.gr1.alignment = ['fill', 'top'];
tab2.gr1.text1 = tab2.gr1.add('statictext', undefined, '現在のプロジェクトをもとにプリセットを保存します。')
tab2.run = tab2.add('button', undefined, '名前を付けて保存');
tab2.run.alignment = ['fill', 'top'];
tab2.run.minimumSize = [128, 32];

//Tab3
tab3.gr1 = tab3.add('group');
tab3.gr1.orientation = 'row';
tab3.gr1.alignment = ['fill', 'top'];
tab3.gr1.text1 = tab3.gr1.add('statictext', undefined, '"最近使用した項目" の最大数 : ');
tab3.gr1.textbox1 = tab3.gr1.add('edittext' , [0, 0, 32, 24], hisLenMax);
tab3.gr1.saveButton = tab3.gr1.add('button', [0, 0, 32, 24], '保存');
tab3.gr2 = tab3.add('group');
tab3.gr2.orientation = 'row';
tab3.gr2.alignment = ['fill', 'top'];
tab3.gr2.text1 = tab3.gr2.add('statictext', undefined, '0から20の範囲で入力してください。');

grv = w.gr1.add('group');
grv.alignment = ['right', 'bottom'];
verText = grv.add('statictext', undefined, 'version: ' + version);

w.onResize = function(){
    w.layout.resize();
}

w.layout.layout();
if (w instanceof Window) w.show();

/********** UI 生成 ここまで **********/

//開くボタンの処理
tab1.gr1.opbtn.onClick = function() {
    var file = File.openDialog('プリセットを開く', 'JSONファイル: *.json', false);
    tab1.gr1.textbox.text = file != null ? file.fsName : '';
}

//フォルダ作成ボタンの処理
tab1.run.onClick = function() {
    pushedMakeButton();
}

//リストダブルクリックの処理
tab1.list.onDoubleClick = function() {
    var result = pushedMakeButton();

    //エラーが返ってきたらリストから削除
    if (result == 1) {
        var path = tab1.gr1.textbox.text;
        var indexNum = indexOf(listFull, path);
        listFull = splice(listFull, indexNum);
        listShort = splice(listShort, indexNum);

        var lengthNum = listFull.length < 5 ? listFull.length : 5;
    
        for (var i = 0; i < lengthNum; i++) {
            his.saveSetting('HM_makeFolders', 'his' + String(i), listFull[i]);
        }
        his.saveSetting('HM_makeFolders', 'hisLen', lengthNum);
    
        reloadList();
    }
}

//リストシングルクリックの処理
tab1.list.onChange = function updateTextbox() {
    var num = tab1.list.selection.index;
    tab1.gr1.textbox.text = listFull[num];
}

//保存ボタンの処理
tab2.run.onClick = function() {
    var file = File.saveDialog('名前を付けてプリセットを保存', 'JSONファイル: *.json');
    var now = new Date();

    //保存用データを作成
    var data = {
        "Properties": {
            "dataType": "HM_makeFolders4ae",
            "exporter": "HM_makeFolders_forAE",
            "exporterVersion": version,
            "exportTimeStamp": {
                "year": now.getFullYear(),
                "month": now.getMonth(),
                "day": now.getDate(),
                "hour": now.getHours(),
                "minute": now.getMinutes(),
                "second": now.getSeconds(),
                "millisecond": now.getMilliseconds()
            }
        },
        "settings": getFolders()
    };

    //保存処理
    try {
        var jsonData = JSON.stringify(data);
        file.open("w");
        file.write(jsonData);
        file.close;
        alert('以下のファイルを保存しました。\n' + file.fsName, 'Message');
    } catch(e) {
        alert(e.message, 'Message');
    }
}

function pushedMakeButton() {

    var path = tab1.gr1.textbox.text;
    var settings = inputSetting(path);

    //ファイルチェック
    if(settings == 'no_file_exists') {
        alert('ファイルが見つかりませんでした。', 'Message');
    } else if(settings == 'file_error'){
        //何もしない
    } else {
        //正しいデータであれば処理を実行
        runMakeFolders(settings);
        reloadHistory(path);
        return 0;
    }
    return 1;
}

//設定読み込み関数
function inputSetting(path) {

    //ファイルの存在確認
    var fileObj = new File(path);

    //ファイルが存在しない場合終了
    if(fileObj.exists == false) {
        return 'no_file_exists';
    }

    try {
        //jsonファイルの読み込み
        fileObj.open("r");
        var jsonData = fileObj.read();
        fileObj.close();
        var data = JSON.parse(jsonData);

        //ファイルの内容確認
        if(data.Properties.dataType == "HM_makeFolders4ae") {
            return data.settings;
        } else {
            throw new TypeError('対応していないファイルです。');
        }
    } catch(e) {
        errror_text = e.message == 'undefinedはオブジェクトではありません。' ? '対応していないファイルです。' : e.message;
        alert(errror_text, 'Message');
        return 'file_error';
    }
}

//処理の実行
function runMakeFolders(settings) {

    app.beginUndoGroup("HM_makeFolders");

    //オブジェクトからフォルダをひとつずつ取得して作成
    for (var i = 0; i < settings.mkdir.name.length; i++) {
        var folderName = settings.mkdir.name[i];
        var parentName = settings.mkdir.parent[i];
        makeFolder(folderName, parentName);
    }

    app.endUndoGroup();
}

//フォルダ生成関数
function makeFolder(fName, parent) {

    // フォルダ作成
    var newFolder = app.project.items.addFolder(fName)

    // 親がある場合は格納
    if (parent != "root") {

        // プロジェクト内のitemsの数を取得
        var numItems = app.project.items.length;

        // 親フォルダを検索
        for (var i = 1; i <= numItems; i++) {

            // 現在のitems
            var currentItem = app.project.items[i];

            // アイテムを見つけた場合
            if (currentItem instanceof FolderItem && currentItem.name === parent) {

                // 親を設定
                newFolder.parentFolder = currentItem;

                // ループから出る
                break;
            } 
        }
    }
}

//フォルダ取得関数
function getFolders() {

    var folders = [];
    var parent = [];

    // プロジェクト内のitemsの数を取得
    var numItems = app.project.items.length;

    //すべてのアイテムを取得
    for (var i = 1; i <= numItems; i++) {
        var currentItem = app.project.items[i];

        //アイテムがフォルダの場合
        if (currentItem instanceof FolderItem) {
            var parentName = currentItem.parentFolder.name;
            if (parentName == 'ルート') {
                parentName = 'root'
            }
            folders.push(currentItem.name);
            parent.push(parentName)
        }
    }

    var settings = {
        "mkdir": {
            "name": folders,
            "parent": parent
        }
    };

    return settings;
}

//履歴の取得
function getHistory() {
    for (var i = 0; i < hisLen; i++) {
        var fullName = his.getSetting('HM_makeFolders', 'his' + String(i));
        var shortName = getFileName(fullName);
        listFull[i] = fullName;
        listShort[i] = shortName;
    }
}

//履歴の更新
function reloadHistory(path) {

    var indexNum = indexOf(listFull, path);

    if (indexNum != -1) {
        listFull = splice(listFull, indexNum);
        listShort = splice(listShort, indexNum);
    }

    listFull = unshift(listFull, path);
    listShort = unshift(listShort, getFileName(path));

    var lengthNum = listFull.length < hisLenMax ? listFull.length : hisLenMax;

    for (var i = 0; i < lengthNum; i++) {
        his.saveSetting('HM_makeFolders', 'his' + String(i), listFull[i]);
    }
    his.saveSetting('HM_makeFolders', 'hisLen', lengthNum);

    reloadList();
}

//リストの更新
function reloadList() {
    tab1.list.removeAll();

    var lengthNum = listFull.length < hisLenMax ? listFull.length : hisLenMax;

    for (var i = 0; i < lengthNum; i++) {
        tab1.list.add('item', listShort[i]);
    }
}

//履歴の最大数の変更
tab3.gr1.saveButton.onClick = function set_hisLenMax() {
    var hisLenMax_tmp;
    try {
        hisLenMax_tmp = Number(tab3.gr1.textbox1.text);
        if (hisLenMax_tmp <= 20 && hisLenMax_tmp >= 0 && hisLenMax_tmp != NaN) {
            hisLenMax = hisLenMax_tmp;
        } else {
            throw new RangeError('0から20の範囲で入力してください。');
        }
    } catch(e) {
        alert(e.message, 'Message');
    } finally {
        tab3.gr1.textbox1.text = hisLenMax;
        his.saveSetting('HM_makeFolders', 'hisLenMax', hisLenMax);
        if (hisLen > hisLenMax) {
            hisLen = hisLenMax;
            his.saveSetting('HM_makeFolders', 'hisLen', hisLen);
            reloadList();
        }
        tab3.gr2.text1.text = '0から20の範囲で入力してください。最大数を' + String(hisLenMax) + '個に設定しました。';
    }
}

//起動時の処理
function main() {
    getHistory();
    reloadList();
}

//********** functions **********//

function indexOf(arry, item) {
    if (arry.length > 0) {
        for (var i = 0; i < arry.length; i++) {
            if (arry[i] == item) {
                return i;
            }
        }
    }
    return -1;
}

function splice(arry, indexNum) {
    var tmpArry = [];
    var indexBoolean = false;
    var arry_len = arry.length;
    for (i = 0; i < arry_len; i++) {
        if (indexBoolean == false) {
            if (i == indexNum) {
                indexBoolean =true;
            }
            else {
                tmpArry[i] = arry[i];
            }
        }
        else {
            tmpArry[i - 1] = arry[i];
        }
    }
    return tmpArry;
}

function unshift(arry, item) {
    var arry_len = arry.length;

    for (var i = arry_len; i > 0; i--) {
        arry[i] = arry[i - 1];
    }

    arry[0] = item;

    return arry;
}

function getFileName(path) {

    var file = new File(path);
    return file.name;
}

main();