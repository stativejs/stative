import { BehaviorSubject, Subject } from "rxjs";
import { skip, takeUntil } from "rxjs/operators";
import objectPath from "object-path";

const ROOT_SUBJECT_KEY = "";

class State {
  constructor() {
    this._state = null;
    this._subjects = {
      "": new BehaviorSubject(null)
    };
    this._subscriptions = [];
    this._unsubscribe$ = new Subject();
  }

  destroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  _removeAllSubjects() {
    this._subscriptions.forEach(s => {
      s.unsubscribe();
    });
    this._subscriptions = [];

    for (var path in this._subjects) {
      if (path === ROOT_SUBJECT_KEY) {
        continue;
      }
      this._subjects[path].complete();
      delete this._subjects[path];
    }
  }

  _getAllPathsFromObject(obj, prefix = "", store = []) {
    for (let key in obj) {
      const curPath = `${prefix}.${key}`;
      if (typeof obj[key] === "object") {
        store.push(curPath);
        this._getAllPathsFromObject(obj[key], curPath, store);
      } else {
        store.push(curPath);
      }
    }
    return store.map(p => p.substring(1));
  }

  _expandPath(path) {
    var allPaths = [];
    var paths = path.split(".");
    for (var i = 0; i < paths.length; i++) {
      allPaths.push(paths.slice(0, i + 1).join("."));
    }
    return allPaths;
  }

  _createSubject(path) {
    if (path in this._subjects) {
      return;
    }

    var value = objectPath.has(this._state, path)
      ? objectPath.get(this._state, path)
      : null;
    this._subjects[path] = new BehaviorSubject(value);
  }

  _updateSubject(path) {
    if (!(path in this._subjects)) {
      return;
    }

    var subject$ = this._subjects[path];
    var value = objectPath.has(this._state, path)
      ? objectPath.get(this._state, path)
      : null;
    if (value !== null && typeof value === "object") {
      subject$.next({ ...value });
    } else {
      subject$.next(value);
    }
  }

  _createOrUpdateSubjects(paths) {
    paths.forEach(p => {
      if (!(p in this._subjects)) {
        this._createSubject(p);
      } else {
        this._updateSubject(p);
      }
    });
  }

  getState$() {
    return this._subjects[ROOT_SUBJECT_KEY];
  }

  set(state) {
    var pathsBefore = this._getAllPathsFromObject(this._state);
    this._state = state;

    var rootSubject$ = this.getState$();
    rootSubject$.next(state);

    var paths = this._getAllPathsFromObject(state);
    this._createOrUpdateSubjects(paths);

    var excludedPaths = pathsBefore.filter(
      p => p !== ROOT_SUBJECT_KEY && !paths.includes(p)
    );

    excludedPaths.forEach(p => {
      var subject$ = this._subjects[p];
      subject$.next(null);
    });
  }

  get(path) {
    if (typeof path === "undefined") {
      return this.getState$().value;
    }

    if (!(path in this._subjects)) {
      return undefined;
    }
    var subject$ = this._subjects[path];
    return subject$.value;
  }

  update(path, value) {
    objectPath.set(this._state, path, value);

    var pathsToUpdate = this._expandPath(path);
    this._createOrUpdateSubjects(pathsToUpdate);

    if (typeof value === "object") {
      var pathsInValue = this._getAllPathsFromObject(value).map(
        p => `${path}.${p}`
      );
      this._createOrUpdateSubjects(pathsInValue);
      pathsToUpdate = pathsToUpdate.concat(pathsInValue);
    }

    var rootSubject = this.getState$();
    var newState = { ...this._state };
    rootSubject.next(newState);
  }

  subscribe(path, fn) {
    if (typeof path === "function") {
      this.getState$()
        .pipe(
          skip(1),
          takeUntil(this._unsubscribe$)
        )
        .subscribe(path);
      return;
    }

    this._createSubject(path);

    var subject$ = this._subjects[path];
    var subscription = subject$
      .pipe(
        skip(1),
        takeUntil(this._unsubscribe$)
      )
      .subscribe(fn);
    this._subscriptions.push(subscription);
  }
}

export default new State();
