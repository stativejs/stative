import state from '../src/stative';

describe('expandPath tests', () => {
  test('undefined path', () => {
    expect(state.expandPath()).toEqual([]);
  });

  test('null path', () => {
    expect(state.expandPath(null)).toEqual([]);
  });

  test('empty path', () => {
    expect(state.expandPath('')).toEqual([]);
  });

  test('one path', () => {
    expect(state.expandPath('loading')).toEqual(['loading']);
  });
});

describe('getAllPathsFromObject tests', () => {
  test('null', () => {
    expect(state.getAllPathsFromObject(null)).toEqual([]);
  });

  test('not object', () => {
    expect(state.getAllPathsFromObject('a string')).toEqual([]);
  });

  test('empty object', () => {
    expect(state.getAllPathsFromObject({})).toEqual([]);
  });

  test('big object', () => {
    const paths = state.getAllPathsFromObject({
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
  test('do initialize', () => {
    state.initiliaze();
    expect(state.state).toBe(null);
    expect(Object.keys(state.subjects).length).toBe(1);
  });
});

describe('createSubject tests', () => {
  beforeEach(() => {
    state.reset();
  });

  test('do createSubject with no argument', () => {
    state.createSubject();
    expect(Object.keys(state.subjects).length).toBe(1);
    expect(state.state).toBe(null);
  });

  test('do createSubject', () => {
    const path = 'a.b';
    state.createSubject(path);
    expect(Object.keys(state.subjects).length).toBe(2);
    expect(state.subjects[path].value).toBe(null);
    expect(state.state).toBe(null);
  });
});

describe('updateSubject with no state defined', () => {
  beforeEach(() => {
    state.reset();
  });

  test('do updateSubject with no argument', () => {
    state.updateSubject();
    expect(Object.keys(state.subjects).length).toBe(1);
    expect(state.state).toBe(null);
  });

  test('do updateSubject with path that does not exist', () => {
    const path = 'a.b';
    state.updateSubject(path);
    expect(Object.keys(state.subjects).length).toBe(2);
    expect(state.subjects[path].value).toBe(null);
  });

  test('do updateSubject', () => {
    state.state = {
      a: {
        b: 99,
      },
    };
    const path = 'a.b';
    state.updateSubject(path);
    expect(Object.keys(state.subjects).length).toBe(2);
    expect(state.subjects[path].value).toBe(99);
  });
});

describe('setState tests', () => {
  beforeEach(() => {
    state.reset();
  });

  test('do setState with no argument', () => {
    state.setState();
    expect(Object.keys(state.subjects).length).toBe(1);
    expect(state.state).toBe(null);
  });

  test('do setState with null', (done) => {
    state.subscribe((s) => {
      expect(s).toBe(null);
      done();
    });
    state.setState(null);
    expect(Object.keys(state.subjects).length).toBe(1);
    expect(state.state).toBe(null);
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
    state.setState(newState);
    expect(Object.keys(state.subjects).length).toBe(5);
    expect(state.state).toBe(newState);
    expect(state.subjects['a.b.c'].value).toBe(1);
    expect(state.subjects['a.b'].value).toEqual({ c: 1 });
    expect(state.subjects.a.value).toEqual({ b: { c: 1 } });
    expect(state.subjects.z.value).toEqual(null);
    expect(state.getState$().value).toEqual(newState);
  });
});

describe('update tests', () => {
  beforeEach(() => {
    state.reset();
  });

  test('do update with no argument', () => {
    state.update();
    expect(Object.keys(state.subjects).length).toBe(1);
    expect(state.state).toBe(null);
  });

  test('do update with no state', () => {
    state.update('a.b.c', 1);
    expect(Object.keys(state.subjects).length).toBe(4);
    expect(state.state).toEqual({
      a: {
        b: {
          c: 1,
        },
      },
    });
    expect(state.subjects['a.b.c'].value).toBe(1);
    expect(state.subjects['a.b'].value).toEqual({ c: 1 });
    expect(state.subjects.a.value).toEqual({ b: { c: 1 } });
  });

  test('do update', () => {
    state.state = { a: { b: { c: 1 } } };
    state.update('a.b.c', 2);
    expect(Object.keys(state.subjects).length).toBe(4);
    expect(state.state).toEqual({
      a: {
        b: {
          c: 2,
        },
      },
    });
    expect(state.subjects['a.b.c'].value).toBe(2);
    expect(state.subjects['a.b'].value).toEqual({ c: 2 });
    expect(state.subjects.a.value).toEqual({ b: { c: 2 } });
  });
});

describe('destroy tests', () => {
  test('do destroy', () => {
    state.destroy();
    expect(state.unsubscribe$.isStopped).toBe(true);
  });
});
