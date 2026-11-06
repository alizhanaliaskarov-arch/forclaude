"""
Prepares the source photo (../full/variant-b-1536x1024.png, exported from Canva) for the video.

  1. Retouch: the AI image has a small oval badge on the nose, and the brief says "no logos".
     It is covered by the paint 46 px to the left (same panel, same light), feathered.
  2. public/img/car.jpg      1536x1024, clean
     public/img/car@2x.jpg   3072x2048, Lanczos + light unsharp mask (for close-ups)
  3. public/img/car-mask.png 3072x2048 soft alpha mask of the car (GrabCut, seeded by hand)
  4. public/img/drl.png      3072x2048 white daytime-running-light strips on transparent (for the glow)
  5. public/img/lines.png    3072x2048 thin "blueprint" edge lines inside the car (Canny)
  6. src/geometry.json       silhouette path (source px), its length, and hand-measured feature points

Usage: python3 scripts/prepare_image.py
"""
import json
import os

import cv2
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
SRC = os.path.normpath(os.path.join(ROOT, '..', 'full', 'variant-b-1536x1024.png'))
IMG = os.path.join(ROOT, 'public', 'img')
os.makedirs(IMG, exist_ok=True)

im = cv2.imread(SRC)
H, W = im.shape[:2]
assert (W, H) == (1536, 1024), (W, H)

# --- 1. retouch the badge -------------------------------------------------------------
clean = im.copy()
# (centre, axes, angle, horizontal source offset): oval badge on the nose, faint ornament in the grille
for centre, axes, ang, dx in [((360, 587), (22, 11), -4, 46), ((346, 639), (11, 14), 0, 40)]:
    spot = np.zeros((H, W), np.uint8)
    cv2.ellipse(spot, centre, axes, ang, 0, 360, 255, -1)
    shifted = np.roll(clean, dx, axis=1)  # value at x comes from x-dx: same panel, same light
    a = cv2.GaussianBlur(spot.astype(np.float32) / 255, (0, 0), 3.0)
    a = np.clip(a * 1.6, 0, 1)[..., None]
    clean = (clean * (1 - a) + shifted * a).round().astype(np.uint8)

cv2.imwrite(os.path.join(IMG, 'car.jpg'), clean, [cv2.IMWRITE_JPEG_QUALITY, 95])
rgb = Image.fromarray(cv2.cvtColor(clean, cv2.COLOR_BGR2RGB))
up = rgb.resize((W * 2, H * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=2))
up.save(os.path.join(IMG, 'car@2x.jpg'), quality=94, subsampling=0)

