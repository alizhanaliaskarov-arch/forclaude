# Контактный лист: python3 sheet.py out.png img1.png img2.png ... (по 2 в ряд, с подписями)
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert('RGB').resize((720, 405)) for f in files]
rows = (len(ims) + 1) // 2
sheet = Image.new('RGB', (1440, rows * 405), 'black')
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % 2) * 720, (i // 2) * 405
    sheet.paste(im, (x, y))
    d.rectangle([x, y + 385, x + 160, y + 405], fill='black')
    d.text((x + 6, y + 388), f.split('/')[-1][:-4], fill='white')
sheet.save(out)
