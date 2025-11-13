# Proposition : Système de Carrousel Style Google Picasa

## 📋 Vue d'Ensemble

Cette proposition détaille l'ajout d'une fonctionnalité de carrousel/galerie inspirée de Google Picasa à zPhotoZoom, permettant la navigation entre plusieurs images avec bande de miniatures et raccourcis clavier.

---

## 🎯 Objectifs

### Fonctionnalités Principales

1. **Navigation entre images**
   - Boutons Précédent/Suivant
   - Raccourcis clavier (flèches gauche/droite)
   - Navigation circulaire (optionnelle)

2. **Bande de miniatures**
   - Affichage des miniatures en bas du viewer
   - Indicateur de l'image active
   - Défilement automatique pour suivre l'image active
   - Click sur miniature pour navigation directe

3. **Transitions fluides**
   - Animation de glissement entre images
   - Préchargement des images adjacentes
   - Transitions configurables (slide, fade, none)

4. **Compteur d'images**
   - Affichage "3 / 12" (image actuelle / total)
   - Position configurable

5. **Raccourcis clavier**
   - `←` / `→` : Navigation précédent/suivant
   - `Escape` : Fermer le viewer
   - `Home` : Première image
   - `End` : Dernière image
   - `Space` : Pause/Play du slideshow (optionnel)

---

## 🏗️ Architecture Proposée

### 1. Approche par Extension (Recommandée)

**Avantages:**
- ✅ Conserve la bibliothèque principale légère
- ✅ Permet d'utiliser zPhotoZoom seul ou avec carousel
- ✅ Facilite la maintenance et les tests
- ✅ Bundle séparé pour ceux qui n'en ont pas besoin

**Structure:**
```
src/
├── zphotozoom.ts              # Core existant
├── carousel/
│   ├── zPhotoCarousel.ts      # Extension carousel
│   ├── CarouselTypes.ts       # Types spécifiques
│   ├── ThumbnailBar.ts        # Gestion bande miniatures
│   ├── KeyboardNav.ts         # Navigation clavier
│   ├── Preloader.ts           # Préchargement images
│   └── carousel.css           # Styles carousel
└── index.ts                   # Export principal
```

**Usage:**
```typescript
// Sans carousel (comme actuellement)
import zPhotoZoom from 'zphotozoom';
const viewer = new zPhotoZoom({ el: '.image' });

// Avec carousel
import { zPhotoZoom, zPhotoCarousel } from 'zphotozoom';
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  enableThumbnails: true,
  enableKeyboard: true,
  transition: 'slide'
});
```

### 2. Approche Intégrée (Alternative)

**Avantages:**
- ✅ API unifiée
- ✅ Configuration simple

**Inconvénient:**
- ❌ Augmente la taille du bundle principal
- ❌ Charge des fonctionnalités inutilisées

**Usage:**
```typescript
const viewer = new zPhotoZoom({
  el: '.gallery img',
  carousel: true,  // Active le mode carousel
  thumbnails: true,
  keyboard: true
});
```

---

## 📦 Composants Détaillés

### 1. zPhotoCarousel (Classe Principale)

**Responsabilités:**
- Hérite ou compose avec zPhotoZoom
- Gère la collection d'images
- Coordonne la navigation
- Gère l'état du carousel (index courant, etc.)

