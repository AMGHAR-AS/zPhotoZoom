# Analyse du Fonctionnement de zPhotoZoom

## Vue d'Ensemble

**zPhotoZoom** est une bibliothèque TypeScript moderne et légère (~15KB minifié + gzippé) pour créer des visionneuses d'images interactives avec support du zoom. Elle offre une expérience fluide à 60fps grâce aux transformations GPU-accélérées.

### Caractéristiques Principales

- ✅ Zoom à la molette de souris
- ✅ Pinch-to-zoom tactile (mobile)
- ✅ Double-clic pour zoomer
- ✅ Drag-to-pan (glisser pour déplacer)
- ✅ Responsive (repositionnement automatique au resize)
- ✅ Zéro dépendance externe
- ✅ Support multi-instances

---

## Architecture Générale

### Structure du Code

Le code est organisé en plusieurs sections :

```
src/zphotozoom.ts (1488 lignes)
├── Injection CSS (lignes 17-105)
├── Définitions de Types TypeScript (lignes 107-227)
├── Fonctions Utilitaires (lignes 229-330)
├── Fonctions de Gestion du Viewer (lignes 332-1276)
└── Classe zPhotoZoom (lignes 1278-1413)
```

---

## Composants Clés

### 1. Injection de Styles CSS

**Fonction:** `injectStyles()` (lignes 17-105)

**Rôle:** Injecte dynamiquement les styles CSS dans le `<head>` du document au premier chargement.

**Styles Inclus:**
- `.ZPhotoZoom` : Conteneur en plein écran avec fond semi-transparent
- `.ZPhotoZoom img` : Image avec curseur grab/grabbing
- `.ZPhotoZoom span` : Indicateur de zoom (ex: "150%")
- `.ZPhotoZoom zloader` : Animation de chargement (spinner)
- `@keyframes zPhotoZoomSpin` : Animation de rotation pour le loader

**Détails Techniques:**
```typescript
// Vérifie si les styles sont déjà présents
if (document.getElementById('z-photo-zoom-styles')) return;

// Crée et injecte le <style>
const styleElement = document.createElement('style');
styleElement.id = 'z-photo-zoom-styles';
document.head.appendChild(styleElement);
```

---

### 2. Système de Types TypeScript

**Types Principaux:**

#### `zPhotoZoomOptions`
Options de configuration passées au constructeur:
```typescript
interface zPhotoZoomOptions {
  el: string;                    // Sélecteur CSS des images
  container?: HTMLElement;       // Conteneur optionnel (mode embedded)
  min?: number;                  // Limite min de zoom (défaut: 0.3)
  max?: number;                  // Limite max de zoom (défaut: 5)
}
```

#### `ProcessState`
État interne de l'instance (propriété privée `_process`):
```typescript
interface ProcessState {
  preview: PreviewContainer | null | false;     // Conteneur viewer
  loader: HTMLElement | null | false;           // Élément loader
  eventsOpen: ViewerEventCallback[];            // Callbacks onOpen
  eventsClose: ViewerEventCallback[];           // Callbacks onClose
  images: ImageData[];                          // Images initialisées
  flags: ViewerFlags;                           // Drapeaux d'état
  container?: HTMLElement;                      // Conteneur (si embedded)
  scaleLimit: { min: number; max: number };    // Limites zoom
  selector: string;                             // Sélecteur CSS
  context: Document;                            // Contexte document
  currentImage: CurrentImage | null;            // Image actuellement affichée
}
```

#### `ViewerFlags`
Drapeaux pour gérer les états d'animation et d'interaction:
```typescript
interface ViewerFlags {
  isAnimated: boolean;        // Animation en cours
  isMoved: boolean;           // Image déplacée
  wheel: number | false;      // Timer wheel zoom
  movements: number;          // Compteur mouvements (touch)
  updateAttempt: number | false;  // Timer tentative update
  updated: boolean;           // Update effectuée
  zoomIn: boolean;           // Direction zoom (touch)
  loader: number | false;    // Timer loader
  stoped: boolean;           // Interactions stoppées (typo originale préservée!)
}
```

---

### 3. Fonctions Utilitaires

#### `imageProportion()` (lignes 242-251)
**Rôle:** Charge une image et récupère ses dimensions naturelles.

```typescript
function imageProportion(
  image: string,
  callback: (width: number, height: number) => void
): void {
  const img = new Image();
  img.onload = function() {
    callback.call(this, this.width, this.height);
  };
  img.src = image;
}
```

#### `centerImage()` (lignes 256-308)
**Rôle:** Calcule la position et l'échelle optimales pour centrer une image dans son conteneur.

**Algorithme:**
1. Calcule les nouvelles dimensions selon l'orientation (landscape/portrait)
2. Pour paysage: 80% de la largeur du conteneur
3. Pour portrait: 90% de la hauteur du conteneur avec ajustement selon ratio
4. Calcule l'échelle initiale
5. Valide les limites min/max de zoom
6. Retourne position (x,y), dimensions, et échelle

