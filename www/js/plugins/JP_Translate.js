/**
 * @file Dweller's Empty Path Japanese translate patch
 * @author Proudust
 */

var JP_Patch = {};

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