**Interface:**
```typescript
interface CarouselOptions extends zPhotoZoomOptions {
  // Carousel
  carousel?: boolean;                  // Active le mode carousel
  loop?: boolean;                      // Navigation circulaire
  startIndex?: number;                 // Index de départ

  // Thumbnails
  enableThumbnails?: boolean;          // Affiche la bande
  thumbnailHeight?: number;            // Hauteur des miniatures (px)
  thumbnailPosition?: 'top' | 'bottom' | 'left' | 'right';
  thumbnailsVisible?: number;          // Nombre visible simultanément

  // Navigation
  enableKeyboard?: boolean;            // Raccourcis clavier
  enableArrows?: boolean;              // Boutons flèches
  arrowPosition?: 'center' | 'bottom'; // Position des flèches

  // Transitions
  transition?: 'slide' | 'fade' | 'none';
  transitionDuration?: number;         // Durée en ms

  // Slideshow (optionnel)
  autoPlay?: boolean;                  // Démarrage auto
  autoPlayInterval?: number;           // Intervalle en ms
  pauseOnHover?: boolean;              // Pause au survol

  // Préchargement
  preloadAdjacent?: boolean;           // Précharge images voisines
  preloadAll?: boolean;                // Précharge toutes les images

  // Counter
  showCounter?: boolean;               // Affiche "3 / 12"
  counterPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

class zPhotoCarousel extends zPhotoZoom {
  private _carouselState: CarouselState;
  private _thumbnailBar?: ThumbnailBar;
  private _keyboardNav?: KeyboardNav;
  private _preloader?: Preloader;

  constructor(options: CarouselOptions);

  // Navigation API
  public next(): void;                 // Image suivante
  public previous(): void;             // Image précédente
  public goTo(index: number): void;    // Aller à l'index
  public first(): void;                // Première image
  public last(): void;                 // Dernière image

  // Slideshow API
  public play(): void;                 // Démarre slideshow
  public pause(): void;                // Met en pause
  public togglePlay(): void;           // Toggle play/pause

  // State API
  public getCurrentIndex(): number;    // Index actuel
  public getTotalImages(): number;     // Nombre total
  public getImages(): ImageData[];     // Toutes les images

  // Events (en plus de onOpen/onClose)
  public onNavigate(callback: (event: NavigateEvent) => void): void;
  public onSlideChange(callback: (event: SlideChangeEvent) => void): void;
}

interface CarouselState {
  currentIndex: number;
  totalImages: number;
  isPlaying: boolean;
  playTimer: number | null;
  isTransitioning: boolean;
  direction: 'forward' | 'backward' | null;
}

interface NavigateEvent {
  from: number;
  to: number;
  direction: 'forward' | 'backward';
  image: ImageData;
  instance: zPhotoCarousel;
}
```

### 2. ThumbnailBar (Composant)

**Responsabilités:**
- Crée et gère la bande de miniatures
- Synchronise avec l'image active
- Gère le scroll automatique
- Gère les clics sur miniatures

**Structure DOM:**
```html
<div class="zpz-thumbnail-bar zpz-tb-bottom">
  <div class="zpz-tb-container">
    <div class="zpz-tb-track" style="transform: translateX(-120px)">
      <div class="zpz-tb-item" data-index="0">
        <img src="thumb1.jpg" alt="">
      </div>
      <div class="zpz-tb-item zpz-tb-active" data-index="1">
        <img src="thumb2.jpg" alt="">
      </div>
      <div class="zpz-tb-item" data-index="2">
        <img src="thumb3.jpg" alt="">
      </div>
    </div>
  </div>
</div>
```

**Interface:**
```typescript
interface ThumbnailBarOptions {
  images: ImageData[];
  position: 'top' | 'bottom' | 'left' | 'right';
  height: number;
  visibleCount: number;
  onThumbnailClick: (index: number) => void;
}

class ThumbnailBar {
  private container: HTMLElement;
  private track: HTMLElement;
  private thumbnails: HTMLElement[];
  private currentIndex: number;

  constructor(options: ThumbnailBarOptions);

  public render(): HTMLElement;
  public setActive(index: number): void;
  public scrollToActive(): void;
  public destroy(): void;
}
```

### 3. KeyboardNav (Composant)

**Responsabilités:**
- Écoute les événements clavier
- Traduit en actions (next, prev, close, etc.)
- Gère les états désactivés

