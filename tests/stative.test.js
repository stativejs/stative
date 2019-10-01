import { Stative } from '../src/stative';

describe('expandPath tests', () => {
  let appState;

  beforeEach(async () => {
    appState = new Stative();
  });

  afterEach(() => {
    appState.destroy();
  });

  test('undefined path', () => {
    expect(appState.expandPath()).toEqual([]);
  });

  test('null path', () => {
    expect(appState.expandPath(null)).toEqual([]);
  });

  test('empty path', () => {
    expect(appState.expandPath('')).toEqual([]);
  });

  test('one path', () => {
    expect(appState.expandPath('loading')).toEqual(['loading']);
  });
});

describe('getAllPathsFromObject tests', () => {
  let appState;

  beforeEach(async () => {
    appState = new Stative();
  });

  afterEach(() => {
    appState.destroy();
  });

  test('null', () => {
    expect(appState.getAllPathsFromObject(null)).toEqual([]);
  });

  test('not object', () => {
    expect(appState.getAllPathsFromObject('a string')).toEqual([]);
  });

  test('empty object', () => {
    expect(appState.getAllPathsFromObject({})).toEqual([]);
  });

  test('big object', () => {
    const paths = appState.getAllPathsFromObject({
      a: {
        b: {
          c: {
            d: 1,
          },
        },
      },
      z: 1,
      k: [0, 1, 2],
    });
    expect(paths).toEqual(['a', 'a.b', 'a.b.c', 'a.b.c.d', 'z', 'k']);
  });
});

describe('initialize tests', () => {
  let appState;

  beforeEach(async () => {
    appState = new Stative();
  });

  afterEach(() => {
    appState.destroy();
  });

  test('do initialize', () => {
    appState.initiliaze();
    expect(appState.state).toBe(null);
    expect(Object.keys(appState.subjects).length).toBe(1);
  });
});

describe('createSubject tests', () => {
  let appState;

  beforeEach(async () => {
    appState = new Stative();
  });

  afterEach(() => {
    appState.destroy();
  });

  test('do createSubject with no argument', () => {
    appState.createSubject();
    expect(Object.keys(appState.subjects).length).toBe(1);
    expect(appState.state).toBe(null);
  });

  test('do createSubject', () => {
    const path = 'a.b';
    appState.createSubject(path);
    expect(Object.keys(appState.subjects).length).toBe(2);
    expect(appState.subjects[path].value).toBe(null);
    expect(appState.state).toBe(null);
  });
});

describe('updateSubject with no state defined', () => {
  let appState;

  beforeEach(async () => {
    appState = new Stative();
  });

  afterEach(() => {
    appState.destroy();
  });

  test('do updateSubject with no argument', () => {
    appState.updateSubject();
    expect(Object.keys(appState.subjects).length).toBe(1);
    expect(appState.state).toBe(null);
  });

  test('do updateSubject with path that does not exist', () => {
    const path = 'a.b';
    appState.updateSubject(path);
    expect(Object.keys(appState.subjects).length).toBe(2);
    expect(appState.subjects[path].value).toBe(undefined);
  });

  test('do updateSubject', () => {
    appState.state = {
      a: {
        b: 99,
      },
    };
    const path = 'a.b';
    appState.updateSubject(path);
    expect(Object.keys(appState.subjects).length).toBe(2);
    expect(appState.subjects[path].value).toBe(99);
  });
});