# --- 3. car mask ------------------------------------------------------------------------
# Hand-drawn outline (source px) used as "probably car"; GrabCut refines the edge.
outline = np.array([
    (182, 595), (186, 562), (196, 532), (210, 505), (232, 480), (268, 464), (304, 455), (400, 446),
    (505, 440), (512, 420), (522, 406), (548, 402), (566, 410), (580, 398), (625, 360), (690, 334),
    (800, 318), (930, 315), (1040, 327), (1150, 360), (1232, 400), (1290, 442), (1318, 492),
    (1330, 560), (1326, 640), (1310, 700), (1275, 714), (1212, 708), (1150, 702), (1000, 724),
    (962, 762), (944, 803), (900, 820), (860, 813), (830, 800), (800, 792), (560, 794), (330, 782),
    (200, 757), (170, 728), (178, 650),
], np.int32)
gc = np.full((H, W), cv2.GC_BGD, np.uint8)
cv2.fillPoly(gc, [outline], cv2.GC_PR_FGD)
ring = np.zeros((H, W), np.uint8)
cv2.polylines(ring, [outline], True, 255, 26)
gc[(ring > 0) & (gc == cv2.GC_BGD)] = cv2.GC_PR_BGD
core = np.zeros((H, W), np.uint8)
cv2.fillPoly(core, [outline], 255)
core = cv2.erode(core, np.ones((41, 41), np.uint8))
gc[core > 0] = cv2.GC_FGD
bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(clean, gc, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
mask = np.where((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
# the far hood, wing and the tyre bottom are as dark as the street: trust the hand outline there
poly = np.zeros((H, W), np.uint8)
cv2.fillPoly(poly, [outline], 255)
mask = np.maximum(mask, cv2.erode(poly, np.ones((7, 7), np.uint8)))
# keep the biggest blob, close small holes
n, lab, stats, _ = cv2.connectedComponentsWithStats(mask)
big = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
mask = np.where(lab == big, 255, 0).astype(np.uint8)
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
mask = np.zeros_like(mask)
cv2.drawContours(mask, cnts, -1, 255, -1)
cv2.imwrite(os.path.join(ROOT, 'out', 'mask-debug.png'), mask)

mask2 = cv2.resize(mask, (W * 2, H * 2), interpolation=cv2.INTER_LINEAR)
mask2 = cv2.GaussianBlur(mask2, (0, 0), 2.5)
rgba = np.zeros((H * 2, W * 2, 4), np.uint8)
rgba[..., :3] = 255
rgba[..., 3] = mask2  # CSS mask-image reads the alpha channel
Image.fromarray(rgba, 'RGBA').save(os.path.join(IMG, 'car-mask.png'))

# --- 4. DRL strips ------------------------------------------------------------------------
lum = cv2.cvtColor(clean, cv2.COLOR_BGR2GRAY).astype(np.float32)
drl = np.zeros((H, W), np.float32)
for (x0, y0, x1, y1) in [(540, 555, 790, 630), (180, 545, 240, 605)]:
    roi = lum[y0:y1, x0:x1]
    drl[y0:y1, x0:x1] = np.clip((roi - 150) / 90, 0, 1)
drl2 = cv2.resize(drl, (W * 2, H * 2), interpolation=cv2.INTER_CUBIC)
drl2 = np.clip(drl2, 0, 1)
# core strip + two pre-blurred bloom layers (cheaper than CSS blur on a 3072 px layer)
for name, sigma, boost in (('drl', 0, 1.0), ('drl-bloom', 9, 3.2), ('drl-glow', 32, 9.0)):
    a = drl2 if sigma == 0 else np.clip(cv2.GaussianBlur(drl2, (0, 0), sigma) * boost, 0, 1)
    rgba = np.zeros((H * 2, W * 2, 4), np.uint8)
    rgba[..., 0], rgba[..., 1], rgba[..., 2] = (236, 244, 255) if sigma < 20 else (170, 210, 255)
    rgba[..., 3] = (a * 255).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(os.path.join(IMG, f'{name}.png'))

# --- 5. blueprint lines ---------------------------------------------------------------------
g = cv2.GaussianBlur(cv2.cvtColor(clean, cv2.COLOR_BGR2GRAY), (0, 0), 1.2)
edges = cv2.Canny(g, 28, 70)
inner = cv2.erode(mask, np.ones((5, 5), np.uint8))
edges[inner == 0] = 0
edges2 = cv2.resize(edges, (W * 2, H * 2), interpolation=cv2.INTER_LINEAR)
edges2 = cv2.GaussianBlur(edges2, (0, 0), 0.7)
rgba = np.zeros((H * 2, W * 2, 4), np.uint8)
rgba[..., 0], rgba[..., 1], rgba[..., 2] = 210, 232, 255
rgba[..., 3] = np.clip(edges2.astype(np.float32) * 1.5, 0, 255).astype(np.uint8)
Image.fromarray(rgba, 'RGBA').save(os.path.join(IMG, 'lines.png'))

# --- 6. silhouette path + feature points ---------------------------------------------------
c = max(cnts, key=cv2.contourArea)
c = cv2.approxPolyDP(c, 1.2, True)[:, 0, :]
# start the path at the nose so the line "draws" from the front
start = int(np.argmin(c[:, 0]))
c = np.roll(c, -start, axis=0)
d = 'M' + ' L'.join(f'{x} {y}' for x, y in c) + ' Z'
seg = np.diff(np.vstack([c, c[:1]]).astype(np.float64), axis=0)
length = float(np.sum(np.hypot(seg[:, 0], seg[:, 1])))
ys, xs = np.nonzero(mask)
geometry = {
    'size': [W, H],
    'silhouette': {'d': d, 'length': round(length, 1)},
    'bbox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())],
}
with open(os.path.join(ROOT, 'src', 'geometry.json'), 'w') as f:
    json.dump(geometry, f, ensure_ascii=False, indent=1)

# --- 7. film grain tiles (mid-grey noise for an overlay blend) ------------------------------
rng = np.random.default_rng(3)
for i in range(6):
    g = rng.normal(128, 42, (512, 512))
    g = cv2.GaussianBlur(g, (0, 0), 0.6)
    Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).convert('RGB').save(os.path.join(IMG, f'grain-{i}.png'))
print('ok', geometry['bbox'], 'silhouette pts', len(c), 'len', round(length))
