export default class RenderContext {
  constructor () {
    this._styles = new Set();
    this.insertCss = (...styles) => styles.forEach((style) => this._styles.add(__SERVER__ ? style._getCss() : style._insertCss()));
  }

  // NOTE: For grabbing CSS string on the server before render
  getCssString () {
    return [...this._styles].join('');
  }
}
