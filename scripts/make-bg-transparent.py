from collections import deque
from pathlib import Path
from PIL import Image

BACKGROUNDS = Path(__file__).resolve().parent.parent / 'public' / 'backgrounds'
FILES = ['emas-crest.png', 'wmas-crest.png']


def make_white_background_transparent(path: Path, tolerance: int = 28) -> None:
    img = Image.open(path).convert('RGBA')
    w, h = img.size
    px = img.load()

    def is_background(r: int, g: int, b: int) -> bool:
        return r >= 255 - tolerance and g >= 255 - tolerance and b >= 255 - tolerance

    visited: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()

    for x in range(w):
        for y in (0, h - 1):
            if is_background(*px[x, y][:3]):
                queue.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_background(*px[x, y][:3]):
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        if (x, y) in visited:
            continue
        if x < 0 or x >= w or y < 0 or y >= h:
            continue
        r, g, b, _a = px[x, y]
        if not is_background(r, g, b):
            continue
        visited.add((x, y))
        px[x, y] = (r, g, b, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    img.save(path, 'PNG', optimize=True)
    print(f'Updated {path.name}: made {len(visited)} background pixels transparent')


def cleanup_white_fringe(path: Path, threshold: int = 218, passes: int = 8) -> None:
    img = Image.open(path).convert('RGBA')
    w, h = img.size
    px = img.load()
    cleared = 0

    for _ in range(passes):
        to_clear: list[tuple[int, int]] = []
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a == 0 or r < threshold or g < threshold or b < threshold:
                    continue
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                        to_clear.append((x, y))
                        break
        if not to_clear:
            break
        for x, y in to_clear:
            r, g, b, _a = px[x, y]
            px[x, y] = (r, g, b, 0)
            cleared += 1

    img.save(path, 'PNG', optimize=True)
    print(f'Fringe cleanup on {path.name}: cleared {cleared} edge pixels')


if __name__ == '__main__':
    for name in FILES:
        path = BACKGROUNDS / name
        if not path.exists():
            raise SystemExit(f'Missing {path}')
        make_white_background_transparent(path)
        cleanup_white_fringe(path)
