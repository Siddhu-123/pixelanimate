/**
 * Hardware-accelerated WebGL UV-Lookup shader engine with Canvas2D fallback.
 * Implements aarthificial's "Pixel Art Animation. Reinvented" rendering model.
 */

export interface RenderOptions {
  mode: 'result' | 'source_raw' | 'source_boosted' | 'channel_u' | 'channel_v';
  boostFactor: number;
  highlightUV?: [number, number]; // [u, v] in normalized 0..1 coordinates
  dirtAmount?: number; // 0..100
  faceShadow?: boolean;
  time?: number;
}

export class ShaderEngine {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private sourceTexture: WebGLTexture | null = null;
  private lookupTexture: WebGLTexture | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private isWebGLSupported = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.initWebGL();
  }

  private initWebGL(): boolean {
    const gl = this.canvas.getContext('webgl', { 
      premultipliedAlpha: false,
      alpha: true,
      preserveDrawingBuffer: true,
      antialias: false 
    });

    if (!gl) {
      console.warn('WebGL not supported, falling back to Canvas 2D');
      this.isWebGLSupported = false;
      return false;
    }

    this.gl = gl;

    const vsSource = `
      attribute vec2 a_position;
      attribute vec2 a_texcoord;
      varying vec2 v_texcoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texcoord = a_texcoord;
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform sampler2D u_source;
      uniform sampler2D u_lookup;
      uniform vec2 u_lookup_size;
      uniform int u_mode; // 0=result, 1=source_raw, 2=source_boosted, 3=channel_u, 4=channel_v
      uniform float u_boost;
      uniform vec2 u_highlight_uv;
      uniform float u_time;
      uniform float u_dirt;
      uniform int u_face_shadow;
      varying vec2 v_texcoord;

      void main() {
        vec4 src = texture2D(u_source, v_texcoord);
        if (src.a < 0.05) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }

        // Mode 1: Raw UV (R=U, G=V)
        if (u_mode == 1) {
          gl_FragColor = vec4(src.r, src.g, 0.0, src.a);
          return;
        }

        // Mode 2: Boosted UV (magnified so dark UVs are visible to humans)
        if (u_mode == 2) {
          gl_FragColor = vec4(clamp(src.r * u_boost, 0.0, 1.0), clamp(src.g * u_boost, 0.0, 1.0), 0.1, src.a);
          return;
        }

        // Mode 3: U / X coordinate channel only
        if (u_mode == 3) {
          gl_FragColor = vec4(clamp(src.r * u_boost, 0.0, 1.0), 0.0, 0.0, src.a);
          return;
        }

        // Mode 4: V / Y coordinate channel only
        if (u_mode == 4) {
          gl_FragColor = vec4(0.0, clamp(src.g * u_boost, 0.0, 1.0), 0.0, src.a);
          return;
        }

        // Mode 0: RESULT (Sample lookup texture using UV stored in src.r & src.g)
        vec2 sampleUV = vec2(src.r, src.g);
        vec4 lookupColor = texture2D(u_lookup, sampleUV);

        // Face shadow effect
        if (u_face_shadow == 1 && src.g < 0.35 && src.r > 0.25 && src.r < 0.7) {
          lookupColor.rgb *= 0.65;
        }

        // Mud / Dirt effect: accumulates dirt particles on lower clothing and legs
        if (u_dirt > 0.0 && src.g > 0.42) {
          float dirtRatio = u_dirt / 100.0;
          float pX = floor(sampleUV.x * u_lookup_size.x);
          float pY = floor(sampleUV.y * u_lookup_size.y);
          float noise = fract(sin(pX * 12.9898 + pY * 78.233) * 43758.5453);
          if (noise < dirtRatio * 0.85) {
            vec3 mudColor = vec3(0.31, 0.21, 0.14);
            lookupColor.rgb = mix(lookupColor.rgb, mudColor, 0.88);
          }
        }

        // Bidirectional UV cross-highlighting
        if (u_highlight_uv.x >= 0.0) {
          vec2 diff = abs(sampleUV - u_highlight_uv) * u_lookup_size;
          if (diff.x < 0.75 && diff.y < 0.75) {
            float pulse = 0.5 + 0.5 * sin(u_time * 8.0);
            lookupColor = mix(lookupColor, vec4(1.0, 0.95, 0.2, 1.0), pulse * 0.9);
          }
        }

        gl_FragColor = lookupColor;
      }
    `;

    const program = this.createProgram(gl, vsSource, fsSource);
    if (!program) {
      this.isWebGLSupported = false;
      return false;
    }

    this.program = program;

    // Set up fullscreen quad (2 triangles)
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    // Flip Y for texture coordinates so top-left is (0,0)
    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      0, 0,
      1, 1,
      1, 0,
    ]);

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    this.sourceTexture = this.createPixelTexture(gl);
    this.lookupTexture = this.createPixelTexture(gl);

    this.isWebGLSupported = true;
    return true;
  }

  private createProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram | null {
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error('Vertex shader compile error:', gl.getShaderInfoLog(vs));
      return null;
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compile error:', gl.getShaderInfoLog(fs));
      return null;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return null;
    }

    return program;
  }

  private createPixelTexture(gl: WebGLRenderingContext): WebGLTexture {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // Nearest neighbor is crucial for authentic crisp pixel art!
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return tex;
  }

  public render(
    sourceData: Uint8ClampedArray,
    sourceW: number,
    sourceH: number,
    lookupData: Uint8ClampedArray,
    lookupW: number,
    lookupH: number,
    options: RenderOptions
  ): void {
    if (!this.isWebGLSupported || !this.gl || !this.program) {
      this.render2DFallback(sourceData, sourceW, sourceH, lookupData, lookupW, lookupH, options);
      return;
    }

    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    // Update Source Texture (active cel UV map)
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sourceW, sourceH, 0, gl.RGBA, gl.UNSIGNED_BYTE, sourceData);
    const uSourceLoc = gl.getUniformLocation(this.program, 'u_source');
    gl.uniform1i(uSourceLoc, 0);

    // Update Lookup Texture (Skin)
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.lookupTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, lookupW, lookupH, 0, gl.RGBA, gl.UNSIGNED_BYTE, lookupData);
    const uLookupLoc = gl.getUniformLocation(this.program, 'u_lookup');
    gl.uniform1i(uLookupLoc, 1);

    // Set Uniforms
    const uSizeLoc = gl.getUniformLocation(this.program, 'u_lookup_size');
    gl.uniform2f(uSizeLoc, lookupW, lookupH);

    let modeInt = 0;
    if (options.mode === 'source_raw') modeInt = 1;
    else if (options.mode === 'source_boosted') modeInt = 2;
    else if (options.mode === 'channel_u') modeInt = 3;
    else if (options.mode === 'channel_v') modeInt = 4;

    const uModeLoc = gl.getUniformLocation(this.program, 'u_mode');
    gl.uniform1i(uModeLoc, modeInt);

    const uBoostLoc = gl.getUniformLocation(this.program, 'u_boost');
    gl.uniform1f(uBoostLoc, options.boostFactor || 8.0);

    const uHighlightLoc = gl.getUniformLocation(this.program, 'u_highlight_uv');
    if (options.highlightUV) {
      gl.uniform2f(uHighlightLoc, options.highlightUV[0], options.highlightUV[1]);
    } else {
      gl.uniform2f(uHighlightLoc, -1.0, -1.0);
    }

    const uTimeLoc = gl.getUniformLocation(this.program, 'u_time');
    gl.uniform1f(uTimeLoc, options.time || 0);

    const uDirtLoc = gl.getUniformLocation(this.program, 'u_dirt');
    gl.uniform1f(uDirtLoc, options.dirtAmount || 0);

    const uFaceShadowLoc = gl.getUniformLocation(this.program, 'u_face_shadow');
    gl.uniform1i(uFaceShadowLoc, options.faceShadow ? 1 : 0);

    // Attributes
    const posLoc = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const texCoordLoc = gl.getAttribLocation(this.program, 'a_texcoord');
    gl.enableVertexAttribArray(texCoordLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * Software rendering fallback using HTML5 Canvas 2D ImageData
   */
  private render2DFallback(
    sourceData: Uint8ClampedArray,
    sourceW: number,
    sourceH: number,
    lookupData: Uint8ClampedArray,
    lookupW: number,
    lookupH: number,
    options: RenderOptions
  ): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(sourceW, sourceH);
    const out = imgData.data;
    const boost = options.boostFactor || 8.0;
    const hl = options.highlightUV;
    const dirt = (options.dirtAmount || 0) / 100;
    const faceShadow = options.faceShadow || false;

    for (let i = 0; i < sourceW * sourceH; i++) {
      const idx = i * 4;
      const r = sourceData[idx];     // U (normalized to 0..255)
      const g = sourceData[idx + 1]; // V (normalized to 0..255)
      const a = sourceData[idx + 3];

      if (a < 10) {
        out[idx + 3] = 0;
        continue;
      }

      if (options.mode === 'source_raw') {
        out[idx] = r;
        out[idx + 1] = g;
        out[idx + 2] = 0;
        out[idx + 3] = a;
        continue;
      }

      if (options.mode === 'source_boosted') {
        out[idx] = Math.min(255, Math.round(r * boost));
        out[idx + 1] = Math.min(255, Math.round(g * boost));
        out[idx + 2] = 20;
        out[idx + 3] = a;
        continue;
      }

      if (options.mode === 'channel_u') {
        out[idx] = Math.min(255, Math.round(r * boost));
        out[idx + 1] = 0;
        out[idx + 2] = 0;
        out[idx + 3] = a;
        continue;
      }

      if (options.mode === 'channel_v') {
        out[idx] = 0;
        out[idx + 1] = Math.min(255, Math.round(g * boost));
        out[idx + 2] = 0;
        out[idx + 3] = a;
        continue;
      }

      // Result mode: map UV coordinates to pixel in lookup texture
      // Convert normalized byte (0..255) to lookup (X, Y)
      const uCoord = Math.min(lookupW - 1, Math.floor((r / 255) * lookupW));
      const vCoord = Math.min(lookupH - 1, Math.floor((g / 255) * lookupH));
      const lookupIdx = (vCoord * lookupW + uCoord) * 4;

      let lr = lookupData[lookupIdx];
      let lg = lookupData[lookupIdx + 1];
      let lb = lookupData[lookupIdx + 2];
      const la = lookupData[lookupIdx + 3];

      if (faceShadow && vCoord < lookupH * 0.35 && uCoord > lookupW * 0.25 && uCoord < lookupW * 0.7) {
        lr = Math.round(lr * 0.65);
        lg = Math.round(lg * 0.65);
        lb = Math.round(lb * 0.65);
      }

      if (dirt > 0 && vCoord > lookupH * 0.42) {
        const noise = (Math.sin(uCoord * 12.9898 + vCoord * 78.233) * 43758.5453) % 1;
        if (Math.abs(noise) < dirt * 0.85) {
          lr = Math.round(lr * 0.2 + 80 * 0.8);
          lg = Math.round(lg * 0.2 + 55 * 0.8);
          lb = Math.round(lb * 0.2 + 35 * 0.8);
        }
      }

      if (hl && Math.abs(uCoord - hl[0] * lookupW) < 1 && Math.abs(vCoord - hl[1] * lookupH) < 1) {
        lr = 255;
        lg = 240;
        lb = 50;
      }

      out[idx] = lr;
      out[idx + 1] = lg;
      out[idx + 2] = lb;
      out[idx + 3] = la;
    }

    ctx.putImageData(imgData, 0, 0);
  }

  public destroy(): void {
    if (this.gl) {
      if (this.program) this.gl.deleteProgram(this.program);
      if (this.sourceTexture) this.gl.deleteTexture(this.sourceTexture);
      if (this.lookupTexture) this.gl.deleteTexture(this.lookupTexture);
      if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
      if (this.texCoordBuffer) this.gl.deleteBuffer(this.texCoordBuffer);
    }
  }
}
