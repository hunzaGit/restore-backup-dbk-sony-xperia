# Índice
<!-- TOC start  -->
- [Sony Xperia Backup Restorer](#sony-xperia-backup-restorer)
   * [📖 ¿Por qué existe este proyecto?](#-por-qué-existe-este-proyecto)
      + [El problema técnico](#el-problema-técnico)
   * [🎯 ¿Qué hace este script?](#-qué-hace-este-script)
   * [🔧 Requisitos previos](#-requisitos-previos)
   * [📦 Instalación](#-instalación)
   * [🚀 Preparación del backup](#-preparación-del-backup)
   * [💻 Uso del script](#-uso-del-script)
      + [Uso básico con archivos en el mismo directorio](#uso-básico-con-archivos-en-el-mismo-directorio)
      + [Uso avanzado con rutas personalizadas](#uso-avanzado-con-rutas-personalizadas)
      + [Ver la ayuda del script](#ver-la-ayuda-del-script)
   * [📂 Estructura del resultado](#-estructura-del-resultado)
   * [🔍 Qué hace el script internamente](#-qué-hace-el-script-internamente)
   * [💡 Nota sobre la restauración de datos de aplicaciones](#-nota-sobre-la-restauración-de-datos-de-aplicaciones)
   * [⚠️ Solución de problemas](#-solución-de-problemas)
   * [📄 Licencia](#-licencia)
   * [🤝 Contribuciones](#-contribuciones)
   * [📧 Soporte](#-soporte)

<!-- TOC end -->


# Sony Xperia Backup Restorer

[English](README.md) | Español

Un script de Node.js para restaurar y reconstruir la estructura de archivos de backups `.dbk` antiguos de Sony Xperia creados con Sony PC Companion.

**Importante**: Este script solo restaura el **árbol de directorios original del teléfono**, no la **data ni la información de las aplicaciones**.  
Para más detalles, consulta la sección [💡 Nota sobre la restauración de datos de aplicaciones](#-Nota-sobre-la-restauración-de-datos-de-aplicaciones).

## 📖 ¿Por qué existe este proyecto?

Hace años, los dispositivos Sony Xperia utilizaban una aplicación llamada **Sony PC Companion** para crear backups completos del teléfono. Estos backups se guardaban en archivos con extensión `.dbk`, que contenían todos los datos del dispositivo de forma comprimida y estructurada.

Con el tiempo, Sony descontinuó PC Companion y la aplicación dejó de funcionar en sistemas operativos modernos. Esto dejó a muchos usuarios con backups valiosos que contenían fotos, música, documentos y otros archivos importantes, pero sin una forma sencilla de acceder a ellos.

Aunque existen herramientas comerciales como Amrak PhoneMiner que prometen extraer estos backups, muchas de ellas ya no funcionan correctamente en 2025 o tienen limitaciones significativas.

### El problema técnico

Los archivos `.dbk` son en realidad archivos ZIP disfrazados. Si cambias la extensión de `.dbk` a `.zip` y lo abres con herramientas como 7-Zip en Windows o Keka en macOS, encontrarás el contenido del backup. Sin embargo, aquí surge el verdadero desafío:

Todos los archivos están almacenados en un único directorio llamado `Content`, y cada archivo tiene un nombre críptico basado en un identificador UUID, como `{EC2A94C2-3372-413C-AB83-4B644D2CB0EC}.mp3`. No hay forma de saber qué archivo es cuál ni dónde estaba ubicado originalmente en tu teléfono. Una foto de vacaciones podría llamarse `{A1B2C3D4-...}.jpg` y un documento importante `{E5F6G7H8-...}.pdf`, sin ninguna pista sobre su contenido real.

La clave para resolver este rompecabezas está en un archivo XML llamado `FileSystem.xml`, que también se encuentra dentro del backup. Este archivo contiene un mapa completo de la estructura de directorios original, con los nombres reales de los archivos y una referencia a qué UUID corresponde cada uno.

## 🎯 ¿Qué hace este script?

Este script automatiza el proceso completo de restauración de ficheros del backup. Lee el archivo `FileSystem.xml`, interpreta la estructura de carpetas original de tu teléfono, y luego reconstruye toda esa estructura copiando y renombrando cada archivo del directorio `Content` a su ubicación y nombre correctos.

El resultado es una réplica exacta de cómo estaban organizados tus archivos en el teléfono Sony Xperia, con todos los nombres de archivo originales, la jerarquía de carpetas intacta, e incluso las fechas de modificación restauradas.

## 🔧 Requisitos previos

Para usar este script necesitas tener Node.js instalado en tu sistema. Node.js es un entorno de ejecución de JavaScript que permite ejecutar scripts fuera del navegador. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).

Una vez instalado Node.js, necesitarás instalar una dependencia llamada `xml2js`, que es una biblioteca que ayuda a leer y procesar archivos XML en JavaScript. Esta instalación se hace automáticamente con un solo comando que explicaremos más adelante.

## 📦 Instalación

Primero, descarga o clona este repositorio en tu computadora. Si tienes Git instalado, puedes clonar el repositorio con este comando:

```bash
git clone https://github.com/hunzaGit/restore-backup-dbk-sony-xperia.git
cd restore-backup-dbk-sony-xperia
```

Si no usas Git, simplemente descarga el archivo ZIP del repositorio desde GitHub y extráelo en una carpeta de tu elección.

Una vez que tengas los archivos del proyecto, abre una terminal o línea de comandos en esa carpeta y ejecuta:

```bash
npm install
```

Este comando instalará automáticamente la biblioteca `xml2js` que el script necesita para funcionar.

## 🚀 Preparación del backup

Antes de usar el script, necesitas extraer el contenido de tu archivo `.dbk`. Sigue estos pasos cuidadosamente:

Primero, localiza tu archivo de backup, que tendrá un nombre similar a `backup_2015-08-20.dbk` o algo parecido. Haz una copia de este archivo en una ubicación segura, ya que modificaremos el original.

Ahora viene el truco: cambia la extensión del archivo de `.dbk` a `.zip`. En Windows, si no ves las extensiones de archivo, primero debes habilitarlas yendo a las opciones de carpeta. En macOS, puedes hacer clic derecho sobre el archivo, seleccionar "Obtener información" y cambiar la extensión allí.

Una vez que el archivo se llame `backup_2015-08-20.zip`, ábrelo con tu programa de descompresión favorito. En Windows puedes usar 7-Zip, WinRAR o el descompresor integrado. En macOS puedes usar Keka, The Unarchiver o el descompresor nativo.

Extrae todo el contenido a una carpeta nueva. Dentro encontrarás varios archivos y directorios, pero los que nos interesan son específicamente dos: el directorio llamado `Files/Content` (que contiene todos tus archivos con nombres UUID) y el archivo `Files/FileSystem.xml` (que contiene el mapa de la estructura).

## 💻 Uso del script

El script ofrece flexibilidad total en cuanto a dónde están ubicados tus archivos. No necesitas mover nada al directorio del proyecto.

### Uso básico con archivos en el mismo directorio

Si colocaste el script en el mismo directorio donde extrajiste el backup, simplemente ejecuta:

```bash
node restore-backup.js
```

El script buscará automáticamente `FileSystem.xml` y el directorio `Content` en la ubicación actual, y creará una carpeta llamada `Restored` con todos tus archivos recuperados.

### Uso avanzado con rutas personalizadas

Lo más probable es que quieras mantener tus archivos de backup en su propia ubicación. El script acepta hasta tres parámetros opcionales que puedes especificar en orden:

El primer parámetro es la ruta al archivo `FileSystem.xml`. El segundo parámetro es la ruta al directorio `Content`. El tercer parámetro es la ruta donde quieres que se guarden los archivos restaurados.

Por ejemplo, si extrajiste tu backup en `C:\Backups\Sony\` en Windows, ejecutarías:

```bash
node restore-backup.js "C:\Backups\Sony\FileSystem.xml" "C:\Backups\Sony\Content" "C:\Restaurado"
```

En macOS o Linux, con rutas Unix, sería algo como:

```bash
node restore-backup.js /Users/tu-usuario/Backups/Sony/FileSystem.xml /Users/tu-usuario/Backups/Sony/Content /Users/tu-usuario/Recuperado
```

También puedes usar rutas relativas. Si el backup está en una carpeta llamada `backup` dentro de tu directorio de usuario, podrías ejecutar:

```bash
node restore-backup.js ~/backup/FileSystem.xml ~/backup/Content ~/Restaurado
```

Si solo quieres especificar las rutas de entrada pero usar el directorio de salida predeterminado, simplemente omite el tercer parámetro:

```bash
node restore-backup.js /ruta/al/FileSystem.xml /ruta/al/Content
```

### Ver la ayuda del script

Si en algún momento necesitas recordar cómo usar el script, puedes ejecutar:

```bash
node restore-backup.js --help
```

Esto mostrará un resumen de los parámetros disponibles y ejemplos de uso.

## 📂 Estructura del resultado

Una vez que el script termine de ejecutarse, encontrarás una nueva carpeta (por defecto llamada `Restored`) que contiene la estructura completa de tu backup restaurado.

Dentro verás un directorio con el nombre del volumen de almacenamiento original de tu teléfono, típicamente algo como "Almacenamiento interno". Dentro de este directorio encontrarás la jerarquía completa de carpetas tal como estaba en tu teléfono Sony Xperia.

Por ejemplo, si tu backup contenía música organizada en carpetas por artista, verás algo como esto:

```
Restored/
└── Almacenamiento interno/
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
            └── (tus fotos)
```

Todos los archivos tendrán sus nombres originales restaurados, las fechas de modificación originales preservadas, y estarán organizados exactamente como los tenías en tu teléfono.

## 🔍 Qué hace el script internamente

Para los curiosos que quieran entender cómo funciona el proceso, aquí hay una explicación del flujo de trabajo del script.

Primero, el script lee el archivo `FileSystem.xml` y lo convierte de formato XML a una estructura de datos que JavaScript puede manipular fácilmente. Este XML contiene toda la información sobre la estructura de directorios del teléfono.

Luego, el script recorre el árbol de directorios definido en el XML de forma recursiva. Esto significa que comienza en la raíz y va explorando cada carpeta, y dentro de cada carpeta busca subcarpetas, y así sucesivamente hasta llegar a todos los archivos.

Para cada carpeta que encuentra en el XML, el script crea el directorio correspondiente en tu disco. Para cada archivo que encuentra, el script busca el archivo real en el directorio `Content` usando el Content-Id (el nombre UUID), lo copia a la ubicación correcta en la estructura restaurada, y lo renombra con el nombre original del archivo.

Además, el script parsea las fechas de modificación que están almacenadas en el XML en un formato especial ISO (por ejemplo, `20120816T091108Z` representa el 16 de agosto de 2012 a las 09:11:08 UTC) y las aplica a los archivos copiados para que mantengan sus fechas originales.

Durante todo el proceso, el script muestra información en la consola sobre qué está haciendo, incluyendo cada carpeta que crea y cada archivo que copia. Al final, muestra un resumen con el número total de carpetas creadas, archivos copiados y cualquier error que haya ocurrido.


## 💡 Nota sobre la restauración de datos de aplicaciones

Este proyecto se centra en **restaurar el sistema de ficheros** a partir de un backup creado con **Sony PC Companion**.  
Actualmente **no restaura la información ni los datos de las aplicaciones** incluidas en el respaldo.

Durante la investigación de esta limitación encontré algunos proyectos que afirman poder extraer o manejar la información de las aplicaciones desde los backups `.dbk` de Sony PC Companion.  
No los he probado personalmente, por lo que **no puedo garantizar su funcionamiento ni recomendar su uso**, pero los menciono a modo de referencia por si resultan útiles a otros desarrolladores o usuarios interesados:

- [Extract Data from Sony PC Companion Backup](https://deml.io/blog/extract-data-sony-pc-companion-backup/) — por **Johannes Deml**, basado en un *fork* del proyecto de Nikolay Elenkov.  
  📦 Código fuente: [github.com/JohannesDeml/pc-companion-restore-data](https://github.com/JohannesDeml/pc-companion-restore-data)
- [Android Backup Extractor](https://github.com/nelenkov/android-backup-extractor) — proyecto original de **Nikolay Elenkov**


> Úsese esta información bajo su propia responsabilidad.

## ⚠️ Solución de problemas

Si el script no encuentra el archivo `FileSystem.xml` o el directorio `Content`, verás un mensaje de error claro indicando qué falta. Asegúrate de que las rutas que proporcionaste son correctas y que los archivos existen.

Si ves advertencias sobre archivos no encontrados (por ejemplo, "Archivo no encontrado: {XXXX-...}.mp3"), significa que el XML hace referencia a un archivo que no existe en el directorio Content. Esto puede suceder si el backup está incompleto o corrupto. El script continuará procesando los demás archivos.

Si algunos archivos no se copian correctamente, el script mostrará un mensaje de error específico. Esto puede deberse a problemas de permisos de escritura, falta de espacio en disco, o nombres de archivo problemáticos. Revisa los mensajes de error para identificar el problema específico.

En sistemas Windows, si los nombres de ruta contienen espacios, asegúrate de envolverlos entre comillas dobles. Por ejemplo: `"C:\Mis Documentos\Backup\FileSystem.xml"`.

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT. Esto significa que eres libre de usar, modificar y distribuir este código como desees, incluso para proyectos comerciales, siempre que incluyas el aviso de copyright original.

## 🤝 Contribuciones

Las contribuciones son bienvenidas y apreciadas. Si encuentras un bug, tienes una idea para mejorar el script, o quieres agregar nueva funcionalidad, no dudes en abrir un issue o enviar un pull request en GitHub.

Algunas ideas para futuras mejoras podrían incluir: una interfaz gráfica para usuarios menos técnicos, soporte para otros tipos de backups de Sony, validación de integridad de archivos, o generación de un reporte detallado del proceso de restauración.

## 📧 Soporte

Si tienes problemas usando el script o preguntas sobre cómo recuperar tu backup de Sony Xperia, puedes abrir un issue en el repositorio de GitHub. Intenta incluir la mayor cantidad de detalles posible sobre tu situación, incluyendo el sistema operativo que usas, la versión de Node.js, y cualquier mensaje de error que veas.

---

**Nota importante**: Este script es una herramienta de la comunidad y no está afiliado oficialmente con Sony. Se proporciona "tal cual", sin garantías de ningún tipo. Siempre mantén copias de seguridad de tus datos importantes antes de procesarlos con cualquier herramienta.
