/*:
 * @plugindesc Dweller's Empty Path Japanese translate patch
 * @author Proudust (Twitter@Proudust)
 * @version 0.1.0
 *
 * @link https://github.com/proudust/dwellers-empty-path-jp-patch
 */

/*:ja
 * @plugindesc Dweller's Empty Path 日本語化パッチ
 * @author Proudust (Twitter@Proudust)
 * @version 0.1.0

 * @link https://github.com/proudust/dwellers-empty-path-jp-patch
 */

var JP_Patch = {} as any;

// Load translate file
JP_Patch.loadTranslateFile = function (callback) {
    if (JP_Patch.Translations) {
        if (typeof callback === "function") callback();
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'js/plugins/JP_Translate.json');
    xhr.overrideMimeType('application/json');
    xhr.onload = function () {
        if (xhr.status < 400) JP_Patch.Translations = JSON.parse(xhr.responseText);
        if (typeof callback === "function") callback();
    };
    xhr.send();
}
JP_Patch.Translations = undefined;
JP_Patch.loadTranslateFile();

// apply translation to json object
JP_Patch.translateObject = function (object, jsonPaths, original, translation) {
    if (jsonPaths.length) {
        object[jsonPaths[0]] = JP_Patch.translateObject(
            object[jsonPaths[0]],
            jsonPaths.slice(1),
            original,
            translation
        );
        return object;
    }

    for (var key in object) {
        if (object[key] === original) object[key] = translation;
        else if (typeof object[key] === "object") {
            object[key] = JP_Patch.translateObject(object[key], jsonPaths, original, translation);
        }
    }
    return object;
}

JP_Patch.translate = function (src, object) {
    if (JP_Patch.Translations === undefined) JP_Patch.loadTranslateFile();
    if (!(src in JP_Patch.Translations)) return object;

    var transFile = JP_Patch.Translations[src];
    for (var pathString in transFile) {
        var path = pathString.match(/\w+/g) || [];
        for (var original in transFile[pathString]) {
            object = JP_Patch.translateObject(object, path, original, transFile[pathString][original]);
        }
    }
    return object;
}

// Apply translations to data files
DataManager.loadDataFile = function (name, src) {
    var xhr = new XMLHttpRequest();
    var url = 'data/' + src;
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function () {
        JP_Patch.loadTranslateFile(function () {
            if (xhr.status < 400) {
                window[name] = JP_Patch.translate(src, JSON.parse(xhr.responseText));
                DataManager.onLoad(window[name]);
            }
        });
    };
    xhr.onerror = this._mapLoader || function () {
        DataManager._errorUrl = DataManager._errorUrl || url;
    };
    window[name] = null;
    xhr.send();
};

// Change font outline color
JP_Patch.Window_Base_resetFontSettings = Window_Base.prototype.resetFontSettings;
Window_Base.prototype.resetFontSettings = function () {
    JP_Patch.Window_Base_resetFontSettings.call(this);
    this.contents.outlineColor = 'rgba(255, 255, 255, 0.5)';
};

// Adjust y to draw the text
JP_Patch.Bitmap_drawText = Bitmap.prototype.drawText;
Bitmap.prototype.drawText = function (text, x, y, mW, l, align) {
    JP_Patch.Bitmap_drawText.call(this, text, x, y + 4, mW, l, align);
};

// Adjust letter spacing
JP_Patch.Bitmap_measureTextWidth = Bitmap.prototype.measureTextWidth;
Bitmap.prototype.measureTextWidth = function (text) {
    var width = JP_Patch.Bitmap_measureTextWidth.call(this, text);
    return width + 10;
};

// Change normal font color
Window_Base.prototype.normalColor = function () {
    return '#e0f8cf';
};
