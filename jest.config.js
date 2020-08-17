function Window_Base() {}
Window_Base.prototype.resetFontSettings = function () {};

module.exports = {
    preset: 'ts-jest',
    globals: {
        Bitmap: function () {},
        DataManager: function () {},
        Window_Base: Window_Base,
        Window_ChoiceList: function () {},
        Yanfly: { Param: { LineHeight: 34 } },
    },
};
