// PixelArtImporter.cs
// Unity Asset Postprocessor to bake Mapped Sprites into UV Source textures
using UnityEngine;
using UnityEditor;

public class PixelArtImporter : AssetPostprocessor
{
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
