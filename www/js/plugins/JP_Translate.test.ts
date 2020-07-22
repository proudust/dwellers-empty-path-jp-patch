import './JP_Translate';
import './JP_Translate.ts';

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