**Retourne:**
```typescript
{
  width: number,      // Largeur calculée
  height: number,     // Hauteur calculée
  x: number,          // Position X (centrée)
  y: number,          // Position Y (centrée)
  scale: number,      // Échelle initiale
  min: number,        // Limite min validée
  max: number         // Limite max validée
}
```

#### `calculateNewCenter()` (lignes 313-330)
**Rôle:** Calcule le centre géométrique de plusieurs curseurs (pour pinch-to-zoom).

```typescript
function calculateNewCenter(cursors: Point[]): Point {
  if (cursors.length === 1) {
    return { x: cursors[0].x, y: cursors[0].y };
  }
  // Moyenne des positions X et Y
  return {
    x: cursorsCopy.map(c => c.x).reduce((a,b) => a+b) / length,
    y: cursorsCopy.map(c => c.y).reduce((a,b) => a+b) / length
  };
}
```

---

### 4. Gestion du Viewer

#### `getContainerTarget()` (lignes 598-631)
**Rôle:** Obtient les dimensions et la position du conteneur (viewport ou embedded).

**Important:** Calcule les centres `cx` et `cy` utilisés pour le centrage des images.

```typescript
// Mode embedded
if (container) {
  const nf = container.getBoundingClientRect();
  return {
    width, height, top, left,
    cx: left + width/2,    // Centre X
    cy: top + height/2     // Centre Y
  };
}
// Mode fullscreen
else {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    cx: window.innerWidth/2,
    cy: window.innerHeight/2
  };
}
```

#### `getContainerPreview()` (lignes 450-519)
**Rôle:** Crée le conteneur viewer avec ses gestionnaires d'événements.

**Structure Retournée:**
```typescript
{
  container: HTMLElement,          // Le conteneur DOM
  apply: () => void,              // Ajoute le conteneur au DOM
  evener: (remove?: boolean) => void  // Gère les event listeners
}
```

**Événements Gérés:**
- `mousedown`: Démarre l'interaction (clic bouton gauche uniquement)
- `mousemove`: Détecte le mouvement
- `mouseup`: Ferme le viewer si clic sans mouvement sur le fond

**Note Importante:** Les event listeners sont ajoutés avec un délai de 100ms via `setTimeout()` pour éviter les conflits avec les événements de l'image.

#### `openViewer()` (lignes 525-592)
**Rôle:** Ouvre le viewer pour une image donnée.

**Séquence d'Exécution:**
1. Déclenche les callbacks `onOpen` (avec preventDefault/stopPropagation)
2. Crée le conteneur preview via `getContainerPreview()`
3. Si image déjà chargée:
   - Ajoute l'imageNode au conteneur
   - Calcule le centrage via `centerImage()`
   - Applique l'échelle initiale
4. Sinon: Affiche le loader
5. **Critique:** Appelle `preview.apply()` puis `preview.evener()` pour initialiser
6. Initialise `currentImage` avec:
   - Référence à l'ImageData
   - Fonctions `width()` et `height()` pour obtenir les dimensions actuelles
   - Position, échelle, centre (utilisant `nfc.cx` et `nfc.cy`)
7. Si chargée: Active les event listeners de l'image

#### `closeViewer()` (lignes 339-388)
**Rôle:** Ferme le viewer.

**Séquence:**
1. Déclenche callbacks `onClose`
2. Réinitialise tous les flags (préserve `stoped`)
3. Supprime les event listeners de l'image
4. Retire l'imageNode du DOM
5. Nettoie les timers (loader, etc.)
6. Réinitialise `preview` et `loader` à `false`

---

### 5. Gestion des Événements d'Image

#### `initImageEvents()` (lignes 637-849)
**Rôle:** Fonction complexe qui initialise tous les gestionnaires d'événements pour une image dans le viewer.

**Variables d'État:**
```typescript
let fingers = 0;                    // Nombre de doigts (touch)
let pointA: Point[] | null = null;  // Positions curseurs précédentes
let interaction = false;            // Interaction en cours
let dragInteraction = false;        // Drag détecté
let lastTimeClick: number | null;   // Timestamp dernier clic
```

**Fonctions Internes:**

##### `getCursorsPositions()` (lignes 649-666)
Convertit les positions de curseurs (souris/touch) en coordonnées relatives au conteneur:
```typescript
// Prend en compte le scroll et la position du conteneur
posTop = nfc.top + scrollTop;
posLeft = nfc.left + scrollLeft;

positions.push({
  x: cursors[i].pageX - posLeft,
  y: cursors[i].pageY - posTop
});
```

##### `isDoubleClick()` (lignes 671-684)
Détecte le double-clic (< 320ms entre deux clics):
```typescript
if (time - lastTimeClick < 320) {
  doubleClickZoom.call(thisInstance, pointA[0]);
  // ... cleanup
}
```

##### `clickEvent()` (lignes 705-720)
Gère mousedown et touchstart:
- Souris: Vérifie bouton gauche (button === 0)
- Touch: Enregistre le nombre de doigts
- Capture les positions initiales dans `pointA`

##### `wheelEvent()` (lignes 725-735)
Gère le zoom à la molette:
```typescript
let factor = 1;
if (e.deltaY < 0) factor = -1;  // Zoom in ou out
wheelZoom.call(thisInstance, cursorPos, factor);
```

