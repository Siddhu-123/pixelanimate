// AstortionPixelArt.shader
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
