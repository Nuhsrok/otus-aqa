import { nameIsValid, fullTrim, getTotal } from '../src/app.js';

describe('Проверка имени пользователя', () => {
    test('Имя пользователя не должно быть пустым', () => {
        expect(nameIsValid('')).toBe(false);
    });
    test('Имя пользователя должно быть строкой', () => {
        expect(nameIsValid(123)).toBe(false);
    });
    test('Имя пользователя должно быть не короче 2 символов', () => {
        expect(nameIsValid('a')).toBe(false);
    });
});


describe('Удаление пробелов из строки', () => {
  test('Все пробелы внутри, в начале и в конце строки должны быть удалены', () => {
    expect(fullTrim('  при в ет ')).toBe('привет');
  });
  test('Возвращает исходную строку без изменений, если в ней нет пробелов', () => {
    expect(fullTrim('12jestТЕст')).toBe('12jestТЕст');
    });
test('Возвращает пустую строку, если переданы одни пробелы', () => {
    expect(fullTrim(' ')).toBe('');
    });
});


describe('Параметризованные тесты для getTotal', () => {
  test.each([
    ['Скидка не указана', [{ price: 10, quantity: 10 }], undefined, 100],
    ['Нет скидки/скидка равна 0', [{ price: 10, quantity: 10 }], 0, 100],
    ['Скидка 10%', [{ price: 10, quantity: 10 }], 10, 90],
    ['Скидка применяется на несколько разных товаров', [{ price: 10, quantity: 1 }, { price: 20, quantity: 2 }], 0, 50],
  ])('%s', (description, items, discount, expected) => {
    expect(getTotal(items, discount)).toBe(expected);
  });

  test.each([
    ['При скидке меньше 0%', [{ price: 10, quantity: 10 }], -1],
    ['При скидке 100% и больше', [{ price: 10, quantity: 10 }], 100],
    ['Если скидка не является числом', [{ price: 10, quantity: 10 }], '10'],
  ])('%s: должна выпадать ошибка', (description, items, discount) => {
    expect(() => getTotal(items, discount)).toThrow();
  });
});