##### `mouseMove()` / `touchMove()` (lignes 739-782)
Gèrent les mouvements:
- Détectent le drag
- Appellent `drag()` pour le déplacement
- Pour touch: Gèrent le pinch-to-zoom si >= 2 doigts

##### `clickUp()` / `touchEnd()` (lignes 787-822)
Gèrent la fin d'interaction:
- Vérifient le double-clic
- Nettoient les variables d'état
- Réinitialisent les compteurs

**Retourne:**
```typescript
{
  remove: () => void,  // Supprime tous les event listeners
  apply: () => void    // Ajoute tous les event listeners
}
```

**Event Listeners Ajoutés:**
- `wheel` : Zoom molette (passive: false)
- `mousedown` : Début clic (passive: false)
- `touchstart` : Début touch (passive: false)
- `mousemove` : Mouvement souris
- `touchmove` : Mouvement touch (passive: false)
- `mouseup` : Fin clic (capture: true)
- `touchend` : Fin touch (capture: true)

---

### 6. Fonctions de Zoom et Déplacement

#### `drag()` (lignes 854-866)
**Rôle:** Déplace l'image suivant le mouvement du curseur.

```typescript
function drag(pointA: Point, pointB: Point): void {
  if (!flags.movements && !flags.isAnimated) {
    flags.isMoved = true;
    currentImage.x += pointB.x - pointA.x;  // Déplacement relatif
    currentImage.y += pointB.y - pointA.y;

    // Applique la transformation
    updateScaleImage(factor, {
      x: currentImage.x / factor,
      y: currentImage.y / factor
    }, false);
  }
}
```

#### `wheelZoom()` (lignes 871-903)
**Rôle:** Gère le zoom à la molette de souris.

