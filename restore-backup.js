import fs from 'fs'
import path from 'path'
import xml2js from 'xml2js'

// Configuration from command line arguments
const args = process.argv.slice(2)
const CONFIG = {
    xmlFile: args[0] || 'FileSystem.xml',
    contentDir: args[1] || 'Content',
    outputDir: args[2] || 'Restored',
}

// Display help if requested
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node restore-backup.js [xmlFile] [contentDir] [outputDir]

Parameters:
  xmlFile     Path to the FileSystem.xml file (default: FileSystem.xml)
  contentDir  Path to the Content directory (default: Content)
  outputDir   Output directory (default: Restored)

Examples:
  node restore-backup.js
  node restore-backup.js /backup/FileSystem.xml /backup/Content
  node restore-backup.js ./data/FileSystem.xml ./data/Content ./output
  `)
    process.exit(0)
}

// Create directories recursively
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true})
    }
}

// Copy and rename file
function copyAndRenameFile(contentId, targetPath, modified) {
    const sourceFile = path.join(CONFIG.contentDir, contentId)

    if (!fs.existsSync(sourceFile)) {
        console.warn(`⚠️  File not found: ${contentId}`)
        return false
    }

    try {
        fs.copyFileSync(sourceFile, targetPath)

        // Restore modification date
        if (modified) {
            try {
                const modifiedDate = parseDate(modified)
                fs.utimesSync(targetPath, modifiedDate, modifiedDate)
            } catch (error) {
                // Invalid date, continue without error
            }
        }
        return true
    } catch (error) {
        console.error(`❌ Error copying ${contentId}: ${error.message}`)
        return false
    }
}

// Parse date in ISO format (20120816T091108Z)
function parseDate(dateStr) {
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    const hour = dateStr.substring(9, 11)
    const minute = dateStr.substring(11, 13)
    const second = dateStr.substring(13, 15)

    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`)
}

//  Process item (can be a folder or file)
function processContent(content, currentPath, stats) {
    // Process files at the current level
    if (content.File) {
        const files = Array.isArray(content.File) ? content.File : [content.File]

        files.forEach(file => {
            const fileName = file.$.Name
            const contentId = file.$['Content-Id']
            const modified = file.$.Modified
            const targetPath = path.join(currentPath, fileName)

            console.log(`📄 ${fileName}`)

            if (copyAndRenameFile(contentId, targetPath, modified)) {
                stats.files++
            } else {
                stats.errors++
            }
        })
    }

    // Process subfolders
    if (content.Folder) {
        const folders = Array.isArray(content.Folder) ? content.Folder : [content.Folder]

        folders.forEach(folder => {
            const folderName = folder.$.Name
            const folderPath = path.join(currentPath, folderName)

            console.log(`📁 ${folderName}/`)
            ensureDir(folderPath)
            stats.folders++

            // Process contents of subfolder recursively
            processContent(folder, folderPath, stats)
        })
    }
}

// Primary function
async function restoreBackup() {
    console.log('🚀 Starting backup restoration...\n')

    // Check necessary files
    if (!fs.existsSync(CONFIG.xmlFile)) {
        console.error(`❌ Not found: ${CONFIG.xmlFile}`)
        process.exit(1)
    }

    if (!fs.existsSync(CONFIG.contentDir)) {
        console.error(`❌ Directory not found: ${CONFIG.contentDir}`)
        process.exit(1)
    }

    // Reading and parsing XML
    console.log(`📖 Reading ${CONFIG.xmlFile}...`)
    const xmlData = fs.readFileSync(CONFIG.xmlFile, 'utf-8')

    const parser = new xml2js.Parser()
    const result = await parser.parseStringPromise(xmlData)

    // Create output directory
    ensureDir(CONFIG.outputDir)

    // Process volumes
    const volumes = result.FileSystem.Volume
    const volumeList = Array.isArray(volumes) ? volumes : [volumes]

    let totalStats = {folders: 0, files: 0, errors: 0}

    volumeList.forEach(volume => {
        const volumeLocation = volume.$.Location
        // Clean volume name (remove initials and spaces)
        const volumeName = volumeLocation.replace(/^\\+/, '').trim()
        const volumePath = path.join(CONFIG.outputDir, volumeName)

        console.log(`\n💾 Volume: ${volumeName}`)
        console.log(`   Type: ${volume.$.Type}\n`)

        ensureDir(volumePath)

        // Process volume contents
        if (volume.Content && volume.Content.length > 0) {
            processContent(volume.Content[0], volumePath, totalStats)
        }
    })

    // Final summary
    console.log('\n✅ Restoration complete!')
    console.log(`   📁 Folders: ${totalStats.folders}`)
    console.log(`   📄 Files: ${totalStats.files}`)
    if (totalStats.errors > 0) {
        console.log(`   ❌ Errors: ${totalStats.errors}`)
    }
}

// Execute
restoreBackup().catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
})