**Interface:**
```typescript
interface KeyboardNavOptions {
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onFirst: () => void;
  onLast: () => void;
  onTogglePlay?: () => void;
  enabled: boolean;
}

class KeyboardNav {
  private options: KeyboardNavOptions;
  private enabled: boolean;

  constructor(options: KeyboardNavOptions);

  public enable(): void;
  public disable(): void;
  public destroy(): void;

  private handleKeyDown(e: KeyboardEvent): void;
}

// Mappings
const KEYBOARD_MAPPINGS = {
  ARROW_LEFT: 'previous',
  ARROW_RIGHT: 'next',
  ESCAPE: 'close',
  HOME: 'first',
  END: 'last',
  SPACE: 'togglePlay'
};
```

### 4. Preloader (Composant)

**Responsabilités:**
- Précharge les images adjacentes
- Optimise la navigation
- Gère une file de préchargement

**Interface:**
```typescript
interface PreloaderOptions {
  images: ImageData[];
  preloadAdjacent: boolean;
  preloadAll: boolean;
}

class Preloader {
  private queue: Set<number>;
  private loaded: Set<number>;

  constructor(options: PreloaderOptions);

  public preloadImage(index: number): Promise<void>;
  public preloadAdjacent(currentIndex: number): void;
  public preloadAll(): void;
}
```

### 5. Navigation Arrows (UI)

**Structure DOM:**
```html
<div class="zpz-nav-arrows">
  <button class="zpz-arrow zpz-arrow-prev" aria-label="Previous image">
    <svg><!-- Icône flèche gauche --></svg>
  </button>
  <button class="zpz-arrow zpz-arrow-next" aria-label="Next image">
    <svg><!-- Icône flèche droite --></svg>
  </button>
</div>
```

**Styles:**
```css
.zpz-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
}

.zpz-arrow:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.zpz-arrow-prev { left: 20px; }
.zpz-arrow-next { right: 20px; }

.zpz-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
```

### 6. Counter (UI)

**Structure DOM:**
```html
<div class="zpz-counter zpz-counter-top-right">
  <span class="zpz-counter-current">3</span>
  <span class="zpz-counter-separator">/</span>
  <span class="zpz-counter-total">12</span>
</div>
```

---

## 🔄 Flux de Navigation

### Séquence: Navigation vers Image Suivante

```
1. User Action (click arrow / keyboard / swipe)
   └─> carousel.next()

2. Validation
   ├─> if (isTransitioning) return;  // Ignore si transition en cours
   ├─> if (!loop && currentIndex === last) return;  // Fin atteinte
   └─> Continue

3. Calcul Index
   ├─> newIndex = (currentIndex + 1) % totalImages
   └─> direction = 'forward'

4. Événement Pre-Change
   ├─> Déclenche onNavigate
   │   └─> { from: currentIndex, to: newIndex, direction, image }
   └─> Si preventDefault() → Stop

5. Préparation
   ├─> isTransitioning = true
   ├─> Précharge image suivante (si pas déjà fait)
   └─> Sauvegarde état zoom actuel (optionnel)

6. Transition Visuelle
   ├─> Si transition === 'slide':
   │   ├─> Positionne nouvelle image hors écran (droite)
   │   ├─> Anime image actuelle vers gauche (out)
   │   └─> Anime nouvelle image vers centre (in)
   │
   ├─> Si transition === 'fade':
   │   ├─> Fade out image actuelle
   │   └─> Fade in nouvelle image
   │
   └─> Si transition === 'none':
       └─> Swap instantané

7. Mise à Jour État
   ├─> currentIndex = newIndex
   ├─> currentImage = images[newIndex]
   └─> Réinitialise zoom/position (ou restaure état sauvegardé)

8. Mise à Jour UI
   ├─> ThumbnailBar.setActive(newIndex)
   ├─> ThumbnailBar.scrollToActive()
   ├─> Counter.update(newIndex + 1, totalImages)
   └─> Arrows.updateDisabledState()

9. Finalisation
   ├─> isTransitioning = false
   └─> Déclenche onSlideChange
       └─> { index: newIndex, image, total }

10. Post-Actions
    └─> Précharge image suivante adjacente
```

