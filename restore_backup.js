import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';
// Configuración
const CONFIG = {
  xmlFile: 'FileSystem.xml',
  // xmlFile: 'FileSystemTest.xml',
  contentDir: 'Content',
  // contentDir: 'ContentTest',
  outputDir: 'Restored'
};

// Crear directorios recursivamente
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Copiar y renombrar archivo
function copyAndRenameFile(contentId, targetPath, modified) {
  const sourceFile = path.join(CONFIG.contentDir, contentId);
  
  if (!fs.existsSync(sourceFile)) {
    console.warn(`⚠️  Archivo no encontrado: ${contentId}`);
    return false;
  }
  
  try {
    fs.copyFileSync(sourceFile, targetPath);
    
    // Restaurar fecha de modificación
    if (modified) {
      try {
        const modifiedDate = parseDate(modified);
        fs.utimesSync(targetPath, modifiedDate, modifiedDate);
      } catch (error) {
        // Fecha inválida, continuar sin error
      }
    }
    return true;
  } catch (error) {
    console.error(`❌ Error copiando ${contentId}: ${error.message}`);
    return false;
  }
}

// Parsear fecha en formato ISO (20120816T091108Z)
function parseDate(dateStr) {
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const hour = dateStr.substring(9, 11);
  const minute = dateStr.substring(11, 13);
  const second = dateStr.substring(13, 15);
  
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
}

// Procesar elemento (puede ser carpeta o archivo)
function processContent(content, currentPath, stats) {
  // Procesar archivos en el nivel actual
  if (content.File) {
    const files = Array.isArray(content.File) ? content.File : [content.File];
    
    files.forEach(file => {
      const fileName = file.$.Name;
      const contentId = file.$['Content-Id'];
      const modified = file.$.Modified;
      const targetPath = path.join(currentPath, fileName);
      
      console.log(`📄 ${fileName}`);
      
      if (copyAndRenameFile(contentId, targetPath, modified)) {
        stats.files++;
      } else {
        stats.errors++;
      }
    });
  }
  
  // Procesar subcarpetas
  if (content.Folder) {
    const folders = Array.isArray(content.Folder) ? content.Folder : [content.Folder];
    
    folders.forEach(folder => {
      const folderName = folder.$.Name;
      const folderPath = path.join(currentPath, folderName);
      
      console.log(`📁 ${folderName}/`);
      ensureDir(folderPath);
      stats.folders++;
      
      // Procesar contenido de la subcarpeta recursivamente
      processContent(folder, folderPath, stats);
    });
  }
}

// Función principal
async function restoreBackup() {
  console.log('🚀 Iniciando restauración de backup...\n');
  
  // Verificar archivos necesarios
  if (!fs.existsSync(CONFIG.xmlFile)) {
    console.error(`❌ No se encuentra: ${CONFIG.xmlFile}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(CONFIG.contentDir)) {
    console.error(`❌ No se encuentra el directorio: ${CONFIG.contentDir}`);
    process.exit(1);
  }
  
  // Leer y parsear XML
  console.log(`📖 Leyendo ${CONFIG.xmlFile}...`);
  const xmlData = fs.readFileSync(CONFIG.xmlFile, 'utf-8');
  
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xmlData);
  
  // Crear directorio de salida
  ensureDir(CONFIG.outputDir);
  
  // Procesar volúmenes
  const volumes = result.FileSystem.Volume;
  const volumeList = Array.isArray(volumes) ? volumes : [volumes];
  
  let totalStats = { folders: 0, files: 0, errors: 0 };
  
  volumeList.forEach(volume => {
    const volumeLocation = volume.$.Location;
    // Limpiar nombre del volumen (quitar \ iniciales y espacios)
    const volumeName = volumeLocation.replace(/^\\+/, '').trim();
    const volumePath = path.join(CONFIG.outputDir, volumeName);
    
    console.log(`\n💾 Volumen: ${volumeName}`);
    console.log(`   Tipo: ${volume.$.Type}\n`);
    
    ensureDir(volumePath);
    
    // Procesar contenido del volumen
    if (volume.Content && volume.Content.length > 0) {
      processContent(volume.Content[0], volumePath, totalStats);
    }
  });
  
  // Resumen final
  console.log('\n✅ Restauración completada!');
  console.log(`   📁 Carpetas: ${totalStats.folders}`);
  console.log(`   📄 Archivos: ${totalStats.files}`);
  if (totalStats.errors > 0) {
    console.log(`   ❌ Errores: ${totalStats.errors}`);
  }
}

// Ejecutar
restoreBackup().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});