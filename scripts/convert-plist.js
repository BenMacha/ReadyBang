#!/usr/bin/env node

/**
 * Convertit les fichiers .plist (format Cocos2D/TexturePacker) en JSON (format Phaser)
 */

import fs from 'fs';
import path from 'path';
import plist from 'plist';

const ASSETS_DIR = '../decompiled/apk_extracted/assets';
const OUTPUT_DIR = '../game/public/assets/spritesheets';

// Parse Cocos2D frame format to Phaser format
function parseFrame(frameName, frameData, metadata) {
  // Cocos2D format: {{x, y}, {w, h}}
  const parseRect = (str) => {
    const matches = str.match(/\{?\{(\d+),\s*(\d+)\},\s*\{(\d+),\s*(\d+)\}\}?/);
    if (matches) {
      return {
        x: parseInt(matches[1]),
        y: parseInt(matches[2]),
        w: parseInt(matches[3]),
        h: parseInt(matches[4])
      };
    }
    return null;
  };

  const parseSize = (str) => {
    const matches = str.match(/\{(\d+),\s*(\d+)\}/);
    if (matches) {
      return { w: parseInt(matches[1]), h: parseInt(matches[2]) };
    }
    return null;
  };

  const parseOffset = (str) => {
    const matches = str.match(/\{(-?\d+),\s*(-?\d+)\}/);
    if (matches) {
      return { x: parseInt(matches[1]), y: parseInt(matches[2]) };
    }
    return { x: 0, y: 0 };
  };

  const textureRect = parseRect(frameData.textureRect || frameData.frame);
  const sourceSize = parseSize(frameData.spriteSourceSize || frameData.sourceSize);
  const offset = parseOffset(frameData.spriteOffset || frameData.offset || '{0, 0}');

  if (!textureRect) {
    console.warn(`  Could not parse frame: ${frameName}`);
    return null;
  }

  return {
    frame: {
      x: textureRect.x,
      y: textureRect.y,
      w: textureRect.w,
      h: textureRect.h
    },
    rotated: frameData.textureRotated || false,
    trimmed: frameData.spriteTrimmed || false,
    spriteSourceSize: {
      x: offset.x,
      y: offset.y,
      w: textureRect.w,
      h: textureRect.h
    },
    sourceSize: sourceSize || { w: textureRect.w, h: textureRect.h }
  };
}

function convertPlistToJson(plistPath) {
  const content = fs.readFileSync(plistPath, 'utf8');
  const data = plist.parse(content);

  const baseName = path.basename(plistPath, '.plist');
  const frames = {};

  // Parse frames
  if (data.frames) {
    for (const [frameName, frameData] of Object.entries(data.frames)) {
      const parsed = parseFrame(frameName, frameData, data.metadata);
      if (parsed) {
        frames[frameName] = parsed;
      }
    }
  }

  // Parse metadata for texture size
  let textureSize = { w: 512, h: 512 };
  if (data.metadata && data.metadata.size) {
    const matches = data.metadata.size.match(/\{(\d+),\s*(\d+)\}/);
    if (matches) {
      textureSize = { w: parseInt(matches[1]), h: parseInt(matches[2]) };
    }
  }

  return {
    frames,
    meta: {
      app: 'plist-to-phaser-converter',
      version: '1.0',
      image: `${baseName}.png`,
      format: 'RGBA8888',
      size: textureSize,
      scale: 1
    }
  };
}

function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Find all plist files
  const assetsPath = path.resolve(import.meta.dirname, ASSETS_DIR);
  const files = fs.readdirSync(assetsPath).filter(f => f.endsWith('.plist') && !f.includes('-hd'));

  console.log(`Found ${files.length} plist files to convert`);

  for (const file of files) {
    const plistPath = path.join(assetsPath, file);
    const baseName = path.basename(file, '.plist');
    
    // Skip non-spritesheet plists
    if (['levels', 'rsbang', 'Info', 'GKAchievements', 'GKLeaderboards'].includes(baseName)) {
      continue;
    }

    try {
      console.log(`Converting: ${file}`);
      const json = convertPlistToJson(plistPath);
      
      // Write JSON
      const jsonPath = path.join(path.resolve(import.meta.dirname, OUTPUT_DIR), `${baseName}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));

      // Copy corresponding PNG
      const pngSrc = path.join(assetsPath, `${baseName}.png`);
      const pngDest = path.join(path.resolve(import.meta.dirname, OUTPUT_DIR), `${baseName}.png`);
      if (fs.existsSync(pngSrc)) {
        fs.copyFileSync(pngSrc, pngDest);
      }
      
      console.log(`  → ${Object.keys(json.frames).length} frames`);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }

  console.log('Done!');
}

main();
