from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]


def remove_pale_background(image: Image.Image, *, floor: int, spread: int) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = pixels[x, y]
            low = min(r, g, b)
            high = max(r, g, b)
            if high - low <= spread:
                if low >= floor:
                    pixels[x, y] = (r, g, b, 0)
                elif low >= floor - 24:
                    alpha = int(255 * (floor - low) / 24)
                    pixels[x, y] = (r, g, b, alpha)
    return rgba


def trim_and_pad(image: Image.Image, padding: int = 18) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        image = image.crop(bbox)
    padded = Image.new("RGBA", (image.width + 2 * padding, image.height + 2 * padding))
    padded.alpha_composite(image, (padding, padding))
    return padded


meta_source = Image.open(
    r"C:\Users\alexa\AppData\Local\Temp\codex-clipboard-ec78b6c7-7a49-4973-9534-7a89456b6a7d.png"
)
meta = meta_source.crop((70, 22, 435, 255))
meta = trim_and_pad(remove_pale_background(meta, floor=190, spread=68), 22)
meta.save(ROOT / "assets" / "meta-loop-mark.png", optimize=True)

cinelli_source = Image.open(ROOT / "assets" / "cinelli-aero-visor-rider.jpg")
cinelli = cinelli_source.crop((30, 34, 310, 155))
cinelli = trim_and_pad(remove_pale_background(cinelli, floor=198, spread=48), 20)
cinelli.save(ROOT / "assets" / "cinelli-wordmark.png", optimize=True)