### Séquence: Click sur Miniature

```
1. Click Event sur thumbnail[index]
   └─> carousel.goTo(index)

2. Validation
   ├─> if (index === currentIndex) return;  // Déjà active
   └─> if (isTransitioning) return;

3. Détection Direction
   ├─> if (index > currentIndex) direction = 'forward'
   └─> else direction = 'backward'

4. Navigation
   └─> Suit le même flux que next() mais avec:
       ├─> newIndex = index (fixé)
       └─> Peut utiliser transition différente (fade au lieu de slide)
```

---

## 🎨 CSS Architecture

### Structure des Classes

```css
/* Container principal carousel */
.ZPhotoZoom.zpz-carousel {
  /* Styles spécifiques carousel */
}

/* Zone image principale */
.zpz-main-image-container {
  position: relative;
  width: 100%;
  height: calc(100% - 120px); /* Espace pour thumbnails */
  overflow: hidden;
}

/* Track pour transitions slide */
.zpz-image-track {
  display: flex;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.zpz-image-slide {
  flex: 0 0 100%;
  position: relative;
}

/* Bande de miniatures */
.zpz-thumbnail-bar {
  position: absolute;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
}

.zpz-tb-bottom {
  bottom: 0;
  height: 120px;
}

.zpz-tb-top {
  top: 0;
  height: 120px;
}

.zpz-tb-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 10px;
}

.zpz-tb-track {
  display: flex;
  gap: 10px;
  transition: transform 0.3s ease;
  height: 100%;
}

.zpz-tb-item {
  flex: 0 0 auto;
  width: 100px;
  height: 100%;
  cursor: pointer;
  border: 3px solid transparent;
  border-radius: 5px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.zpz-tb-item:hover {
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.zpz-tb-item.zpz-tb-active {
  border-color: #667eea;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.zpz-tb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

/* Navigation arrows */
.zpz-nav-arrows {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 120px; /* Au-dessus des thumbnails */
  pointer-events: none;
  z-index: 999;
}

.zpz-arrow {
  pointer-events: auto;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.zpz-arrow:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.8);
  border-color: rgba(102, 126, 234, 1);
  transform: translateY(-50%) scale(1.1);
}

.zpz-arrow:active:not(:disabled) {
  transform: translateY(-50%) scale(0.95);
}

.zpz-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.zpz-arrow-prev {
  left: 20px;
}

.zpz-arrow-next {
  right: 20px;
}

.zpz-arrow svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

/* Counter */
.zpz-counter {
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  z-index: 1000;
  user-select: none;
}

.zpz-counter-top-left {
  top: 20px;
  left: 20px;
}

.zpz-counter-top-right {
  top: 20px;
  right: 20px;
}

.zpz-counter-bottom-left {
  bottom: 140px; /* Au-dessus thumbnails */
  left: 20px;
}

.zpz-counter-bottom-right {
  bottom: 140px;
  right: 20px;
}

.zpz-counter-separator {
  margin: 0 8px;
  opacity: 0.6;
}

/* Transitions */
.zpz-transition-slide .zpz-image-slide {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.zpz-transition-fade .zpz-image-slide {
  transition: opacity 0.4s ease;
}

.zpz-transition-fade .zpz-image-slide:not(.zpz-active) {
  opacity: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .zpz-tb-bottom,
  .zpz-tb-top {
    height: 80px;
  }

  .zpz-tb-item {
    width: 60px;
  }

  .zpz-arrow {
    width: 40px;
    height: 40px;
  }

  .zpz-arrow-prev {
    left: 10px;
  }

  .zpz-arrow-next {
    right: 10px;
  }

  .zpz-counter {
    font-size: 14px;
    padding: 6px 12px;
  }
}
```

---

## 🔌 Intégration avec le Code Existant

