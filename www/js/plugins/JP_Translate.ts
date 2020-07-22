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

interface JP_Patch {
    Translations?: Translations;
    loadTranslateFile(callback?: () => void): void;
    translateObject(
        object: IAnyData,
        jsonPaths: string[],
        original: string,
        translation: string,
    ): IAnyData;
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

// apply translation to json object
JP_Patch.translateObject = function (object, jsonPaths, original, translation) {
    if (!object) return object;
    if (jsonPaths.length) {
        (object as any)[jsonPaths[0]] = JP_Patch.translateObject(
            (object as any)[jsonPaths[0]] as IAnyData,
            jsonPaths.slice(1),
            original,
            translation,
        );
        return object;
    }

    for (var key in object) {
        if ((object as any)[key] === original) (object as any)[key] = translation;
        else if (typeof (object as any)[key] === 'object') {
            (object as any)[key] = JP_Patch.translateObject(
                (object as any)[key] as IAnyData,
                jsonPaths,
                original,
                translation,
            );
        }
    }
    return object;
};

JP_Patch.translate = function (src, object) {
    if (!JP_Patch.Translations) throw new Error('translation has not been loaded.');
    if (!(src in JP_Patch.Translations)) return object;

    var transFile = JP_Patch.Translations[src];
    for (var pathString in transFile) {
        var path = pathString.match(/\w+/g) || [];
        for (var original in transFile[pathString]) {
            object = JP_Patch.translateObject(
                object,
                path,
                original,
                transFile[pathString][original],
            );
        }
    }
    return object;
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
