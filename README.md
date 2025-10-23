
# Index
<!-- TOC start -->
- [Sony Xperia Backup Restorer](#sony-xperia-backup-restorer)
   * [📖 Why does this project exist?](#-why-does-this-project-exist)
      + [The technical problem](#the-technical-problem)
   * [🎯 What does this script do?](#-what-does-this-script-do)
   * [🔧 Prerequisites](#-prerequisites)
   * [📦 Installation](#-installation)
   * [🚀 Preparing the backup](#-preparing-the-backup)
   * [💻 Using the script](#-using-the-script)
      + [Basic usage with files in the same directory](#basic-usage-with-files-in-the-same-directory)
      + [Advanced usage with custom paths](#advanced-usage-with-custom-paths)
      + [Viewing script help](#viewing-script-help)
   * [📂 Result structure](#-result-structure)
   * [🔍 What the script does internally](#-what-the-script-does-internally)
   * [💡 Note on restoring application data](#-note-on-restoring-application-data)
   * [⚠️ Troubleshooting](#%EF%B8%8F-troubleshooting)
   * [📄 License](#-license)
   * [🤝 Contributions](#-contributions)
   * [📧 Support](#-support)
<!-- TOC end -->

# Sony Xperia Backup Restorer

English | [Español](README.es.md)

A Node.js script to restore and rebuild the file structure of old Sony Xperia `.dbk` backups created with Sony PC Companion.

**Important**: This script only restores the **original directory tree of the phone**, not the **data or application information**.  
For more details, see the section [💡 Note on restoring application data](#-note-on-restoring-application-data).

## 📖 Why does this project exist?

Years ago, Sony Xperia devices used an application called **Sony PC Companion** to create full backups of the phone. These backups were saved in files with the `.dbk` extension, which contained all the device's data in a compressed and structured form.

Over time, Sony discontinued PC Companion, and the application stopped working on modern operating systems. This left many users with valuable backups containing photos, music, documents, and other important files, but with no easy way to access them.

Although there are commercial tools such as Amrak PhoneMiner that promise to extract these backups, many of them no longer work properly in 2025 or have significant limitations.


### The technical problem

`.dbk` files are actually ZIP files in disguise. If you change the extension from `.dbk` to `.zip` and open it with tools such as 7-Zip on Windows or Keka on macOS, you will find the backup content. However, this is where the real challenge arises:

All files are stored in a single directory called `Content`, and each file has a cryptic name based on a UUID identifier, such as `{EC2A94C2-3372-413C-AB83-4B644D2CB0EC}.mp3`. There is no way to know which file is which or where it was originally located on your phone. A vacation photo might be named `{A1B2C3D4-...}.jpg` and an important document `{E5F6G7H8-...}.pdf`, with no clue as to their actual content.

The key to solving this puzzle lies in an XML file called `FileSystem.xml`, which is also found inside the backup. This file contains a complete map of the original directory structure, with the actual file names and a reference to which UUID each one corresponds to.

## 🎯 What does this script do?

This script automates the entire process of restoring files from the backup. It reads the `FileSystem.xml` file, interprets the original folder structure of your phone, and then reconstructs that entire structure by copying and renaming each file in the `Content` directory to its correct location and name.

The result is an exact replica of how your files were organized on your Sony Xperia phone, with all the original file names, the folder hierarchy intact, and even the modification dates restored.

## 🔧 Prerequisites

To use this script, you need to have Node.js installed on your system. Node.js is a JavaScript runtime environment that allows you to run scripts outside of the browser. You can download it from [nodejs.org](https://nodejs.org/).

Once Node.js is installed, you will need to install a dependency called `xml2js`, which is a library that helps read and process XML files in JavaScript. This installation is done automatically with a single command that we will explain later.

## 📦 Installation

First, download or clone this repository to your computer. If you have Git installed, you can clone the repository with this command:

```bash
git clone https://github.com/hunzaGit/restore-backup-dbk-sony-xperia.git
cd restore-backup-dbk-sony-xperia
```

If you don't use Git, simply download the ZIP file from the repository on GitHub and extract it to a folder of your choice.

Once you have the project files, open a terminal or command line in that folder and run:

```bash
npm install
```

This command will automatically install the `xml2js` library that the script needs to run.

## 🚀 Preparing the backup

Before using the script, you need to extract the contents of your `.dbk` file. Follow these steps carefully:

First, locate your backup file, which will have a name similar to `backup_2015-08-20.dbk` or something similar. Make a copy of this file in a safe location, as we will be modifying the original.

Now comes the trick: change the file extension from `.dbk` to `.zip`. In Windows, if you don't see file extensions, you must first enable them by going to folder options. In macOS, you can right-click on the file, select “Get Info,” and change the extension there.

Once the file is named `backup_2015-08-20.zip`, open it with your favorite decompression program. In Windows, you can use 7-Zip, WinRAR, or the built-in decompressor. In macOS, you can use Keka, The Unarchiver, or the native decompressor.

Extract all the contents to a new folder. Inside, you will find several files and directories, but we are specifically interested in two: the directory called `Files/Content` (which contains all your files with UUID names) and the file `Files/FileSystem.xml` (which contains the structure map).

## 💻 Using the script

The script offers complete flexibility in terms of where your files are located. You don't need to move anything to the project directory.

### Basic usage with files in the same directory

If you placed the script in the same directory where you extracted the backup, simply run:

```bash
node restore-backup.js
```

The script will automatically search for `FileSystem.xml` and the `Content` directory in the current location, and create a folder called `Restored` with all your recovered files.

### Advanced usage with custom paths

You will most likely want to keep your backup files in their own location. The script accepts up to three optional parameters that you can specify in order:

The first parameter is the path to the `FileSystem.xml` file. The second parameter is the path to the `Content` directory. The third parameter is the path where you want the restored files to be saved.

For example, if you extracted your backup to `C:\Backups\Sony\` on Windows, you would run:

```bash
node restore-backup.js “C:\Backups\Sony\FileSystem.xml” “C:\Backups\Sony\Content” “C:\Restored”
```

On macOS or Linux, with Unix paths, it would be something like:

```bash
node restore-backup.js /Users/your-username/Backups/Sony/FileSystem.xml /Users/your-username/Backups/Sony/Content /Users/your-username/Restored
```

You can also use relative paths. If the backup is in a folder called `backup` within your user directory, you could run:

```bash
node restore-backup.js ~/backup/FileSystem.xml ~/backup/Content ~/Restored
```

If you only want to specify the input paths but use the default output directory, simply omit the third parameter:

```bash
node restore-backup.js /path/to/FileSystem.xml /path/to/Content
```

### Viewing script help

If at any time you need to remember how to use the script, you can run:

```bash
node restore-backup.js --help
```

This will display a summary of the available parameters and examples of use.

## 📂 Result structure

Once the script has finished running, you will find a new folder (by default called `Restored`) containing the complete structure of your restored backup.

Inside, you will see a directory with the name of your phone's original storage volume, typically something like “Internal Storage.” Inside this directory, you will find the complete folder hierarchy as it was on your Sony Xperia phone.

For example, if your backup contained music organized into folders by artist, you will see something like this:

```
Restored/
└── Internal Storage/
    ├── Music/
    │   ├── Linkin Park/
    │   │   └── Hybrid Theory/
    │   │       ├── One Step Closer.mp3
    │   │       ├── Crawling.mp3
    │   │       └── In The End.mp3
    │   └── Far from love.mp3
    ├── DJStudio/
    │   ├── airhorn.mp3
    │   └── loop_hiphop.mp3
    └── DCIM/
        └── Camera/
            └── (your photos)
```

All files will have their original names restored, their original modification dates preserved, and will be organized exactly as you had them on your phone.


## 🔍 What the script does internally

For those who are curious about how the process works, here is an explanation of the script's workflow.

First, the script reads the `FileSystem.xml` file and converts it from XML format to a data structure that JavaScript can easily manipulate. This XML contains all the information about the phone's directory structure.

Then, the script recursively traverses the directory tree defined in the XML. This means that it starts at the root and explores each folder, and within each folder it looks for subfolders, and so on until it reaches all the files.

For each folder it finds in the XML, the script creates the corresponding directory on your disk. For each file it finds, the script searches for the actual file in the `Content` directory using the Content-Id (the UUID name), copies it to the correct location in the restored structure, and renames it with the original file name.

In addition, the script parses the modification dates that are stored in the XML in a special ISO format (for example, `20120816T091108Z` represents August 16, 2012, at 09:11:08 UTC) and applies them to the copied files so that they retain their original dates.

Throughout the process, the script displays information in the console about what it is doing, including every folder it creates and every file it copies. At the end, it displays a summary with the total number of folders created, files copied, and any errors that occurred.

## 💡 Note on restoring application data

This project focuses on **restoring the file system** from a backup created with **Sony PC Companion**.  
Currently, it **does not restore the information or data from the applications** included in the backup.

While researching this limitation, I found some projects that claim to be able to extract or manage application information from Sony PC Companion `.dbk` backups.  
I have not tested them personally, so **I cannot guarantee their functionality or recommend their use**, but I mention them for reference in case they are useful to other developers or interested users:

- [Extract Data from Sony PC Companion Backup](https://deml.io/blog/extract-data-sony-pc-companion-backup/) — by Johannes Deml, based on a fork of Nikolay Elenkov's project.  
  📦 Source code: [github.com/JohannesDeml/pc-companion-restore-data](https://github.com/JohannesDeml/pc-companion-restore-data)
- [Android Backup Extractor](https://github.com/nelenkov/android-backup-extractor) — original project by **Nikolay Elenkov**


> Use this information at your own risk.


## ⚠️ Troubleshooting

If the script cannot locate the `FileSystem.xml` file or the `Content` directory, you will see a clear error message indicating what is missing. Ensure that the paths you provided are correct and that the files exist.

If you see warnings about missing files (for example, “File not found: {XXXX-...}.mp3”), it means that the XML references a file that does not exist in the Content directory. This can happen if the backup is incomplete or corrupted. The script will continue processing the other files.

If some files are not copied correctly, the script will display a specific error message. This may be due to write permission issues, lack of disk space, or problematic file names. Check the error messages to identify the specific problem.

On Windows systems, if path names contain spaces, make sure to enclose them in double quotes. For example: `“C:\My Documents\Backup\FileSystem.xml”`.

## 📄 License

This project is open source and available under the MIT license. This means you are free to use, modify, and distribute this code as you wish, even for commercial projects, as long as you include the original copyright notice.

## 🤝 Contributions

Contributions are welcome and appreciated. If you find a bug, have an idea to improve the script, or want to add new functionality, feel free to open an issue or send a pull request on GitHub.

Some ideas for future improvements could include: a graphical interface for less technical users, support for other types of Sony backups, file integrity validation, or generation of a detailed report of the restoration process.

## 📧 Support

If you have problems using the script or questions about how to recover your Sony Xperia backup, you can open an issue in the GitHub repository. Try to include as many details as possible about your situation, including the operating system you are using, the version of Node.js, and any error messages you see.

---

**Important note**: This script is a community tool and is not officially affiliated with Sony. It is provided “as is,” without warranty of any kind. Always keep backups of your important data before processing it with any tool.