### Modifications à apporter à zPhotoZoom

**Option 1: Extension par Composition (Recommandée)**

Aucune modification majeure du code existant. zPhotoCarousel utilise une instance de zPhotoZoom en interne:

```typescript
class zPhotoCarousel {
  private viewer: zPhotoZoom;
  private images: ImageData[];
  private currentIndex: number = 0;

  constructor(options: CarouselOptions) {
    // Crée viewer pour image courante
    this.viewer = new zPhotoZoom({
      el: options.el,
      min: options.min,
      max: options.max,
      // ... autres options
    });

    // Récupère toutes les images
    this.images = this.viewer._process.images;

    // Override openViewer pour contrôler quelle image
    this.setupCarouselMode();
  }

  private setupCarouselMode(): void {
    // Intercepte les clicks sur images
    this.images.forEach((img, index) => {
      img.node.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openAtIndex(index);
      });
    });
  }

  private openAtIndex(index: number): void {
    this.currentIndex = index;
    // Ouvre le viewer en mode carousel
    this.openCarousel();
  }
}
```

**Option 2: Extension par Héritage**

```typescript
class zPhotoCarousel extends zPhotoZoom {
  protected _carouselState: CarouselState;

  constructor(options: CarouselOptions) {
    super(options);
    this.initCarousel(options);
  }

  protected initCarousel(options: CarouselOptions): void {
    this._carouselState = {
      currentIndex: options.startIndex || 0,
      totalImages: this._process.images.length,
      isPlaying: options.autoPlay || false,
      playTimer: null,
      isTransitioning: false,
      direction: null
    };

    if (options.enableThumbnails) {
      this._thumbnailBar = new ThumbnailBar({...});
    }

    if (options.enableKeyboard) {
      this._keyboardNav = new KeyboardNav({...});
    }
  }

  // Override openViewer pour mode carousel
  protected openCarouselViewer(index: number): void {
    // Ouvre avec modifications pour carousel
  }
}
```

### Hooks dans openViewer

Pour la transition entre images, on peut ajouter des hooks:

```typescript
// Dans openViewer (modifié)
function openViewer(this: zPhotoZoom, image: ImageData, options?: {
  transition?: 'slide' | 'fade' | 'none';
  direction?: 'forward' | 'backward';
}): void {
  // ... code existant ...

  // Nouveau: Gestion transition carousel
  if (options?.transition) {
    applyTransition.call(this, options.transition, options.direction);
  }
}
```

---

## 📱 Gestion du Touch/Swipe

Pour la navigation tactile, ajouter la détection de swipe:

```typescript
class SwipeDetector {
  private startX: number = 0;
  private startY: number = 0;
  private threshold: number = 50;  // Distance minimum pour swipe

  constructor(
    element: HTMLElement,
    onSwipeLeft: () => void,
    onSwipeRight: () => void
  ) {
    element.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    });

    element.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const deltaX = endX - this.startX;
      const deltaY = endY - this.startY;

      // Vérifier que c'est un swipe horizontal
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > this.threshold) {
          if (deltaX > 0) {
            onSwipeRight();  // Swipe vers droite = previous
          } else {
            onSwipeLeft();   // Swipe vers gauche = next
          }
        }
      }
    });
  }
}
```

**Important:** Ne déclencher le swipe que si l'image n'est PAS zoomée (scale === 1), sinon le swipe sert à pan.

```typescript
if (currentImage.scale === currentImage.origin.scale) {
  // Image non zoomée -> swipe = navigation
  this.swipeDetector = new SwipeDetector(imageNode, ...);
} else {
  // Image zoomée -> swipe = pan (comportement actuel)
}
```

---

## 🎬 Animation de Transition

### Slide Transition (Recommandée)