describe('setState tests', () => {
  let appState;

  beforeEach(async () => {
    appState = new Stative();
  });

  afterEach(() => {
    appState.destroy();
  });

  test('do setState with no argument', () => {
    appState.setState();
    expect(Object.keys(appState.subjects).length).toBe(1);
    expect(appState.state).toBe(null);
  });

  test('do setState with null', (done) => {
    appState.subscribe((s) => {
      expect(s).toBe(null);
      done();
    });
    appState.setState(null);
    expect(Object.keys(appState.subjects).length).toBe(1);
    expect(appState.state).toBe(null);
  });

  test('do setState with array inside stater', () => {
    const newState = {
      a: {
        b: {
          c: 1,
        },
      },
      items: [
        { text: 'a simple text' },
        { text: 'a simple text' },
        { text: 'a simple text' },
      ],
    };
    appState.setState(newState);
    expect(Object.keys(appState.subjects).length).toBe(5);
    expect(appState.state).toBe(newState);
    expect(appState.subjects['a.b.c'].value).toBe(1);
    expect(appState.subjects['a.b'].value).toEqual({ c: 1 });
    expect(appState.subjects.a.value).toEqual({ b: { c: 1 } });
    expect(appState.subjects.items.value).toEqual([
      { text: 'a simple text' },
      { text: 'a simple text' },
      { text: 'a simple text' },
    ]);
    expect(appState.getState$().value).toEqual(newState);
  });

  test('do setState', () => {
    const newState = {
      a: {
        b: {
          c: 1,
        },
      },
      z: null
    };
    appState.setState(newState);
    expect(Object.keys(appState.subjects).length).toBe(5);
    expect(appState.state).toBe(newState);
    expect(appState.subjects['a.b.c'].value).toBe(1);
    expect(appState.subjects['a.b'].value).toEqual({ c: 1 });
    expect(appState.subjects.a.value).toEqual({ b: { c: 1 } });
    expect(appState.subjects.z.value).toEqual(null);
    expect(appState.getState$().value).toEqual(newState);
  });

  test('do setState with a value of undefined', () => {
    appState.setState({ loading: undefined });
    expect(typeof appState.subjects.loading.value).toBe('undefined');
  });

  test('do setState with a new object that differs from the other one', () => {
    appState.setState({ loading: true });
    appState.setState({ a: 1 });
    expect(Object.keys(appState.subjects).length).toEqual(3);
    expect(typeof appState.subjects.loading.value).toBe('undefined');
    expect(appState.subjects.a.value).toEqual(1);
  });
});

describe('update tests', () => {
  let appState;

  beforeEach(async () => {
    appState = new Stative();
  });

  afterEach(() => {
    appState.destroy();
  });

  test('do update with no argument', () => {
    appState.update();
    expect(Object.keys(appState.subjects).length).toBe(1);
    expect(appState.state).toBe(null);
  });

  test('do update with no state', () => {
    appState.update('a.b.c', 1);
    expect(Object.keys(appState.subjects).length).toBe(4);
    expect(appState.state).toEqual({
      a: {
        b: {
          c: 1,
        },
      },
    });
    expect(appState.subjects['a.b.c'].value).toBe(1);
    expect(appState.subjects['a.b'].value).toEqual({ c: 1 });
    expect(appState.subjects.a.value).toEqual({ b: { c: 1 } });
  });

  test('do update', () => {
    appState.state = { a: { b: { c: 1 } } };
    appState.update('a.b.c', 2);
    expect(Object.keys(appState.subjects).length).toBe(4);
    expect(appState.state).toEqual({
      a: {
        b: {
          c: 2,
        },
      },
    });
    expect(appState.subjects['a.b.c'].value).toBe(2);
    expect(appState.subjects['a.b'].value).toEqual({ c: 2 });
    expect(appState.subjects.a.value).toEqual({ b: { c: 2 } });
  });

  test('do update, changing the whole object', () => {
    appState.set({ a: { b: { c: 1 } } });
    appState.update('a', { k: { z: 1 } });
    expect(Object.keys(appState.subjects).length).toBe(6);
    expect(appState.state).toEqual({
      a: {
        k: {
          z: 1,
        },
      },
    });
    expect(appState.subjects['a.b.c'].value).toBe(undefined);
    expect(appState.subjects['a.b'].value).toEqual(undefined);
    expect(appState.subjects['a.k.z'].value).toBe(1);
    expect(appState.subjects['a.k'].value).toEqual({ z: 1 });
    expect(appState.subjects.a.value).toEqual({ k: { z: 1 } });
  });
});

describe('destroy tests', () => {
  test('do destroy', () => {
    const appState = new Stative();
    appState.destroy();
    expect(appState.unsubscribe$.isStopped).toBe(true);
  });
});
