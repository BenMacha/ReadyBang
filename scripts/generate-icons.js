#!/usr/bin/env node

/**
 * Génère toutes les icônes et splash screens pour iOS et Android
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const RESOURCES_DIR = '../game/resources';
const SOURCE_ICON = '../decompiled/apk_extracted/assets/Default.png';

// iOS icon sizes
const IOS_ICONS = [
  { size: 20, scale: 1, name: 'icon-20.png' },
  { size: 20, scale: 2, name: 'icon-20@2x.png' },
  { size: 20, scale: 3, name: 'icon-20@3x.png' },
  { size: 29, scale: 1, name: 'icon-29.png' },
  { size: 29, scale: 2, name: 'icon-29@2x.png' },
  { size: 29, scale: 3, name: 'icon-29@3x.png' },
  { size: 40, scale: 1, name: 'icon-40.png' },
  { size: 40, scale: 2, name: 'icon-40@2x.png' },
  { size: 40, scale: 3, name: 'icon-40@3x.png' },
  { size: 60, scale: 2, name: 'icon-60@2x.png' },
  { size: 60, scale: 3, name: 'icon-60@3x.png' },
  { size: 76, scale: 1, name: 'icon-76.png' },
  { size: 76, scale: 2, name: 'icon-76@2x.png' },
  { size: 83.5, scale: 2, name: 'icon-83.5@2x.png' },
  { size: 1024, scale: 1, name: 'icon-1024.png' },
];

// Android icon sizes (adaptive icons)
const ANDROID_ICONS = [
  { size: 48, folder: 'mipmap-mdpi' },
  { size: 72, folder: 'mipmap-hdpi' },
  { size: 96, folder: 'mipmap-xhdpi' },
  { size: 144, folder: 'mipmap-xxhdpi' },
  { size: 192, folder: 'mipmap-xxxhdpi' },
];

// Splash screen sizes
const SPLASH_SCREENS = [
  // iOS
  { width: 2732, height: 2732, name: 'splash-2732x2732.png' },
  // Android
  { width: 480, height: 800, name: 'splash-port-hdpi.png' },
  { width: 720, height: 1280, name: 'splash-port-xhdpi.png' },
  { width: 1080, height: 1920, name: 'splash-port-xxhdpi.png' },
  { width: 1440, height: 2560, name: 'splash-port-xxxhdpi.png' },
];

async function createBaseIcon() {
  // Create a 1024x1024 icon with cowboy silhouette
  const size = 1024;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f5f5f5"/>
      
      <!-- Cowboy silhouette -->
      <g fill="#555555">
        <!-- Hat brim -->
        <ellipse cx="512" cy="280" rx="180" ry="50"/>
        <!-- Hat top -->
        <rect x="420" y="200" width="184" height="100" rx="10"/>
        
        <!-- Head -->
        <circle cx="512" cy="380" r="70"/>
        
        <!-- Body -->
        <rect x="460" y="450" width="104" height="180" rx="5"/>
        
        <!-- Arms -->
        <rect x="360" y="470" width="100" height="35" rx="5"/>
        <rect x="564" y="470" width="100" height="35" rx="5"/>
        
        <!-- Legs -->
        <rect x="460" y="630" width="40" height="140" rx="5"/>
        <rect x="524" y="630" width="40" height="140" rx="5"/>
        
        <!-- Gun -->
        <rect x="664" y="462" width="50" height="18" rx="3" fill="#777"/>
        <rect x="700" y="445" width="14" height="35" rx="2" fill="#777"/>
      </g>
      
      <!-- Ground line -->
      <line x1="300" y1="770" x2="724" y2="770" stroke="#999" stroke-width="3"/>
      
      <!-- Title -->
      <text x="512" y="920" font-family="Georgia, serif" font-size="90" font-weight="bold" fill="#333" text-anchor="middle">RSB</text>
    </svg>
  `;
  
  return sharp(Buffer.from(svg)).png();
}

async function createSplashScreen(width, height) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f5f5f5"/>
      
      <!-- Centered cowboy -->
      <g transform="translate(${width/2 - 150}, ${height/2 - 200})">
        <g fill="#555555">
          <!-- Hat brim -->
          <ellipse cx="150" cy="60" rx="100" ry="30"/>
          <!-- Hat top -->
          <rect x="90" y="20" width="120" height="60" rx="5"/>
          
          <!-- Head -->
          <circle cx="150" cy="120" r="45"/>
          
          <!-- Body -->
          <rect x="120" y="165" width="60" height="120" rx="3"/>
          
          <!-- Arms -->
          <rect x="60" y="180" width="60" height="22" rx="3"/>
          <rect x="180" y="180" width="60" height="22" rx="3"/>
          
          <!-- Legs -->
          <rect x="120" y="285" width="25" height="90" rx="3"/>
          <rect x="155" y="285" width="25" height="90" rx="3"/>
        </g>
        
        <!-- Ground line -->
        <line x1="30" y1="375" x2="270" y2="375" stroke="#999" stroke-width="2"/>
      </g>
      
      <!-- Title -->
      <text x="${width/2}" y="${height/2 + 280}" font-family="Georgia, serif" font-size="${Math.min(width, height) * 0.05}" font-weight="bold" fill="#333" text-anchor="middle">READY STEADY BANG</text>
      
      <!-- Credits -->
      <text x="${width/2}" y="${height - 50}" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.02}" fill="#999" text-anchor="middle">by BEN MECHA - benmacha.tn</text>
    </svg>
  `;
  
  return sharp(Buffer.from(svg)).png();
}

async function main() {
  const resourcesPath = path.resolve(import.meta.dirname, RESOURCES_DIR);
  
  // Create directories
  const dirs = [
    `${resourcesPath}/icon`,
    `${resourcesPath}/splash`,
    `${resourcesPath}/android/icon`,
    `${resourcesPath}/android/splash`,
    `${resourcesPath}/ios/icon`,
    `${resourcesPath}/ios/splash`,
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  console.log('Generating base icon...');
  const baseIcon = await createBaseIcon();
  
  // Save base icon
  await baseIcon.clone().toFile(`${resourcesPath}/icon/icon-1024.png`);
  console.log('  ✓ icon-1024.png');

  // Generate iOS icons
  console.log('\nGenerating iOS icons...');
  for (const icon of IOS_ICONS) {
    const finalSize = Math.round(icon.size * icon.scale);
    await baseIcon.clone()
      .resize(finalSize, finalSize)
      .toFile(`${resourcesPath}/ios/icon/${icon.name}`);
    console.log(`  ✓ ${icon.name} (${finalSize}x${finalSize})`);
  }

  // Generate Android icons
  console.log('\nGenerating Android icons...');
  for (const icon of ANDROID_ICONS) {
    const folderPath = `${resourcesPath}/android/icon/${icon.folder}`;
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    // Foreground (with padding for adaptive icon)
    await baseIcon.clone()
      .resize(Math.round(icon.size * 0.6), Math.round(icon.size * 0.6))
      .extend({
        top: Math.round(icon.size * 0.2),
        bottom: Math.round(icon.size * 0.2),
        left: Math.round(icon.size * 0.2),
        right: Math.round(icon.size * 0.2),
        background: { r: 245, g: 245, b: 245, alpha: 1 }
      })
      .toFile(`${folderPath}/ic_launcher_foreground.png`);
    
    // Regular icon
    await baseIcon.clone()
      .resize(icon.size, icon.size)
      .toFile(`${folderPath}/ic_launcher.png`);
      
    console.log(`  ✓ ${icon.folder} (${icon.size}x${icon.size})`);
  }

  // Generate splash screens
  console.log('\nGenerating splash screens...');
  for (const splash of SPLASH_SCREENS) {
    const splashImage = await createSplashScreen(splash.width, splash.height);
    await splashImage.toFile(`${resourcesPath}/splash/${splash.name}`);
    console.log(`  ✓ ${splash.name}`);
  }

  console.log('\n✅ All icons and splash screens generated!');
  console.log(`\nResources saved to: ${resourcesPath}`);
}

main().catch(console.error);
