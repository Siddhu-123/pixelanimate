// astortion_uv.gdshader
// Godot 4 CanvasItem Shader for UV-Mapped Pixel Art Animation
shader_type canvas_item;
render_mode blend_mix;

uniform sampler2D lookup_texture : filter_nearest;
uniform float dirt_amount : hint_range(0.0, 1.0) = 0.0;
uniform bool face_shadow = false;

void fragment() {
    // Sample UV coordinates from source cel
    vec4 src = texture(TEXTURE, UV);
    
    if (src.a < 0.01) {
        discard;
    }
    
    // R = U coordinate, G = V coordinate
    vec2 lookup_uv = vec2(src.r, src.g);
    vec4 final_color = texture(lookup_texture, lookup_uv);
    
    // Optional runtime face shadow
    if (face_shadow && src.g < 0.35 && src.r > 0.25 && src.r < 0.7) {
        final_color.rgb *= 0.65;
    }
    
    // Optional runtime mud / dirt accumulation on lower body
    if (dirt_amount > 0.0 && src.g > 0.42) {
        float noise = fract(sin(dot(lookup_uv, vec2(12.9898, 78.233))) * 43758.5453);
        if (noise < dirt_amount * 0.85) {
            vec3 mud = vec3(0.31, 0.21, 0.14);
            final_color.rgb = mix(final_color.rgb, mud, 0.85);
        }
    }
    
    final_color.a *= src.a * COLOR.a;
    COLOR = final_color;
}
