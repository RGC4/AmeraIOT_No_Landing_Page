from PIL import Image, ImageDraw, ImageFont

IMG = "screenshots/sitemap/"
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# --- geometry --------------------------------------------------------------
BW = 360                      # box width
TW, THh = 336, 189            # thumbnail area (16:9)
CAP = 50                      # caption strip
BH = THh + CAP                # box height = 239
PAD = (BW - TW) // 2          # 12

COL_PITCH = 450
LM = 60
TOPLEVEL_X = [LM + i * COL_PITCH for i in range(6)]   # 6 top-level columns

# colors
BLUE = (47, 111, 159)
LIGHTBLUE = (77, 159, 214)
LINE = (120, 140, 155)
BORDER = (190, 205, 218)
DARK = (31, 42, 51)
GREY = (90, 105, 118)
WHITE = (255, 255, 255)

f_title = ImageFont.truetype(FB, 40)
f_sub = ImageFont.truetype(FR, 22)
f_name = ImageFont.truetype(FB, 20)
f_path = ImageFont.truetype(FR, 16)


def thumb(path):
    im = Image.open(IMG + path).convert("RGB")
    # cover-crop to TW x THh (top aligned to keep header/hero)
    sw, sh = im.size
    scale = max(TW / sw, THh / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    im = im.resize((nw, nh), Image.LANCZOS)
    left = (nw - TW) // 2
    im = im.crop((left, 0, left + TW, THh))
    return im


boxes = []   # (x, y, label, path, img_file, header_color)
lines = []   # (x1,y1,x2,y2)


def add_box(x, y, label, path, img_file, color):
    boxes.append((x, y, label, path, img_file, color))


# Title space
TITLE_H = 130

# Home row
home_x = (LM + 5 * COL_PITCH + BW + LM - 360) // 2  # center over the 6 columns span
span_left = TOPLEVEL_X[0]
span_right = TOPLEVEL_X[5] + BW
home_x = (span_left + span_right - BW) // 2
home_y = TITLE_H
home_cx = home_x + BW // 2
home_bottom = home_y + BH
add_box(home_x, home_y, "Home", "/", "home.jpg", BLUE)

# bus + top-level row
bus_y = home_bottom + 55
row1_y = bus_y + 55
toplevel = [
    ("Platform", "/products", "products.jpg"),
    ("Industry Use Cases", "/industries", "industries.jpg"),
    ("Resources", "/resources", "resources.jpg"),
    ("News", "/news", "news.jpg"),
    ("Company", "/company", "company.jpg"),
    ("Contact Us", "/contact", "contact.jpg"),
]
centers = [x + BW // 2 for x in TOPLEVEL_X]
# home drop to bus
lines.append((home_cx, home_bottom, home_cx, bus_y))
# horizontal bus
lines.append((centers[0], bus_y, centers[-1], bus_y))
# drops to each top-level
for cx in centers:
    lines.append((cx, bus_y, cx, row1_y))
for i, (lbl, pth, img) in enumerate(toplevel):
    add_box(TOPLEVEL_X[i], row1_y, lbl, pth, img, LIGHTBLUE)
row1_bottom = row1_y + BH

CHILD_PITCH = BH + 45
child_top0 = row1_bottom + 60


def stack_children(parent_x, children, color):
    """vertical stack directly under parent_x with a left spine + stubs."""
    spine_x = parent_x + 16
    cx_left = parent_x + 24
    parent_cx = parent_x + BW // 2
    centers_y = []
    for k, (lbl, pth, img) in enumerate(children):
        cy_top = child_top0 + k * CHILD_PITCH
        add_box(cx_left, cy_top, lbl, pth, img, color)
        centers_y.append(cy_top + BH // 2)
    # spine from parent bottom to last child center
    lines.append((spine_x, row1_bottom, spine_x, centers_y[-1]))
    for cy in centers_y:
        lines.append((spine_x, cy, cx_left, cy))
    return child_top0 + (len(children) - 1) * CHILD_PITCH + BH


def two_col_children(parent_x, children, color):
    """split children into two columns (left/right) around a central spine."""
    parent_cx = parent_x + BW // 2
    left_x = parent_x
    right_x = parent_x + BW + 60
    spine_x = parent_x + BW + 30
    half = (len(children) + 1) // 2
    left = children[:half]
    right = children[half:]
    bottoms = []
    left_centers = []
    for k, (lbl, pth, img) in enumerate(left):
        cy_top = child_top0 + k * CHILD_PITCH
        add_box(left_x, cy_top, lbl, pth, img, color)
        left_centers.append(cy_top + BH // 2)
    right_centers = []
    for k, (lbl, pth, img) in enumerate(right):
        cy_top = child_top0 + k * CHILD_PITCH
        add_box(right_x, cy_top, lbl, pth, img, color)
        right_centers.append(cy_top + BH // 2)
    last_cy = max(left_centers[-1], right_centers[-1] if right_centers else 0)
    # drop from parent bottom to spine top
    lines.append((parent_cx, row1_bottom, parent_cx, row1_bottom + 30))
    lines.append((parent_cx, row1_bottom + 30, spine_x, row1_bottom + 30))
    lines.append((spine_x, row1_bottom + 30, spine_x, last_cy))
    for cy in left_centers:
        lines.append((left_x + BW, cy, spine_x, cy))
    for cy in right_centers:
        lines.append((spine_x, cy, right_x, cy))
    bottoms.append(child_top0 + (half - 1) * CHILD_PITCH + BH)
    bottoms.append(child_top0 + (len(right) - 1) * CHILD_PITCH + BH)
    return max(bottoms)


platform_children = [
    ("AmeraKey", "/products/amerakey", "amerakey.jpg"),
    ("AmeraSecrets", "/products/amerasecrets", "amerasecrets.jpg"),
]
company_children = [
    ("Vision & Mission", "/company/vision-and-mission", "vm.jpg"),
    ("Executive Team", "/company/executive-team", "exec.jpg"),
    ("Board of Advisors", "/company/board-of-advisors", "board.jpg"),
    ("Patents", "/company/patents", "patents.jpg"),
]
industry_children = [
    ("Manufacturing", "/industries/manufacturing", "ind-manufacturing.jpg"),
    ("Oil & Gas", "/industries/oil-gas", "ind-oil-gas.jpg"),
    ("Utilities", "/industries/utilities", "ind-utilities.jpg"),
    ("Financial Services", "/industries/financial-services", "ind-financial-services.jpg"),
    ("Government and Defense", "/industries/government-and-defense", "ind-government-and-defense.jpg"),
    ("Maritime", "/industries/maritime", "ind-maritime.jpg"),
    ("Life Sciences & Healthcare", "/industries/life-sciences-and-healthcare", "ind-life-sciences-and-healthcare.jpg"),
    ("Retail", "/industries/retail", "ind-retail.jpg"),
    ("Telecommunications", "/industries/telecommunications", "ind-telecommunications.jpg"),
    ("Transportation", "/industries/transportation", "ind-transportation.jpg"),
    ("IT & Agentic AI", "/industries/information-technology-agentic-ai", "ind-information-technology-agentic-ai.jpg"),
]

b1 = stack_children(TOPLEVEL_X[0], platform_children, (220, 238, 249))
b2 = two_col_children(TOPLEVEL_X[1], industry_children, (220, 238, 249))
b3 = stack_children(TOPLEVEL_X[4], company_children, (220, 238, 249))
max_bottom = max(b1, b2, b3)

W = span_right + LM
H = max_bottom + 60

# --- render ----------------------------------------------------------------
canvas = Image.new("RGB", (W, H), WHITE)
d = ImageDraw.Draw(canvas)

# title
d.text((LM, 36), "AMERA Website \u2014 Visual Site Map", font=f_title, fill=DARK)
d.text((LM, 88), "Connected site tree with live page screenshots", font=f_sub, fill=GREY)

# connectors first
for (x1, y1, x2, y2) in lines:
    d.line([(x1, y1), (x2, y2)], fill=LINE, width=3)


def rounded(draw, xy, r, fill=None, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)


for (x, y, label, path, img_file, color) in boxes:
    # card background + border
    rounded(d, [x, y, x + BW, y + BH], 10, fill=WHITE, outline=BORDER, width=2)
    # thumbnail
    th = thumb(img_file)
    canvas.paste(th, (x + PAD, y + PAD))
    d.rectangle([x + PAD, y + PAD, x + PAD + TW, y + PAD + THh], outline=BORDER, width=1)
    # caption strip
    cap_y = y + PAD + THh + 4
    d.text((x + PAD, cap_y), label, font=f_name, fill=DARK)
    d.text((x + PAD, cap_y + 24), path, font=f_path, fill=color if color not in (LIGHTBLUE,) else GREY)

OUT = "screenshots/sitemap_tree.png"
canvas.save(OUT)
print("saved", OUT, canvas.size)
