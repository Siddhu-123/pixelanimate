export interface PaletteColor {
  hex: string;
  name: string;
}

export interface Palette {
  id: string;
  name: string;
  colors: PaletteColor[];
}

export const PALETTES: Palette[] = [
  {
    id: 'astortion',
    name: 'Astortion Official',
    colors: [
      { hex: '#1c1e22', name: 'Alice Hair Dark' },
      { hex: '#2d3037', name: 'Alice Hair Mid' },
      { hex: '#3d424c', name: 'Alice Hair Highlight' },
      { hex: '#ffd0b1', name: 'Alice Skin Fair' },
      { hex: '#deac8e', name: 'Alice Skin Shadow' },
      { hex: '#24262a', name: 'Dark Vest/Shirt' },
      { hex: '#373a40', name: 'Vest Highlight' },
      { hex: '#323438', name: 'Pants Dark' },
      { hex: '#444850', name: 'Pants Mid' },
      { hex: '#585e68', name: 'Pants Light' },
      { hex: '#b4b9be', name: 'Boots Grey' },
      { hex: '#ffffff', name: 'AST-1 White' },
      { hex: '#bce1ff', name: 'AST-1 Glow' },
      { hex: '#4f3624', name: 'Mud Dirt Dark' },
      { hex: '#7a5438', name: 'Mud Dirt Light' },
      { hex: '#00adb5', name: 'Terminal Teal' },
      { hex: '#e67e22', name: 'Energy Orange' },
      { hex: '#e74c3c', name: 'Accent Crimson' },
    ]
  },
  {
    id: 'pico8',
    name: 'PICO-8 (16 Colors)',
    colors: [
      { hex: '#000000', name: 'Black' },
      { hex: '#1D2B53', name: 'Dark Blue' },
      { hex: '#7E2553', name: 'Dark Purple' },
      { hex: '#008751', name: 'Dark Green' },
      { hex: '#AB5236', name: 'Brown' },
      { hex: '#5F574F', name: 'Dark Gray' },
      { hex: '#C2C3C7', name: 'Light Gray' },
      { hex: '#FFF1E8', name: 'White' },
      { hex: '#FF004D', name: 'Red' },
      { hex: '#FFA300', name: 'Orange' },
      { hex: '#FFEC27', name: 'Yellow' },
      { hex: '#00E436', name: 'Green' },
      { hex: '#29ADFF', name: 'Blue' },
      { hex: '#83769C', name: 'Indigo' },
      { hex: '#FF77A8', name: 'Pink' },
      { hex: '#FFCCAA', name: 'Peach' },
    ]
  },
  {
    id: 'endesga32',
    name: 'Endesga 32',
    colors: [
      { hex: '#be4a2f', name: 'Brick Red' },
      { hex: '#d77643', name: 'Carrot' },
      { hex: '#ead4aa', name: 'Sand' },
      { hex: '#e4a672', name: 'Buff' },
      { hex: '#b86f50', name: 'Raw Sienna' },
      { hex: '#733e39', name: 'Russet' },
      { hex: '#3e2731', name: 'Dark Bronze' },
      { hex: '#a22633', name: 'Wine' },
      { hex: '#e43b44', name: 'Scarlet' },
      { hex: '#f77622', name: 'Orange' },
      { hex: '#feae34', name: 'Amber' },
      { hex: '#fee761', name: 'Yellow' },
      { hex: '#63c74d', name: 'Lime' },
      { hex: '#3e8948', name: 'Forest' },
      { hex: '#265c42', name: 'Pine' },
      { hex: '#193c3e', name: 'Dark Teal' },
      { hex: '#124e89', name: 'Navy' },
      { hex: '#0099db', name: 'Cyan' },
      { hex: '#2ce8f5', name: 'Electric' },
      { hex: '#ffffff', name: 'Pure White' },
      { hex: '#c0cbdc', name: 'Pale Slate' },
      { hex: '#8b9bb4', name: 'Slate' },
      { hex: '#5a6988', name: 'Dark Slate' },
      { hex: '#3a4466', name: 'Midnight' },
      { hex: '#262b44', name: 'Abyss' },
      { hex: '#181425', name: 'Void' },
      { hex: '#ff0044', name: 'Rose' },
      { hex: '#68386c', name: 'Purple' },
      { hex: '#b55088', name: 'Fuchsia' },
      { hex: '#f6757a', name: 'Salmon' },
      { hex: '#e8b796', name: 'Peach Skin' },
      { hex: '#c28569', name: 'Tanned' }
    ]
  }
];
