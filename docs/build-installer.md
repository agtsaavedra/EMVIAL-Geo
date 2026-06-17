# Build e instalador

Notas tecnicas sobre build, instalador y ubicacion de datos de EMVIAL Geo.

## Scripts

```bash
npm run dev
```

Levanta Vite en `127.0.0.1:5173`.

```bash
npm run electron
```

Levanta Electron apuntando al servidor de desarrollo.

```bash
npm start
```

Ejecuta Vite y Electron en paralelo.

```bash
npm run build
```

Genera el build web en `dist/`.

```bash
npm run dist:win
```

Genera build e instalador Windows con electron-builder.

## Configuracion electron-builder

La configuracion vive en `package.json`, seccion `build`.

Resumen:

```json
{
  "appId": "com.emvial.geo",
  "productName": "EMVIAL Geo",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "electron/**/*",
    "package.json"
  ],
  "win": {
    "target": "nsis",
    "icon": "public/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "deleteAppDataOnUninstall": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "EMVIAL Geo"
  }
}
```

## Archivos incluidos

El instalador incluye:

- `dist/**/*`
- `electron/**/*`
- `package.json`

No incluye automaticamente archivos fuera de esos patrones, salvo que queden
embebidos por Vite dentro de `dist`.

Los datos estaticos servidos desde `public/` deben quedar copiados al build de
Vite. Si se agrega una carpeta nueva de datos, validar que aparezca en `dist`.

## User data

Electron guarda datos persistentes en `app.getPath('userData')`.

En Windows normalmente:

```text
%APPDATA%/EMVIAL Geo/
```

Contenido esperado:

- `emvial.sqlite`
- `config.json`
- `geocoding-cache.json`
- `logs/`
- `backups/` si no se configuro otra carpeta

## Desinstalacion

El instalador tiene:

```json
"deleteAppDataOnUninstall": true
```

Esto significa que al desinstalar se elimina la carpeta `userData`.

Impacto:

- Se borra la base viva.
- Se borra la cache de geocoding.
- Se borran logs.
- Se borran backups si estan dentro de `userData/backups`.

Recomendacion operativa:

- Configurar la carpeta de backups fuera de `userData`.
- Usar una ruta como Documentos, disco compartido o carpeta sincronizada.
- Informar al usuario antes de desinstalar.

## Backups y seguridad

Antes de restaurar o importar datos masivos, la app crea un backup preventivo.

Los backups automaticos se disparan con cambios pendientes y programacion; no en
cada guardado individual. Esto reduce escritura innecesaria y mantiene resguardo
periodico.

## Geocoding

El cache de geocoding esta en:

```text
userData/geocoding-cache.json
```

La app aplica rate limit aproximado y cache local. Para uso intensivo,
multiusuario o despliegues con muchas busquedas, evaluar:

- proveedor geocoding pago;
- instancia propia;
- cache compartido/controlado;
- normalizacion previa de direcciones.

## Pruebas recomendadas del instalador

En una maquina o usuario de prueba:

1. Instalar.
2. Abrir app.
3. Crear intervencion.
4. Crear backup.
5. Cerrar y volver a abrir.
6. Confirmar persistencia.
7. Exportar Excel y GeoJSON.
8. Desinstalar.
9. Confirmar limpieza de `userData`.
10. Confirmar que backups externos se conservan.

## Problemas comunes

### La app instalada abre sin datos

Verificar si se instalo con otro usuario de Windows. `userData` depende del
perfil de usuario.

### No aparecen backups

Revisar en el dialogo Acerca de o menu de backups cual es la carpeta activa.

### La desinstalacion borro la base

Es esperado con `deleteAppDataOnUninstall: true`. Recuperar desde backup externo
si existe.

### Muchas busquedas geograficas fallan

Puede ser rate limit del proveedor o datos sin cache. Reducir ritmo, reutilizar
cache o usar proveedor dedicado.
