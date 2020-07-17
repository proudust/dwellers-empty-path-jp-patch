/**
 * @file Dweller's Empty Path Japanese translate patch
 * @author Proudust
 */

var JP_Patch = {};

// Load translate file
JP_Patch.loadTranslateFile = function () {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'js/plugins/JP_Translate.json');
    xhr.overrideMimeType('application/json');
    xhr.onload = function () {
        if (xhr.status < 400) JP_Patch.Translations = JSON.parse(xhr.responseText);
    };
    xhr.send();
}
JP_Patch.Translations = {};
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
        else if (typeof object[key] === "object" || typeof object[key] === "array") {
            object[key] = JP_Patch.translateObject(object[key], jsonPaths, original, translation);
        }
    }
    return object;
}

JP_Patch.translate = function (src, object) {
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
        if (xhr.status < 400) {
            window[name] = JP_Patch.translate(src, JSON.parse(xhr.responseText));
            DataManager.onLoad(window[name]);
        }
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
