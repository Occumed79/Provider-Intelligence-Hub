function noop (p5) {
    p5._friendlyError = () => {};
    p5._checkForUserDefinedFunctions = () => {};
    p5._fesErrorMonitor = () => {};
  }

export { noop as default };
