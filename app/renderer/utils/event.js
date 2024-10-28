const eventEmit = {
  eventList: {},
  offlineList: [],
  on(type, callback) {
    if (!this.eventList[type]) {
      this.eventList[type] = [];
    }
    this.eventList[type].push(callback);
    if (this.offlineList.length > 0) {
      for (let i = 0; i < this.offlineList.length; i++) {
        this.offlineList[i]();
      }
    }
  },
  emit(type, ...params) {
    let callbacks = this.eventList[type];
    if (!!callbacks) {
      for (let i = 0; i < callbacks.length; i++) {
        callbacks[i].apply(this, params);
      }
    } else {
      let fn = () => {
        this.publish(type, ...params);
      };
      this.offlineList.push(fn);
    }
  },
  remove(type, callback) {
    let cbs = this.eventList[type];
    if (!cbs) return false;
    if (!callback) return (cbs.length = 0);
    for (let i = cbs.length - 1; i >= 0; i--) {
      let cb = cbs[i];
      if (cb === callback) {
        cbs.splice(i, 1);
      }
    }
  },
  once(type, callback) {
    let fn = (...args) => {
      callback.apply(this, args);
      this.remove(type, fn);
    };
    this.subscribe(type, fn);
  },
};
