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
    JP_Patch.Translations = null;
    xhr.send();
}
JP_Patch.loadTranslateFile();

// Apply translations to data files
DataManager.loadDataFile = function (name, src) {
    var xhr = new XMLHttpRequest();
    var url = 'data/' + src;
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function () {
        if (xhr.status < 400) {
            window[name] = JSON.parse(xhr.responseText, function (_, value) {
                return JP_Patch.Translations[src] && JP_Patch.Translations[src][value] || value;
            });
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
