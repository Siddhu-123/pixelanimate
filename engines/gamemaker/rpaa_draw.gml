// rpaa_draw.gml
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
