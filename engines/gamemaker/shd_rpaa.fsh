// shd_rpaa.fsh
// GameMaker Fragment Shader for Reinvented Pixel Art Animation
varying vec2 v_vTexcoord;
varying vec4 v_vColour;

uniform sampler2D sourceTexture;
uniform sampler2D lookupTexture;

void main()
{
    vec4 src = texture2D(sourceTexture, v_vTexcoord);
    if (src.a < 0.01) {
        gl_FragColor = vec4(0.0);
        return;
    }
    
    vec4 finalColor = texture2D(lookupTexture, vec2(src.r, src.g));
    finalColor.a *= src.a;
    gl_FragColor = v_vColour * finalColor;
}
