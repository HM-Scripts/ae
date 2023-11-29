var w = (this instanceof Panel) ? this : new Window('palette', 'HM_SortLayers', undefined, {resizeable: true});

w.gr1 = w.add('group');
w.gr1.orientation = 'column';
w.gr1.alignment = ['left', 'top'];
w.gr1.text1 = w.gr1.add("statictext" , undefined, "上に");
w.gr1.text1.alignment = ['left', 'top'];
w.gr2 = w.gr1.add('group');
w.gr2.orientation = 'row';
w.gr2.alignment = ['left', 'top'];
w.gr2.btn1 = w.gr2.add('iconbutton', [0, 0, 32, 32]);
w.gr2.btn2 = w.gr2.add('iconbutton', [0, 0, 32, 32]);
w.gr2.btn1.image = new File("HM_Scripts_icons/0to9onLayers.png");
w.gr2.btn2.image = new File("HM_Scripts_icons/9to0onLayers.png");

w.layout.layout();
if (w instanceof Window) w.show();

w.onResizing = w.onResize = function () {
    w.layout.resize();
}

w.gr2.btn1.onClick = function () {
    sortLayers("0to9onLayers");
}

w.gr2.btn2.onClick = function () {
    sortLayers("9to0onLayers");
}

function sortLayers(sort_mode) {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("アクティブなコンポジションが選択されていません。");
        return;
    }
    var layers = comp.layers;
    var sortedLayers = [];
    for (var i = 1; i <= layers.length; i++) {
        var layerName = layers[i].name;
        if (layerName.match(/^\d+/)) {
            var layerIndex = parseInt(layerName);
            sortedLayers.push({
                layerIndex: layerIndex,
                layer: layers[i]
            });
        }
    }
    if (sort_mode == "0to9onLayers") {
        sortedLayers.sort(function(a, b) {
            return b.layerIndex - a.layerIndex;
        });
    }
    else if (sort_mode == "9to0onLayers") {
        sortedLayers.sort(function(a, b) {
            return a.layerIndex - b.layerIndex;
        });
    }
    else {
        alert("error!");
        return;
    }
    app.beginUndoGroup("HM_SortLayers");
    for (var i = 0; i < sortedLayers.length; i++) {
        sortedLayers[i].layer.moveToBeginning();
    }
    app.endUndoGroup();
}