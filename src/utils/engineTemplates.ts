/**
 * Shaders and Integration Script Templates for Game Engines:
 * - Unity (HLSL / ShaderLab + C# Importer)
 * - Godot 4 (GDShader + GDScript)
 * - GameMaker (GLSL ES + GML)
 * - WebGL (Fragment & Vertex)
 */

export const UNITY_SHADER = `// AstortionPixelArt.shader
// Recreation of aarthificial's Reinvented Pixel Art Animation Shader for Unity
Shader "PixelAnimate/UVAnimation"
{
    Properties
    {
        _MainTex ("Source UV Texture", 2D) = "white" {}
        _LookupTex ("Skin / Lookup Texture", 2D) = "white" {}
        _Color ("Tint Color", Color) = (1,1,1,1)
    }

    SubShader
    {
        Tags 
        { 
            "Queue"="Transparent" 
            "RenderType"="Transparent" 
            "PreviewType"="Plane"
            "CanUseSpriteAtlas"="True"
        }

        Cull Off
        Lighting Off
        ZWrite Off
        Blend SrcAlpha OneMinusSrcAlpha

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct appdata_t
            {
                float4 vertex   : POSITION;
                float4 color    : COLOR;
                float2 texcoord : TEXCOORD0;
            };

            struct v2f
            {
                float4 vertex   : SV_POSITION;
                fixed4 color    : COLOR;
                float2 texcoord : TEXCOORD0;
            };

            sampler2D _MainTex;
            sampler2D _LookupTex;
            fixed4 _Color;

            v2f vert(appdata_t IN)
            {
                v2f OUT;
                OUT.vertex = UnityObjectToClipPos(IN.vertex);
                OUT.texcoord = IN.texcoord;
                OUT.color = IN.color * _Color;
                return OUT;
            }

            fixed4 frag(v2f IN) : SV_Target
            {
                // Sample UV coordinates encoded in Source texture
                fixed4 src = tex2D(_MainTex, IN.texcoord);
                
                // Discard transparent pixels
                if (src.a < 0.01)
                    discard;

                // Red channel = U, Green channel = V
                float2 lookupUV = float2(src.r, src.g);
                
                // Sample final visual color from lookup skin texture
                fixed4 finalColor = tex2D(_LookupTex, lookupUV);
                finalColor.a *= src.a;
                finalColor *= IN.color;

                return finalColor;
            }
            ENDCG
        }
    }
}
`;

export const UNITY_IMPORTER_CS = `// PixelArtImporter.cs
// Unity Asset Postprocessor to bake Mapped Sprites into UV Source textures
using UnityEngine;
using UnityEditor;

public class PixelArtImporter : AssetPostprocessor
{
    // Bake a mapped sprite into UV coordinates using a reference Map
    public static Texture2D BakeToUV(Texture2D mappedTexture, Texture2D mapTemplate)
    {
        int w = mappedTexture.width;
        int h = mappedTexture.height;
        int mapW = mapTemplate.width;
        int mapH = mapTemplate.height;

        Color[] mappedPixels = mappedTexture.GetPixels();
        Color[] mapPixels = mapTemplate.GetPixels();
        Color[] outputUV = new Color[mappedPixels.Length];

        for (int i = 0; i < mappedPixels.Length; i++)
        {
            Color c = mappedPixels[i];
            if (c.a < 0.05f)
            {
                outputUV[i] = Color.clear;
                continue;
            }

            // Find matching pixel coordinate in Map
            bool found = false;
            for (int my = 0; my < mapH; my++)
            {
                for (int mx = 0; mx < mapW; mx++)
                {
                    Color mc = mapPixels[my * mapW + mx];
                    if (Mathf.Abs(c.r - mc.r) < 0.02f &&
                        Mathf.Abs(c.g - mc.g) < 0.02f &&
                        Mathf.Abs(c.b - mc.b) < 0.02f)
                    {
                        // Encode (mx, my) into R and G
                        float u = (mx + 0.5f) / mapW;
                        float v = (my + 0.5f) / mapH;
                        outputUV[i] = new Color(u, v, 0f, c.a);
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }

            if (!found)
            {
                outputUV[i] = Color.clear;
            }
        }

        Texture2D baked = new Texture2D(w, h, TextureFormat.RGBA32, false);
        baked.filterMode = FilterMode.Point;
        baked.SetPixels(outputUV);
        baked.Apply();
        return baked;
    }
}
`;

export const GODOT_SHADER = `// astortion_uv.gdshader
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
`;

export const GAMEMAKER_SHADER = `// shd_rpaa.fsh
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
`;

export const GAMEMAKER_GML = `// rpaa_draw.gml
// GameMaker function to draw UV-mapped animated sprite
function rpaa_draw_character(source_tex, lookup_tex, x, y, xscale, yscale) {
    shader_set(shd_rpaa);
    
    var u_source = shader_get_sampler_index(shd_rpaa, "sourceTexture");
    var u_lookup = shader_get_sampler_index(shd_rpaa, "lookupTexture");
    
    texture_set_stage(u_source, source_tex);
    texture_set_stage(u_lookup, lookup_tex);
    
    draw_sprite_ext(spr_player_uv, image_index, x, y, xscale, yscale, 0, c_white, 1.0);
    
    shader_reset();
}
`;