```typescript
function slideTransition(
  from: HTMLImageElement,
  to: HTMLImageElement,
  direction: 'forward' | 'backward',
  duration: number
): Promise<void> {
  return new Promise((resolve) => {
    const container = from.parentElement;

    // Position initiale de la nouvelle image
    const startOffset = direction === 'forward' ? '100%' : '-100%';
    to.style.transform = `translateX(${startOffset})`;
    to.style.opacity = '1';

    // Ajoute au DOM
    container.appendChild(to);

    // Force reflow
    to.offsetHeight;

    // Anime
    const endOffset = direction === 'forward' ? '-100%' : '100%';
    from.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    to.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

    from.style.transform = `translateX(${endOffset})`;
    to.style.transform = 'translateX(0)';

    setTimeout(() => {
      container.removeChild(from);
      from.style.transform = '';
      from.style.transition = '';
      to.style.transition = '';
      resolve();
    }, duration);
  });
}
```

### Fade Transition

```typescript
function fadeTransition(
  from: HTMLImageElement,
  to: HTMLImageElement,
  duration: number
): Promise<void> {
  return new Promise((resolve) => {
    const container = from.parentElement;

    // Positionne nouvelle image (invisible)
    to.style.opacity = '0';
    to.style.position = 'absolute';
    to.style.top = '0';
    to.style.left = '0';
    container.appendChild(to);

    // Force reflow
    to.offsetHeight;

    // Cross-fade
    from.style.transition = `opacity ${duration}ms ease`;
    to.style.transition = `opacity ${duration}ms ease`;

    from.style.opacity = '0';
    to.style.opacity = '1';

    setTimeout(() => {
      container.removeChild(from);
      to.style.position = '';
      resolve();
    }, duration);
  });
}
```

---

## 📊 État et Gestion de la Mémoire

### Gestion du Préchargement

```typescript
class Preloader {
  private imageCache: Map<number, HTMLImageElement> = new Map();

  public preloadImage(imageData: ImageData): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        imageData.imageNode = img;
        imageData.loaded = true;
        resolve(img);
      };

      img.onerror = reject;
      img.src = imageData.src;
    });
  }

  public async preloadAdjacent(
    images: ImageData[],
    currentIndex: number
  ): Promise<void> {
    const toPreload: number[] = [];

    // Image suivante
    const nextIndex = (currentIndex + 1) % images.length;
    if (!images[nextIndex].loaded) {
      toPreload.push(nextIndex);
    }

    // Image précédente
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    if (!images[prevIndex].loaded) {
      toPreload.push(prevIndex);
    }

    // Précharge en parallèle
    await Promise.all(
      toPreload.map(index => this.preloadImage(images[index]))
    );
  }
}
```

### Nettoyage Mémoire

```typescript
public destroy(): void {
  // Arrête le slideshow
  if (this._carouselState.playTimer) {
    clearInterval(this._carouselState.playTimer);
  }

  // Détruit les composants
  this._thumbnailBar?.destroy();
  this._keyboardNav?.destroy();

  // Nettoie le cache
  this.imageCache.clear();

  // Appelle destroy du parent
  super.destroy?.();
}
```

---

## 🧪 Plan de Tests

### Tests Unitaires

```typescript
describe('zPhotoCarousel', () => {
  describe('Navigation', () => {
    it('should navigate to next image', () => {
      const carousel = new zPhotoCarousel({ el: '.test-images' });
      expect(carousel.getCurrentIndex()).toBe(0);
      carousel.next();
      expect(carousel.getCurrentIndex()).toBe(1);
    });

    it('should loop to first image when at end', () => {
      const carousel = new zPhotoCarousel({
        el: '.test-images',
        loop: true
      });
      carousel.last();
      carousel.next();
      expect(carousel.getCurrentIndex()).toBe(0);
    });

    it('should not navigate beyond last without loop', () => {
      const carousel = new zPhotoCarousel({
        el: '.test-images',
        loop: false
      });
      const lastIndex = carousel.getTotalImages() - 1;
      carousel.last();
      carousel.next();
      expect(carousel.getCurrentIndex()).toBe(lastIndex);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate on arrow keys', () => {
      const carousel = new zPhotoCarousel({
        el: '.test-images',
        enableKeyboard: true
      });

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      document.dispatchEvent(event);

      expect(carousel.getCurrentIndex()).toBe(1);
    });
  });

  describe('Thumbnails', () => {
    it('should highlight active thumbnail', () => {
      const carousel = new zPhotoCarousel({
        el: '.test-images',
        enableThumbnails: true
      });

      const activeThumbnail = document.querySelector('.zpz-tb-active');
      expect(activeThumbnail).toHaveAttribute('data-index', '0');
    });
  });
});
```

