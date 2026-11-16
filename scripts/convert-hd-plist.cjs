const fs = require('fs');
const path = require('path');
const plist = require('plist');

const assetsDir = path.join(__dirname, '../decompiled/apk_extracted/assets');
const outputDir = path.join(__dirname, '../game/public/assets/spritesheets');

// Lire tous les fichiers plist HD
const plistFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('-hd.plist'));

console.log(`Found ${plistFiles.length} HD plist files`);

function parseRect(str) {
  // Parse "{{x, y}, {w, h}}" format
  const matches = str.match(/\{\{(\d+),\s*(\d+)\},\s*\{(\d+),\s*(\d+)\}\}/);
  if (matches) {
    return {
      x: parseInt(matches[1]),
      y: parseInt(matches[2]),
      w: parseInt(matches[3]),
      h: parseInt(matches[4])
    };
  }
  return null;
}

function parsePoint(str) {
  // Parse "{x, y}" format
  const matches = str.match(/\{(-?\d+),\s*(-?\d+)\}/);
  if (matches) {
    return {
      x: parseInt(matches[1]),
      y: parseInt(matches[2])
    };
  }
  return null;
}

function parseSize(str) {
  // Parse "{w, h}" format
  const matches = str.match(/\{(\d+),\s*(\d+)\}/);
  if (matches) {
    return {
      w: parseInt(matches[1]),
      h: parseInt(matches[2])
    };
  }
  return null;
}

plistFiles.forEach(plistFile => {
  const plistPath = path.join(assetsDir, plistFile);
  const baseName = plistFile.replace('-hd.plist', '');
  
  try {
    const plistContent = fs.readFileSync(plistPath, 'utf8');
    const data = plist.parse(plistContent);
    
    if (!data.frames) {
      console.log(`Skipping ${plistFile} - no frames`);
      return;
    }
    
    // Get metadata size
    let metaSize = { w: 1024, h: 1024 };
    if (data.metadata && data.metadata.size) {
      metaSize = parseSize(data.metadata.size) || metaSize;
    }
    
    // Convert to Phaser JSON format
    const phaserJson = {
      frames: {},
      meta: {
        image: `${baseName}.png`,
        format: 'RGBA8888',
        size: metaSize,
        scale: '1'
      }
    };
    
    let frameCount = 0;
    
    Object.keys(data.frames).forEach(frameName => {
      const frame = data.frames[frameName];
      
      // Format 3 uses textureRect, spriteSize, spriteSourceSize, spriteOffset
      let textureRect = null;
      let spriteSize = null;
      let spriteSourceSize = null;
      let spriteOffset = null;
      let rotated = false;
      
      if (frame.textureRect) {
        textureRect = parseRect(frame.textureRect);
      }
      if (frame.spriteSize) {
        spriteSize = parseSize(frame.spriteSize);
      }
      if (frame.spriteSourceSize) {
        spriteSourceSize = parseSize(frame.spriteSourceSize);
      }
      if (frame.spriteOffset) {
        spriteOffset = parsePoint(frame.spriteOffset);
      }
      if (frame.textureRotated !== undefined) {
        rotated = frame.textureRotated === true;
      }
      
      if (textureRect) {
        const w = rotated ? textureRect.h : textureRect.w;
        const h = rotated ? textureRect.w : textureRect.h;
        
        // Calculate spriteSourceSize position
        let ssX = 0, ssY = 0;
        if (spriteSourceSize && spriteOffset) {
          ssX = Math.floor((spriteSourceSize.w - w) / 2 + spriteOffset.x);
          ssY = Math.floor((spriteSourceSize.h - h) / 2 - spriteOffset.y);
        }
        
        phaserJson.frames[frameName] = {
          frame: {
            x: textureRect.x,
            y: textureRect.y,
            w: textureRect.w,
            h: textureRect.h
          },
          rotated: rotated,
          trimmed: frame.spriteTrimmed === true,
          spriteSourceSize: {
            x: ssX,
            y: ssY,
            w: w,
            h: h
          },
          sourceSize: spriteSourceSize || { w: w, h: h }
        };
        frameCount++;
      }
    });
    
    // Write JSON
    const jsonPath = path.join(outputDir, `${baseName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(phaserJson, null, 2));
    console.log(`Converted: ${baseName}.json (${frameCount} frames)`);
    
  } catch (err) {
    console.error(`Error converting ${plistFile}:`, err.message);
  }
});

console.log('Done!');
