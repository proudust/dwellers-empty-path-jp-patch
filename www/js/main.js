/**
 * dwellers-empty-path-jp-patch
 */

var enableJpPatch = true;

if (enableJpPatch) {
    // Replace "YEP_CoreEngine" plugin parameters
    $plugins[3].parameters["Font Size"] = "30"

    // Disable "Bitmap Fonts" plugin
    $plugins[4].status = false;

    // Replace "YEP_MessageCore" plugin parameters
    $plugins[5].parameters["Font Size"] = "36"
}

PluginManager.setup($plugins);

window.onload = function () {
    if (enableJpPatch) {
        // Change font outline color
        var Window_Base_resetFontSettings = Window_Base.prototype.resetFontSettings;
        Window_Base.prototype.resetFontSettings = function () {
            Window_Base_resetFontSettings.call(this);
            this.contents.outlineColor = 'rgba(255, 255, 255, 0.5)';
        };

        // Adjust y to draw the text
        var Bitmap_drawText = Bitmap.prototype.drawText;
        Bitmap.prototype.drawText = function (text, x, y, mW, l, align) {
            Bitmap_drawText.call(this, text, x, y + 4, mW, l, align);
        };

        // Adjust letter spacing
        var Bitmap_measureTextWidth = Bitmap.prototype.measureTextWidth;
        Bitmap.prototype.measureTextWidth = function (text) {
            var width = Bitmap_measureTextWidth.call(this, text);
            return width + 10;
        };

        // Change normal font color
        Window_Base.prototype.normalColor = function () {
            return '#e0f8cf';
        };
    }

    SceneManager.run(Scene_Boot);
};