### Tests d'Intégration

```typescript
describe('Carousel Integration', () => {
  it('should sync all UI components on navigation', async () => {
    const carousel = new zPhotoCarousel({
      el: '.test-images',
      enableThumbnails: true,
      showCounter: true,
      enableArrows: true
    });

    carousel.next();

    await waitForTransition();

    // Vérifier toutes les mises à jour
    expect(carousel.getCurrentIndex()).toBe(1);
    expect(document.querySelector('.zpz-tb-active')).toHaveAttribute('data-index', '1');
    expect(document.querySelector('.zpz-counter-current').textContent).toBe('2');
  });
});
```

---

## 📦 Plan d'Implémentation (Phases)

### Phase 1: Infrastructure de Base (Semaine 1)
- [ ] Créer structure de dossiers carousel/
- [ ] Définir tous les types TypeScript
- [ ] Créer classe zPhotoCarousel de base
- [ ] Implémenter système de collection d'images
- [ ] Tests unitaires de base

### Phase 2: Navigation Simple (Semaine 2)
- [ ] Implémenter next() / previous() / goTo()
- [ ] Ajouter boutons flèches UI
- [ ] Implémenter navigation clavier
- [ ] Ajouter compteur d'images
- [ ] Tests navigation

### Phase 3: Transitions (Semaine 3)
- [ ] Implémenter transition slide
- [ ] Implémenter transition fade
- [ ] Optimiser performances transitions
- [ ] Gestion états transitioning
- [ ] Tests transitions

### Phase 4: Bande de Miniatures (Semaine 4)
- [ ] Créer composant ThumbnailBar
- [ ] Implémenter rendu miniatures
- [ ] Scroll automatique vers active
- [ ] Gestion clicks miniatures
- [ ] Responsive design
- [ ] Tests thumbnails

### Phase 5: Préchargement (Semaine 5)
- [ ] Créer composant Preloader
- [ ] Préchargement images adjacentes
- [ ] Optimiser stratégie de cache
- [ ] Tests préchargement

### Phase 6: Swipe Mobile (Semaine 6)
- [ ] Implémenter détection swipe
- [ ] Intégrer avec navigation
- [ ] Gérer conflits zoom/swipe
- [ ] Tests mobile

### Phase 7: Slideshow (Optionnel, Semaine 7)
- [ ] Implémenter play() / pause()
- [ ] Auto-play au démarrage
- [ ] Pause au hover
- [ ] Bouton play/pause UI
- [ ] Tests slideshow

### Phase 8: Polissage et Documentation (Semaine 8)
- [ ] Optimisations performances
- [ ] Documentation API complète
- [ ] Exemples d'usage
- [ ] Tests accessibilité
- [ ] Tests cross-browser

---

## 🎯 Exemple d'Usage Final

