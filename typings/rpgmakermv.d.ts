/// <reference types="rpgmakermv_typescript_dts" />

/* eslint-disable @typescript-eslint/no-unused-vars */

type IAnyData = IAnyDataValue[] | IAnyDataObject;
type IAnyDataObject = { [key: string]: IAnyDataValue };
type IAnyDataValue = number | string | IAnyData | null;

declare var $plugins: IDataPlugin[];

declare namespace DataManager {
    var _mapLoader: () => void;
}
