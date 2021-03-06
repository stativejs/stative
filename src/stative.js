import { BehaviorSubject, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import objectPath from 'object-path';

const ROOT_SUBJECT_KEY = '';

export class Stative {
  constructor() {
    this.unsubscribe$ = new Subject();
    this.state = null;
    this.subjects = {
      '': new BehaviorSubject(null)
    };
  }

  arrayDifference(a1, a2) {
    const result = [];
    for (let i = 0; i < a1.length; i += 1) {
      if (a2.indexOf(a1[i]) === -1) {
        result.push(a1[i]);
      }
    }
    return result;
  }

  expandPath(path) {
    if (typeof path !== 'string') {
      return [];
    }

    if (path === '') {
      return [];
    }

    const allPaths = [];
    const paths = path.split('.');
    for (let i = 0; i < paths.length; i += 1) {
      allPaths.push(paths.slice(0, i + 1).join('.'));
    }
    return allPaths;
  }

  getAllPathsFromObject(obj, prefix = '', store = []) {
    if (obj === null || typeof obj === 'undefined') {
      return [];
    }

    if (obj instanceof Array) {
      return [];
    }

    if (typeof obj !== 'object') {
      return [];
    }

    Object.keys(obj).forEach(key => {
      const curPath = `${prefix}.${key}`;
      store.push(curPath);
      this.getAllPathsFromObject(obj[key], curPath, store);
    });
    return store.map(p => p.substring(1));
  }

  createSubject(path) {
    if (typeof path !== 'string' || path in this.subjects) {
      return;
    }

    this.subjects[path] = new BehaviorSubject(null);
  }

  getState$() {
    return this.subjects[ROOT_SUBJECT_KEY];
  }

  createSubjects(paths) {
    paths.forEach(p => {
      if (!(p in this.subjects)) {
        this.createSubject(p);
      }
    });
  }

  updateSubject(path) {
    if (typeof path !== 'string') {
      return;
    }

    this.createSubject(path);

    const subject$ = this.subjects[path];
    const value = objectPath.has(this.state, path)
      ? objectPath.get(this.state, path)
      : undefined;

    if (
      value !== null &&
      typeof value !== 'undefined' &&
      value.constructor === Array
    ) {
      subject$.next([...value]);
    } else if (value !== null && typeof value === 'object') {
      subject$.next({ ...value });
    } else {
      subject$.next(value);
    }
  }

  updateSubjects(paths) {
    paths.forEach(p => {
      this.updateSubject(p);
    });
  }

  setState(state) {
    if (typeof state === 'undefined') {
      return;
    }

    const oldPaths = this.getAllPathsFromObject(this.state);
    this.state = state;

    const rootSubject$ = this.getState$();
    rootSubject$.next(state);

    const paths = this.getAllPathsFromObject(state);
    this.createSubjects(paths);
    this.updateSubjects(paths);

    const pathWithoutRoot = paths.filter(p => p !== ROOT_SUBJECT_KEY);
    const pathsToSetToUndefined = this.arrayDifference(
      oldPaths,
      pathWithoutRoot
    );
    this.updateSubjects(pathsToSetToUndefined);
  }

  update(path, value) {
    if (typeof path !== 'string') {
      return;
    }

    if (this.state === null) {
      this.state = {};
    }

    const oldPaths = this.getAllPathsFromObject(this.state);

    objectPath.set(this.state, path, value);

    const rootSubject$ = this.getState$();
    const newState = { ...this.state };
    rootSubject$.next(newState);

    const pathsToUpdate = this.expandPath(path);
    this.updateSubjects(pathsToUpdate);

    if (value !== null && typeof value === 'object') {
      const pathsInValue = this.getAllPathsFromObject(value).map(
        p => `${path}.${p}`
      );
      this.updateSubjects(pathsInValue);
    }

    const newPaths = this.getAllPathsFromObject(this.state);
    const pathsToSetToUndefined = this.arrayDifference(oldPaths, newPaths);
    this.updateSubjects(pathsToSetToUndefined);
  }

  set(path, value) {
    if (typeof path === 'function') {
      const currentState = this.get();
      const newState = path(currentState);
      this.setState(newState);
    } else if (typeof path === 'object') {
      this.setState(path);
    } else if (typeof path === 'string') {
      if (typeof value === 'function') {
        const currentPathValue = this.get(path);
        const newPathValue = value(currentPathValue);
        this.update(path, newPathValue);
      } else {
        this.update(path, value);
      }
    }
  }

  get(path) {
    if (typeof path === 'undefined') {
      return this.getState$().value;
    }

    if (!(path in this.subjects)) {
      return undefined;
    }
    const subject$ = this.subjects[path];
    return subject$.value;
  }

  subscribe(path, fn) {
    if (typeof path === 'function') {
      return this.getState$()
        .pipe(
          skip(1),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(path);
    }

    this.createSubject(path);

    const subject$ = this.subjects[path];
    return subject$
      .pipe(
        skip(1),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(fn);
  }
}

export default new Stative();
