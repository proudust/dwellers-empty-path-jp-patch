import './JP_Translate';
import './JP_Translate.ts';

describe('JP_Patch.walk', () => {
    test('walk Map000.json', () => {
        const data: IDataMap = {
            events: [
                null as never,
                {
                    id: 1,
                    name: 'EV001',
                    pages: [
                        {
                            list: [
                                {
                                    code: 401,
                                    indent: 0,
                                    parameters: ['test'],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        const result: { jsonPath: string; value: string }[] = [];
        JP_Patch.walk(data as IAnyData, (jsonPath, value) => result.push({ jsonPath, value }));
        expect(result).toEqual([
            { jsonPath: '.events[1].name', value: 'EV001' },
            {
                jsonPath: '.events[1].pages[0].list[0].parameters[0]',
                value: 'test',
            },
        ]);
    });
});

describe('JP_Patch.includeJsonPath', () => {
    const i = JP_Patch.includeJsonPath;

    test('standard', () => {
        expect(i('.events[1].name', '.')).toBeTruthy();
        expect(i('.events[1].name', '.data')).toBeFalsy();
        expect(i('.events[1].name', '.events')).toBeTruthy();
        expect(i('.events[1].name', '.events[0]')).toBeFalsy();
        expect(i('.events[1].name', '.events[1]')).toBeTruthy();
        expect(i('.events[1].name', '.events[1].id')).toBeFalsy();
        expect(i('.events[1].name', '.events[1].name')).toBeTruthy();
    });

    test('array range', () => {
        expect(i('.events[5].pages[0].list[0]', '.events[5].pages[0].list[9:11]')).toBeFalsy();
        expect(i('.events[5].pages[0].list[8]', '.events[5].pages[0].list[9:11]')).toBeFalsy();
        expect(i('.events[5].pages[0].list[9]', '.events[5].pages[0].list[9:11]')).toBeTruthy();
        expect(i('.events[5].pages[0].list[10]', '.events[5].pages[0].list[9:11]')).toBeTruthy();
        expect(i('.events[5].pages[0].list[11]', '.events[5].pages[0].list[9:11]')).toBeFalsy();
    });
});

test('translate', () => {
    const data = { terms: { commands: ['Continue'] } };
    const translation = {
        'System.json': {
            '.': {
                Continue: ' コンティニュー',
            },
        },
    };

    JP_Patch.Translations = translation;
    const result = JP_Patch.translate('System.json', data);

    expect(result).toEqual({ terms: { commands: [' コンティニュー'] } });
});
