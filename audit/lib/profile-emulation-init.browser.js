({ hw, mem, renderer }) => {
  if (typeof hw === 'number') {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => hw,
      configurable: true,
    });
  }
  if (typeof mem === 'number') {
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => mem,
      configurable: true,
    });
  }
  if (renderer) {
    const patchProto = (proto) => {
      const orig = proto.getParameter;
      proto.getParameter = function (p) {
        const debug = this.getExtension('WEBGL_debug_renderer_info');
        if (debug && p === debug.UNMASKED_RENDERER_WEBGL) return renderer;
        return orig.call(this, p);
      };
    };
    patchProto(WebGLRenderingContext.prototype);
    if (typeof WebGL2RenderingContext !== 'undefined') {
      patchProto(WebGL2RenderingContext.prototype);
    }
  }
};
