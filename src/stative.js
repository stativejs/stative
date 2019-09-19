import { BehaviorSubject, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import objectPath from 'object-path';

const ROOT_SUBJECT_KEY = '';

class State {
  constructor() {
    this.unsubscribe$ = new Subject();
    this.initiliaze();
  }

  initiliaze() {
    this.state = null;
    this.subjects = {
      '': new BehaviorSubject(null),
    };
  }

  reset() {
    this.unsubscribe$.next();
    this.initiliaze();
  }

  destroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
    if (obj === null || typeof obj !== 'object') {
      return [];
    }

    Object.keys(obj).forEach((key) => {
      const curPath = `${prefix}.${key}`;
      if (typeof obj[key] === 'object' && !(obj[key].constructor === Array)) {
        store.push(curPath);
        this.getAllPathsFromObject(obj[key], curPath, store);
      } else {
        store.push(curPath);
      }
    });
    return store.map((p) => p.substring(1));
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
    paths.forEach((p) => {
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
      : null;

    if (value !== null && value.constructor === Array) {
      subject$.next([...value]);
    } else if (value !== null && typeof value === 'object') {
      subject$.next({ ...value });
    } else {
      subject$.next(value);
    }
  }

  updateSubjects(paths) {
    paths.forEach((p) => {
      this.updateSubject(p);
    });
  }

  setState(state) {
    if (typeof state === 'undefined') {
      return;
    }

    const pathsBefore = this.getAllPathsFromObject(this.state);
    this.state = state;

    const rootSubject$ = this.getState$();
    rootSubject$.next(state);

    const paths = this.getAllPathsFromObject(state);
    this.createSubjects(paths);
    this.updateSubjects(paths);

    const excludedPaths = pathsBefore.filter(
      (p) => p !== ROOT_SUBJECT_KEY && !paths.includes(p)
    );

    excludedPaths.forEach((p) => {
      const subject$ = this.subjects[p];
      subject$.next(null);
    });
  }

  update(path, value) {
    if (typeof path !== 'string') {
      return;
    }

    if (this.state === null) {
      this.state = {};
    }

    objectPath.set(this.state, path, value);

    const rootSubject$ = this.getState$();
    const newState = { ...this.state };
    rootSubject$.next(newState);

    const pathsToUpdate = this.expandPath(path);
    this.updateSubjects(pathsToUpdate);

    if (value !== null && typeof value === 'object') {
      const pathsInValue = this.getAllPathsFromObject(value).map(
        (p) => `${path}.${p}`
      );
      this.updateSubjects(pathsInValue);
    }
  }

  set(path, value) {
    if (typeof path === 'object') {
      this.setState(path);
    } else {
      this.update(path, value);
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
      this.getState$()
        .pipe(
          skip(1),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(path);
      return;
    }

    this.createSubject(path);

    const subject$ = this.subjects[path];
    subject$
      .pipe(
        skip(1),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(fn);
  }
}

export default new State();