**Algorithme:**
1. Vérifie si update possible (pas d'updateAttempt ni stoped)
2. Modifie l'échelle par incréments de 0.05
3. Applique les limites min/max
4. Calcule le nouvel offset pour zoomer vers le curseur:
   ```typescript
   currentImage.x -= (newFactor/oldFactor - 1) * (cursor.x - imgLeft)
   currentImage.y -= (newFactor/oldFactor - 1) * (cursor.y - imgTop)
   ```
5. Applique via `updateScaleImage()`
6. Mémorise la position du curseur
7. Définit un timer de 600ms pour éviter les updates trop fréquents

#### `doubleClickZoom()` (lignes 909-932)
**Rôle:** Gère le zoom par double-clic.

**Comportement:**
- Si échelle <= échelle origine: Zoom avant (+2 sur l'échelle) vers le point cliqué
- Sinon: Restaure l'état d'origine via `restoreOriginStatus()`

**Important:** Fonction qui était complètement absente dans certaines versions bugguées!

#### `touchZoom()` (lignes 963-1020)
**Rôle:** Gère le pinch-to-zoom sur écrans tactiles.

**Algorithme:**
1. Calcule la distance entre deux doigts (avant/après):
   ```typescript
   function distance(a, b) {
     return Math.sqrt((a.x-b.x)² + (a.y-b.y)²)
   }
   scale = distance(touchB) / distance(touchA)
   ```
2. Détecte la direction du zoom (in/out) via flag `zoomIn`
3. Applique l'échelle avec limites min/max
4. Calcule le nouveau centre entre les doigts
5. Ajuste les offsets x/y pour zoomer vers ce centre
6. Throttle les updates (flag `updated` + setTimeout)
7. Incrémente le compteur `movements`

**Note:** N'applique le déplacement qu'après le 2ème mouvement pour stabiliser le geste.

#### `restoreOriginStatus()` (lignes 938-958)
**Rôle:** Restaure l'image à son état d'origine (position, échelle initiale).

```typescript
function restoreOriginStatus(): void {
  currentImage.scale = origin.scale;
  currentImage.factor = origin.scale;
  currentImage.x = origin.x;
  currentImage.y = origin.y;
  currentImage.minScale = origin.min;
  currentImage.maxScale = origin.max;

  // Centre sur le centre du conteneur
  const nfc = getContainerTarget().nf;
  currentImage.center = { x: nfc.cx, y: nfc.cy };

  updateScaleImage(factor, translate, true); // Avec animation
}
```

---

### 7. Mise à Jour Visuelle

#### `updateScaleImage()` (lignes 1025-1073)
**Rôle:** Applique les transformations CSS pour afficher le zoom et la position.

**Séquence:**
1. Vérifie qu'aucune animation n'est en cours
2. Marque `isAnimated = true`
3. Affiche le loader avec le pourcentage de zoom:
   ```typescript
   let text = Math.round(factor * 100);  // Ex: 150
   showLoader(text + '%', 800);          // "150%"
   ```
4. Applique les transformations via `setTimeout()`:
   ```typescript
   // 3D (moderne)
   transform = 'scale3d(factor, factor, 1) translate3d(x, y, 0)'

   // 2D (fallback)
   transform = 'scale(factor, factor) translate(x, y)'
   ```
5. Gère la transition CSS:
   - Avec animation: transition pendant 500ms
   - Sans animation: pas de transition (drag fluide)
6. Définit `transform-origin: top left` (important!)
7. Applique sur tous les préfixes: `-webkit-`, `-moz-`, `-ms-`, `-o-`
8. Réinitialise `isAnimated` et `isMoved` via timers

**Note GPU:** L'utilisation de `scale3d` et `translate3d` active l'accélération GPU pour des performances optimales.

---

### 8. Gestion des Images

#### `getImages()` (lignes 1078-1157)
**Rôle:** Récupère et initialise toutes les images correspondant au sélecteur.

**Processus:**
1. Sélectionne les éléments via `querySelectorAll()`:
   ```typescript
   // Optimisation: querySelectorAll uniquement si sélecteur complexe
   if (/\s+[^#]|>|\[|\.|,/.test(selector)) {
     nodes = context.querySelectorAll(selector);
   } else {
     nodes = [context.querySelector(selector)];
   }
   ```

2. Pour chaque élément:
   - Extrait l'URL de l'image:
     - `<img>`: Utilise `src`
     - Autres: Extrait de `background-image` via regex
   - Crée un objet `ImageData`:
     ```typescript
     {
       node: HTMLElement,           // Élément DOM
       src: string,                 // URL image
       imageNode?: HTMLImageElement, // Image chargée
       loaded?: boolean,            // État chargement
       width?: number,              // Dimensions
       height?: number,
       prop?: number,               // Ratio (width/height)
       landscape?: boolean,         // Orientation
       evener?: ImageEventManager   // Gestionnaires événements
     }
     ```

3. Appelle `treat()` pour chaque image:
   - Charge l'image via `imageProportion()`
   - Calcule les propriétés (dimensions, ratio, orientation)
   - Initialise les event listeners via `initImageEvents()`
   - Si le viewer est ouvert et c'est l'image courante:
     - Ajoute au conteneur
     - Calcule le centrage
     - Applique l'état initial

**Retourne:** Array de `ImageData[]`

#### `initViewerEvent()` (lignes 1162-1196)
**Rôle:** Ajoute les event listeners sur l'élément d'origine pour ouvrir le viewer.

**Événements:**
- `click`: Ouvre le viewer (souris)
- `touchstart`: Détecte le début du touch
- `touchmove`: Détecte le mouvement (évite ouverture si scroll)
- `touchend`: Ouvre le viewer si pas de mouvement

**Mécanisme:**
```typescript
let click = false;
let moved = false;

touchstart -> click = true
touchmove -> if (click) moved = true
touchend -> if (!moved) openViewer()
```

#### `initImages()` (lignes 1201-1210)
**Rôle:** Récupère et initialise toutes les images.

```typescript
function initImages(): void {
  process.images = getImages();

  if (process.images.length > 0) {
    for (let i = 0; i < process.images.length; i++) {
      initViewerEvent(process.images[i]);
    }
  }
}
```

---

### 9. Gestion du Loader

#### `showLoader()` (lignes 393-421)
**Rôle:** Affiche un indicateur de chargement ou de zoom.

**Comportements:**
- Si `text` fourni: Affiche `<SPAN>` avec le texte (ex: "150%")
- Sinon: Affiche `<ZLOADER>` (spinner animé)
- Si `timeout` fourni: Programme la disparition via `hideLoader()`

```typescript
if (text) {
  loader = document.createElement('SPAN');
  loader.innerText = ' ' + text;
} else {
  loader = document.createElement('ZLOADER');
}

loader.style.opacity = '1';
preview.container.appendChild(loader);
```

#### `hideLoader()` (lignes 426-444)
**Rôle:** Cache le loader avec transition après un délai.

```typescript
loader.style.transition = 'opacity ' + timeout + 'ms';

flags.loader = setTimeout(() => {
  preview.container.removeChild(loader);
  loader = false;
  flags.loader = false;
}, timeout);
```

---

### 10. Classe zPhotoZoom

#### Constructeur (lignes 1297-1313)
**Rôle:** Initialise une nouvelle instance du viewer.

**Séquence:**
1. Injecte les styles CSS via `injectStyles()`
2. Vérifie l'appel avec `new` (erreur sinon)
3. Appelle `applyProcess()` pour créer `_process`
4. Si `options.el` fourni: Appelle `initialize()`

```typescript
constructor(object?: zPhotoZoomOptions, context?: Document) {
  injectStyles();

  if (!(this instanceof zPhotoZoom)) {
    return console.error('Must use new keyword');
  }

  if (object && typeof object === 'object') {
    applyProcess.call(this, object, context);

    if (typeof object.el === 'string') {
      initialize.call(this);
    }
  }
}
```

#### `applyProcess()` (lignes 1215-1247)
**Rôle:** Crée et configure la propriété privée `_process`.

```typescript
Object.defineProperty(this, '_process', {
  value: {
    preview: null,
    loader: null,
    eventsOpen: [],
    eventsClose: [],
    images: [],
    flags: { /* ... */ },
    container: object.container,
    scaleLimit: { min: object.min, max: object.max },
    selector: object.el,
    context: context || document,
    currentImage: null
  },
  configurable: false,
  enumerable: false,
  writable: false
});
```

**Note:** `_process` est non-configurable, non-enumérable, et non-writable pour la protection.

#### `initialize()` (lignes 1252-1276)
**Rôle:** Initialise les images et le gestionnaire de resize.

```typescript
function initialize(): void {
  initImages();

  window.addEventListener('resize', function() {
    if (preview) {
      // Recalcule le centrage
      const nf = centerImage(
        currentImage.image,
        getContainerTarget().nf,
        scaleLimit.min,
        scaleLimit.max
      );
      currentImage.origin = nf;

      // Restaure l'état avec délai (attend fin animation)
      function reload() {
        flags.updateAttempt = setTimeout(() => {
          if (!flags.isAnimated) {
            restoreOriginStatus();
            flags.updateAttempt = false;
          } else {
            reload();  // Réessaie
          }
        }, 70);
      }
      reload();
    }
  });
}
```

**Note Resize:** Utilise un mécanisme de retry récursif qui attend que l'animation soit terminée avant de restaurer l'état.

#### Méthodes Publiques

##### `stop()` (lignes 1318-1320)
```typescript
public stop(): void {
  this._process.flags.stoped = true;
}
```
Bloque toutes les interactions (zoom, drag, etc.).

##### `resume()` (lignes 1325-1327)
```typescript
public resume(): void {
  this._process.flags.stoped = false;
}
```
Réactive les interactions.

##### `reset()` (lignes 1332-1336)
```typescript
public reset(): void {
  if (this._process.preview) {
    restoreOriginStatus.call(this);
  }
}
```
Restaure l'image à son état d'origine (si viewer ouvert).

##### `close()` (lignes 1341-1345)
```typescript
public close(): void {
  if (this._process.preview) {
    closeViewer.call(this);
  }
}
```
Ferme le viewer (si ouvert).

##### `update()` (lignes 1350-1358)
```typescript
public update(): void {
  if (process.preview) {
    updateScaleImage.call(this,
      currentImage.factor,
      {
        x: currentImage.x / currentImage.factor,
        y: currentImage.y / currentImage.factor
      }
    );
  }
}
```
Force une mise à jour de l'affichage.

##### `change()` (lignes 1363-1376)
```typescript
public change(targets: string): void {
  if (typeof targets === 'string') {
    // Ferme le viewer si ouvert
    if (process.preview) {
      closeViewer.call(this);
    }

    // Supprime les anciens event listeners
    for (let i = 0; i < process.images.length; i++) {
      initViewerEvent.call(this, process.images[i], true);
    }

    // Change le sélecteur et réinitialise
    process.selector = targets;
    process.images = [];
    initImages.call(this);
  }
}
```
Change le sélecteur et réinitialise toutes les images.

##### `onOpen()` (lignes 1381-1394)
```typescript
public onOpen(callback: ViewerEventCallback, remove?: boolean): void {
  if (typeof callback === 'function') {
    if (remove) {
      // Supprime le callback
      for (let i = process.eventsOpen.length - 1; i >= 0; i--) {
        if (process.eventsOpen[i] === callback) {
          process.eventsOpen.splice(i, 1);
        }
      }
    } else {
      // Ajoute le callback
      process.eventsOpen.push(callback);
    }
  }
}
```
Enregistre/supprime un callback déclenché à l'ouverture.

**Callback Format:**
```typescript
callback({
  preventDefault: () => void,
  stopPropagation: () => void,
  target: HTMLElement,        // L'élément cliqué
  instance: zPhotoZoom        // L'instance
})
```

##### `onClose()` (lignes 1399-1412)
Identique à `onOpen()` mais pour la fermeture.

---

## Flux d'Exécution Typique

### Initialisation
```
1. new zPhotoZoom({ el: '.image', min: 0.5, max: 5 })
2. injectStyles() → Injecte le CSS dans <head>
3. applyProcess() → Crée _process avec config
4. initialize()
   ├─ initImages()
   │  ├─ getImages() → Sélectionne les éléments
   │  │  └─ Pour chaque image:
   │  │     ├─ Extrait URL (src ou background-image)
   │  │     └─ imageProportion() → Charge et mesure
   │  │        └─ initImageEvents() → Prépare event listeners
   │  └─ initViewerEvent() → Click listeners sur éléments
   └─ window.addEventListener('resize') → Gère redimensionnement
```

### Ouverture du Viewer (Clic sur Image)
```
1. Événement 'click' sur image.node
2. openViewer(image)
   ├─ Déclenche callbacks onOpen
   ├─ getContainerPreview() → Crée conteneur
   │  └─ Ajoute event listeners (mousedown/mousemove/mouseup)
   ├─ Si image.loaded:
   │  ├─ Ajoute imageNode au conteneur
   │  ├─ centerImage() → Calcule position/échelle
   │  └─ updateScaleImage() → Applique initial transform
   ├─ Sinon: showLoader() → Affiche spinner
   ├─ preview.apply() → Ajoute conteneur au DOM
   ├─ preview.evener() → Active event listeners (délai 100ms)
   ├─ Initialise currentImage avec état
   └─ image.evener.apply() → Active listeners de l'image
```

### Zoom à la Molette
```
1. Événement 'wheel' sur imageNode
2. wheelEvent(e)
   ├─ getCursorsPositions([e]) → Position curseur
   └─ wheelZoom(cursorPos, factor)
      ├─ Modifie scale (±0.05)
      ├─ Applique limites min/max
      ├─ Calcule offset pour zoomer vers curseur
      ├─ updateScaleImage(newFactor, translate)
      │  ├─ showLoader('150%', 800)
      │  └─ Applique transform CSS
      └─ setTimeout 600ms pour throttle
```

### Pinch-to-Zoom (Touch)
```
1. Événement 'touchstart' (2 doigts)
   └─ clickEvent(e) → fingers=2, pointA=[pos1, pos2]

2. Événement 'touchmove'
   └─ touchMove(e)
      └─ touchZoom(pointA, pointB)
         ├─ Calcule distances (avant/après)
         ├─ scale = distanceB / distanceA
         ├─ Calcule nouveau centre entre doigts
         ├─ Ajuste x/y pour zoomer vers centre
         └─ updateScaleImage() (throttled)

3. Événement 'touchend'
   └─ touchEnd(e) → Reset fingers, distanceFactor, movements
```

### Drag (Déplacement)
```
1. Événement 'mousedown'/'touchstart'
   └─ clickEvent(e) → interaction=true, pointA=position

2. Événement 'mousemove'/'touchmove'
   └─ mouseMove(e) / touchMove(e)
      └─ drag(pointA, pointB)
         ├─ currentImage.x += deltaX
         ├─ currentImage.y += deltaY
         └─ updateScaleImage(factor, newTranslate, false)
            └─ Pas d'animation pour fluidité

3. Événement 'mouseup'/'touchend'
   └─ Reset interaction, dragInteraction
```

### Double-Clic Zoom
```
1. Premier clic
   └─ clickUp() → lastTimeClick = now()

2. Deuxième clic (< 320ms)
   └─ isDoubleClick()
      └─ doubleClickZoom(clickPos)
         ├─ Si scale <= origin.scale:
         │  ├─ scale += 2
         │  ├─ Calcule offset vers clickPos
         │  └─ updateScaleImage(newScale, translate, true)
         └─ Sinon:
            └─ restoreOriginStatus()
               ├─ Reset scale/position à origin
               └─ updateScaleImage(..., true) avec animation
```

### Fermeture du Viewer
```
1. Clic sur fond (sans mouvement) OU appel à close()
2. closeViewer()
   ├─ Déclenche callbacks onClose
   ├─ Réinitialise tous les flags
   ├─ image.evener.remove() → Supprime listeners image
   ├─ preview.evener(true) → Supprime listeners conteneur
   ├─ Retire imageNode du DOM
   ├─ Retire/supprime conteneur
   └─ Reset preview, loader, currentImage à null/false
```

### Resize de la Fenêtre
```
1. Événement 'resize' sur window
2. Si viewer ouvert:
   ├─ centerImage() → Recalcule position/échelle
   ├─ currentImage.origin = nouvelles valeurs
   └─ reload() (récursif)
      └─ Attend que !flags.isAnimated
         └─ restoreOriginStatus() → Applique nouveau centrage
```

---

## Optimisations et Techniques Avancées

### 1. Accélération GPU
**Ligne 1043:** Utilisation de `scale3d()` et `translate3d()`:
```css
transform: scale3d(1.5, 1.5, 1) translate3d(100px, 50px, 0);
```
La dimension Z (1 et 0) force le navigateur à utiliser le GPU, garantissant 60fps.

### 2. Transform Origin
**Ligne 1065:** Définition de `transform-origin: top left`:
```typescript
imageNode.style.transformOrigin = 'top left';
```
Permet de calculer facilement les translations car le point de référence est fixe (coin haut-gauche).

### 3. Throttling
**Lignes 900-902, 1006-1014:** Utilisation de timers et flags pour limiter les updates:
```typescript
// Wheel zoom
flags.wheel = setTimeout(() => flags.wheel = false, 600);

// Touch zoom
if (!flags.updated && !flags.isAnimated) {
  flags.updated = true;
  setTimeout(() => {
    updateScaleImage(...);
    flags.updated = false;
  }, 0);
}
```

### 4. Événements Passifs
**Lignes 826-846:** Utilisation de `{ passive: false }` pour autoriser `preventDefault()`:
```typescript
imageNode.addEventListener('wheel', wheelEvent, { passive: false });
imageNode.addEventListener('touchmove', touchMove, { passive: false });
```

### 5. Capture Phase
**Lignes 831-832, 845-846:** Utilisation de `{ capture: true }` pour attraper les événements avant propagation:
```typescript
context.addEventListener('mouseup', clickUp, {
  passive: false,
  capture: true
});
```

### 6. Délai d'Initialisation
**Ligne 511:** setTimeout de 100ms avant d'activer les listeners du conteneur:
```typescript
setTimeout(function() {
  context.addEventListener('mousedown', mouseDown);
  // ...
}, 100);
```
Évite les conflits avec les événements de l'image qui vient d'être ajoutée.

### 7. Optimisation des Sélecteurs
**Lignes 1111-1118:** Détection de sélecteur simple vs complexe:
```typescript
if (/\s+[^#]|>|\[|\.|,/.test(selector)) {
  // Sélecteur complexe → querySelectorAll
  nodes = Array.from(context.querySelectorAll(selector));
} else {
  // Sélecteur simple → querySelector (plus rapide)
  nodes = [context.querySelector(selector)];
}
```

### 8. Propriété Privée Immutable
**Lignes 1216-1246:** `_process` défini avec `Object.defineProperty`:
```typescript
Object.defineProperty(this, '_process', {
  value: { /* ... */ },
  configurable: false,  // Ne peut pas être redéfini
  enumerable: false,    // N'apparaît pas dans for..in
  writable: false       // Ne peut pas être réassigné
});
```
Protection contre les modifications externes.

---

## Cas d'Usage

### 1. Mode Fullscreen (Par Défaut)
```typescript
const viewer = new zPhotoZoom({
  el: '.gallery img',
  min: 0.5,
  max: 5
});
```
Le viewer s'ouvre en plein écran avec overlay semi-transparent.

### 2. Mode Embedded (Conteneur Spécifique)
```typescript
const container = document.getElementById('viewer-container');
const viewer = new zPhotoZoom({
  el: '.product-image',
  container: container
});
```
Le viewer reste dans le conteneur spécifié.

### 3. Contrôle Programmatique
```typescript
const viewer = new zPhotoZoom({ el: '.image' });

// Arrêter temporairement les interactions
viewer.stop();

// Reprendre
viewer.resume();

// Réinitialiser la vue
viewer.reset();

// Fermer
viewer.close();
```

### 4. Événements Personnalisés
```typescript
const viewer = new zPhotoZoom({ el: '.image' });

// Tracker l'ouverture
viewer.onOpen((event) => {
  console.log('Image ouverte:', event.target.src);
  analytics.track('image_view', { url: event.target.src });
});

// Empêcher la fermeture conditionnelle
viewer.onClose((event) => {
  if (shouldPreventClose()) {
    event.preventDefault();
  }
});
```

### 5. Images Dynamiques
```typescript
const viewer = new zPhotoZoom({ el: '.dynamic-image' });

// Charger de nouvelles images
fetch('/api/images')
  .then(res => res.json())
  .then(images => {
    const container = document.querySelector('.gallery');
    images.forEach(img => {
      const element = document.createElement('img');
      element.src = img.url;
      element.className = 'dynamic-image';
      container.appendChild(element);
    });

    // Réinitialiser le viewer avec les nouvelles images
    viewer.change('.dynamic-image');
  });
```

### 6. Multiples Instances
```typescript
// Galerie de miniatures
const thumbnails = new zPhotoZoom({
  el: '.thumbnail',
  min: 1,
  max: 3
});

// Galerie principale
const fullsize = new zPhotoZoom({
  el: '.fullsize',
  min: 0.5,
  max: 10
});
```

---

## Points Techniques Importants

### 1. Typo "stoped" Préservée
**Lignes 185, 366, 874, 912, 977, 1232, 1319, 1326**

La bibliothèque préserve intentionnellement le typo `stoped` au lieu de `stopped` pour maintenir la compatibilité avec le code JavaScript original.

### 2. Fonctions width() et height()
**Lignes 581-586**

```typescript
currentImage = {
  // ...
  width: function() {
    return currentImage.imageNode.offsetWidth;
  },
  height: function() {
    return currentImage.imageNode.offsetHeight;
  }
};
```
Ces fonctions retournent les dimensions **actuelles** (après transformation), pas les dimensions originales. Critique pour les calculs.

### 3. Centers cx et cy
**Lignes 574-575, 610-611, 624-625, 950-951**

Les propriétés `cx` (center x) et `cy` (center y) de `ContainerTarget.nf` sont essentielles pour le centrage correct des images. Elles représentent le centre du viewport/conteneur.

### 4. Gestion des Préfixes CSS
**Lignes 1065-1071**

La bibliothèque applique les transformations sur tous les préfixes vendor pour la compatibilité:
- Standard: `transform`
- WebKit (Chrome, Safari): `-webkit-transform`
- Mozilla (Firefox): `-moz-transform`
- Microsoft (IE): `-ms-transform`
- Opera: `-o-transform`

### 5. Extraction d'URL Background
**Lignes 1133-1145**

Supporte l'extraction d'images depuis `background-image` CSS:
```typescript
const bgImage = getComputedStyle(node).backgroundImage;
if (/^url\(/.test(bgImage)) {
  const match = bgImage.match(/url\(["']?([^"']*)["']?\)/);
  url = match ? match[1] : false;
}
```

---

## Configuration de Build (Vite)

**Fichier:** `vite.config.ts`

### Formats de Sortie
La bibliothèque est construite en 4 formats:

1. **ES Modules (ESM)** - `zphotozoom.esm.js`
   - Pour bundlers modernes (Webpack, Rollup, Vite)
   - Support tree-shaking

2. **UMD** - `zphotozoom.umd.js`
   - Universel: navigateurs, AMD, CommonJS
   - Exposition globale: `window.zPhotoZoom`
   - Utilisable via CDN

3. **CommonJS (CJS)** - `zphotozoom.cjs.js`
   - Pour Node.js
   - `require('zphotozoom')`

4. **IIFE** - `zphotozoom.js`
   - Standalone pour inclusion directe `<script>`

### Optimisations
- **Minification:** Terser
- **Source Maps:** Activées
- **Banner:** Commentaire de licence préservé
- **Target:** ES2020
- **Tree-shaking:** Supporté (ESM)

---

## Tests

**Fichier:** `tests/zphotozoom.test.ts` (non analysé en détail)

La bibliothèque inclut une suite de tests avec Vitest couvrant:
- Initialisation
- Gestion des événements
- Transformations
- API publique

---

## Compatibilité Navigateurs

**Navigateurs Supportés:**
- Chrome: 2 dernières versions
- Firefox: 2 dernières versions
- Safari: 2 dernières versions
- Edge: 2 dernières versions
- iOS Safari: 12+
- Chrome Android: 2 dernières versions

**Technologies Utilisées:**
- CSS Transforms 3D (GPU acceleration)
- Touch Events API
- Wheel Events
- getBoundingClientRect
- querySelectorAll
- addEventListener avec options

---

## Roadmap (du README)

Fonctionnalités prévues:
- [ ] Navigation clavier
- [ ] Attributs ARIA (accessibilité)
- [ ] Rotation d'images
- [ ] Navigation galerie (prev/next)
- [ ] Bande de miniatures
- [ ] Virtual scrolling pour grandes galeries
- [ ] Configuration des animations
- [ ] Système de plugins

---

## Résumé de l'Architecture

```
zPhotoZoom
│
├─ CSS Injection
│  └─ Styles pour .ZPhotoZoom, loader, animations
│
├─ Type System
│  ├─ Options (zPhotoZoomOptions)
│  ├─ State (ProcessState, ViewerFlags)
│  ├─ Data (ImageData, CurrentImage)
│  └─ Events (ViewerEvent, ViewerEventCallback)
│
├─ Utilities
│  ├─ imageProportion() - Charge et mesure images
│  ├─ centerImage() - Calcule centrage optimal
│  └─ calculateNewCenter() - Centre multi-touch
│
├─ Viewer Management
│  ├─ getContainerTarget() - Dimensions viewport/conteneur
│  ├─ getContainerPreview() - Crée conteneur avec listeners
│  ├─ openViewer() - Ouvre et initialise le viewer
│  └─ closeViewer() - Ferme et nettoie le viewer
│
├─ Event Management
│  ├─ initImageEvents() - Gère wheel, mouse, touch sur image
│  ├─ initViewerEvent() - Click pour ouvrir viewer
│  └─ Event handlers (click, wheel, touch, drag)
│
├─ Zoom & Pan
│  ├─ drag() - Déplacement souris/touch
│  ├─ wheelZoom() - Zoom molette
│  ├─ doubleClickZoom() - Zoom double-clic
│  ├─ touchZoom() - Pinch-to-zoom
│  └─ restoreOriginStatus() - Réinitialisation
│
├─ Visual Updates
│  ├─ updateScaleImage() - Applique transforms CSS
│  ├─ showLoader() - Affiche loader/pourcentage
│  └─ hideLoader() - Cache loader avec transition
│
├─ Image Management
│  ├─ getImages() - Sélectionne et charge images
│  └─ initImages() - Initialise toutes les images
│
├─ Initialization
│  ├─ applyProcess() - Crée _process
│  └─ initialize() - Init images + resize listener
│
└─ Public API (Classe zPhotoZoom)
   ├─ constructor()
   ├─ stop() / resume()
   ├─ reset() / close()
   ├─ update() / change()
   └─ onOpen() / onClose()
```

---

## Conclusion

**zPhotoZoom** est une bibliothèque bien architecturée qui offre une expérience utilisateur fluide pour le zoom d'images. Son code est organisé de manière fonctionnelle avec une séparation claire des responsabilités.

**Points Forts:**
- ✅ Architecture modulaire et claire
- ✅ Performance optimale (GPU, throttling)
- ✅ Support complet tactile et souris
- ✅ Gestion robuste des états
- ✅ API publique simple et intuitive
- ✅ TypeScript avec types complets
- ✅ Zéro dépendance
- ✅ Multi-format (ESM, UMD, CJS, IIFE)

**Particularités:**
- Préserve le typo "stoped" pour compatibilité
- Utilise des fonctions avec `call(this)` plutôt que des méthodes
- Définit `width()` et `height()` comme fonctions dynamiques
- Centres (cx, cy) calculés pour chaque opération

**Cas d'Usage Idéaux:**
- Galeries d'images
- Visionneuses de produits e-commerce
- Portfolios photographiques
- Visualisateurs de documents
- Applications nécessitant zoom/pan d'images

---

*Analyse générée le 2025-11-13*
*Version analysée: 2.0.4*
*Fichier source: src/zphotozoom.ts (1488 lignes)*