```typescript
// Exemple complet avec toutes les options
const carousel = new zPhotoCarousel({
  // Options de base zPhotoZoom
  el: '.gallery img',
  min: 0.5,
  max: 8,

  // Options carousel
  carousel: true,
  loop: true,
  startIndex: 0,

  // Thumbnails
  enableThumbnails: true,
  thumbnailHeight: 120,
  thumbnailPosition: 'bottom',
  thumbnailsVisible: 5,

  // Navigation
  enableKeyboard: true,
  enableArrows: true,
  arrowPosition: 'center',

  // Transitions
  transition: 'slide',
  transitionDuration: 400,

  // Slideshow
  autoPlay: false,
  autoPlayInterval: 3000,
  pauseOnHover: true,

  // Préchargement
  preloadAdjacent: true,
  preloadAll: false,

  // Counter
  showCounter: true,
  counterPosition: 'top-right'
});

// Events
carousel.onOpen((event) => {
  console.log('Carousel opened at index:', carousel.getCurrentIndex());
});

carousel.onNavigate((event) => {
  console.log(`Navigating from ${event.from} to ${event.to}`);
  analytics.track('image_view', { index: event.to });
});

carousel.onSlideChange((event) => {
  console.log(`Now viewing image ${event.index + 1} of ${event.total}`);
});

// API publique
carousel.next();         // Image suivante
carousel.previous();     // Image précédente
carousel.goTo(5);        // Aller à l'index 5
carousel.first();        // Première image
carousel.last();         // Dernière image

carousel.play();         // Démarre slideshow
carousel.pause();        // Pause slideshow
carousel.togglePlay();   // Toggle play/pause

carousel.getCurrentIndex();  // 5
carousel.getTotalImages();   // 12
```

---

## 🔍 Compatibilité et Dégradation

### Support Navigateurs

Même support que zPhotoZoom actuel + :
- Keyboard Events API (supporté partout)
- Touch Events API (mobile)

### Dégradation Gracieuse

```typescript
// Détection support
const hasTouch = 'ontouchstart' in window;
const hasKeyboard = typeof KeyboardEvent !== 'undefined';

// Adaptation
const options = {
  enableKeyboard: hasKeyboard,
  enableSwipe: hasTouch
};
```

---

## 📏 Impact sur la Taille du Bundle

### Estimations

```
zPhotoZoom actuel:          ~15KB (minified + gzipped)

Avec carousel (tout inclus): ~28KB (minified + gzipped)
  - Core carousel:           +5KB
  - ThumbnailBar:           +3KB
  - KeyboardNav:            +1KB
  - Transitions:            +2KB
  - Preloader:              +1KB
  - CSS:                    +1KB

Avec tree-shaking (ESM):
  - Core only:              15KB (inchangé)
  - Core + Carousel simple: 20KB
  - Core + Full carousel:   28KB
```

### Optimisations

- Lazy loading des composants optionnels
- Tree-shaking via ESM
- Code splitting possible

```typescript
// Import dynamique
const { ThumbnailBar } = await import('./carousel/ThumbnailBar');
```

---

## ✅ Recommandation Finale

**Approche Recommandée: Extension par Composition**

1. **Créer package séparé** `zphotozoom-carousel`
2. **Utiliser zPhotoZoom comme dépendance**
3. **Export combiné** pour facilité d'usage

**Avantages:**
- ✅ zPhotoZoom reste léger pour usage simple
- ✅ Carousel optionnel pour besoins avancés
- ✅ Facilite maintenance et tests
- ✅ Permet évolution indépendante
- ✅ Meilleure modularité

**Structure packages:**
```
zphotozoom/               # Package principal (existant)
├── src/zphotozoom.ts
└── package.json

zphotozoom-carousel/      # Extension carousel (nouveau)
├── src/
│   ├── zPhotoCarousel.ts
│   ├── ThumbnailBar.ts
│   ├── KeyboardNav.ts
│   └── ...
├── package.json          # Dépend de zphotozoom
└── README.md

zphotozoom-full/          # Bundle complet (optionnel)
├── package.json          # Réexporte tout
└── Dépend de core + carousel
```

**Installation:**
```bash
# Core seulement
npm install zphotozoom

# Avec carousel
npm install zphotozoom zphotozoom-carousel

# Tout inclus
npm install zphotozoom-full
```

---

**Prêt à démarrer l'implémentation ?** 🚀
