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

var JP_Patch = {} as JP_Patch;

// If Jest environment, explicitly assign to global variable.
if (global && global.test) global.JP_Patch = JP_Patch;

//=================================================================================================
// JSON data translate
//=================================================================================================

interface Translations {
    [fileName: string]: {
        [jsonPath: string]: {
            [original: string]: string;
        };
    };
}

type WalkCallback = (jsonPath: string, value: string) => IAnyDataValue;

interface JP_Patch {
    Translations?: Translations;
    loadTranslateFile(callback?: () => void): void;
    walk(object: IAnyData, callback: WalkCallback): IAnyData;
    walkArray(array: IAnyDataValue[], jsonPath: string, callback: WalkCallback): IAnyDataValue[];
    walkObject(object: IAnyDataObject, jsonPath: string, callback: WalkCallback): IAnyDataObject;
    includeJsonPath(actual: string, expected: string): boolean;
    translate(src: string, object: IAnyData): IAnyData;
}

// Load translate file
JP_Patch.loadTranslateFile = function (callback) {
    if (JP_Patch.Translations) {
        if (typeof callback === 'function') callback();
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'js/plugins/JP_Translate.json');
    xhr.overrideMimeType('application/json');
    xhr.onload = function () {
        if (xhr.status < 400) JP_Patch.Translations = JSON.parse(xhr.responseText);
        if (typeof callback === 'function') callback();
    };
    xhr.send();
};
JP_Patch.Translations = undefined;

JP_Patch.walk = function (object, callback) {
    return Array.isArray(object)
        ? JP_Patch.walkArray(object as IAnyDataValue[], '.', callback)
        : JP_Patch.walkObject(object as IAnyDataObject, '', callback);
};

JP_Patch.walkArray = function (array, jsonPath, callback) {
    for (var i = 0; i < array.length; i++) {
        var value = array[i];
        if (typeof value === 'string') {
            array[i] = callback(jsonPath + '[' + i + ']', value);
        } else if (Array.isArray(value)) {
            array[i] = JP_Patch.walkArray(value, jsonPath + '[' + i + ']', callback);
        } else if (typeof value === 'object' && value !== null) {
            array[i] = JP_Patch.walkObject(value, jsonPath + '[' + i + ']', callback);
        }
    }
    return array;
};

JP_Patch.walkObject = function (object, jsonPath, callback) {
    for (var key in object) {
        var value = object[key];
        if (typeof value === 'string') {
            object[key] = callback(jsonPath + '.' + key, value);
        } else if (Array.isArray(value)) {
            object[key] = JP_Patch.walkArray(value, jsonPath + '.' + key, callback);
        } else if (typeof value === 'object' && value !== null) {
            object[key] = JP_Patch.walkObject(value, jsonPath + '.' + key, callback);
        }
    }
    return object;
};

JP_Patch.includeJsonPath = function (actual, expected) {
    var actualPaths = actual.match(/(\.\w+|\[\d+\]|\[\d+:\d+\])/g) || [];
    var expectedPaths = expected.match(/(\.\w+|\[\d+\]|\[\d+:\d+\])/g) || [];
    for (var i = 0; i < expectedPaths.length; i++) {
        if (actualPaths[i] === expectedPaths[i]) continue;
        if (expectedPaths[i].startsWith('.') || !expectedPaths[i].includes(':')) return false;

        var n = Number(actualPaths[i].slice(1, -1));
        var pair = (expectedPaths[i].match(/\d+/g) || []).map(Number);
        var start = Math.min.apply(undefined, pair);
        var end = Math.max.apply(undefined, pair);
        if (n < start || end <= n) return false;
    }
    return true;
};

JP_Patch.translate = function (src, object) {
    if (!JP_Patch.Translations) throw new Error('translation has not been loaded.');
    if (!(src in JP_Patch.Translations)) return object;

    var transFile = JP_Patch.Translations[src];
    return JP_Patch.walk(object, (jsonPath, value) => {
        for (var targetPath in transFile) {
            for (var original in transFile[targetPath]) {
                if (value === original && JP_Patch.includeJsonPath(jsonPath, targetPath)) {
                    return transFile[targetPath][original];
                }
            }
        }
        return value;
    });
};

// Apply translations to data files
/* eslint-disable @typescript-eslint/no-explicit-any */
DataManager.loadDataFile = function (name, src) {
    var xhr = new XMLHttpRequest();
    var url = 'data/' + src;
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function () {
        if (xhr.status < 400) {
            var object = JSON.parse(xhr.responseText);
            JP_Patch.loadTranslateFile(function () {
                (window as any)[name] = JP_Patch.translate(src, object);
                DataManager.onLoad((window as any)[name] as IDataActor[]);
            });
        }
    };
    xhr.onerror =
        this._mapLoader ||
        function () {
            DataManager._errorUrl = DataManager._errorUrl || url;
        };
    (window as any)[name] = null;
    xhr.send();
};
/* eslint-enable @typescript-eslint/no-explicit-any */

//=================================================================================================
// Japanese font setting
//=================================================================================================

interface JP_Patch {
    Bitmap_drawText: Bitmap['drawText'];
    Bitmap_measureTextWidth: Bitmap['measureTextWidth'];
    Window_Base_resetFontSettings: Window_Base['resetFontSettings'];
}

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

declare var Yanfly: { Param: { LineHeight: number } };

// Fix bottom of choice list being cut off
Window_ChoiceList.prototype.lineHeight = function () {
    return Yanfly.Param.LineHeight + 6;
};
