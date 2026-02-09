#!/usr/bin/env python3
"""
심리스 타일 테스트 스크립트
이미지를 2x2로 이어붙여서 경계선이 보이는지 확인합니다.

사용법:
  python check_seamless.py grass.png
  python check_seamless.py river.png
  python check_seamless.py grass_river_edge.png
"""

import sys
from PIL import Image
import os

def check_seamless(img_path, output_suffix="_2x2"):
    """이미지를 2x2로 타일링해서 저장"""
    img = Image.open(img_path)
    w, h = img.size

    # 2x2로 이어붙인 새 이미지 생성
    new_img = Image.new('RGBA', (w * 2, h * 2))
    new_img.paste(img, (0, 0))
    new_img.paste(img, (w, 0))
    new_img.paste(img, (0, h))
    new_img.paste(img, (w, h))

    # 결과 저장
    base_name = os.path.splitext(img_path)[0]
    output_path = f"{base_name}{output_suffix}.png"
    new_img.save(output_path)
    print(f"✅ 저장 완료: {output_path}")
    print(f"   원본 크기: {w}x{h}")
    print(f"   결과 크기: {w*2}x{h*2}")

    # 이미지 열기 (macOS)
    os.system(f'open "{output_path}"')

    return output_path

def create_offset_preview(img_path):
    """오프셋 미리보기 (경계선을 중앙으로 이동)"""
    img = Image.open(img_path)
    w, h = img.size

    # 이미지를 절반씩 이동 (오프셋 효과)
    offset_img = Image.new('RGBA', (w, h))

    # 4등분해서 위치 바꾸기
    # 좌상 -> 우하, 우상 -> 좌하, 좌하 -> 우상, 우하 -> 좌상
    half_w, half_h = w // 2, h // 2

    top_left = img.crop((0, 0, half_w, half_h))
    top_right = img.crop((half_w, 0, w, half_h))
    bottom_left = img.crop((0, half_h, half_w, h))
    bottom_right = img.crop((half_w, half_h, w, h))

    offset_img.paste(bottom_right, (0, 0))
    offset_img.paste(bottom_left, (half_w, 0))
    offset_img.paste(top_right, (0, half_h))
    offset_img.paste(top_left, (half_w, half_h))

    # 결과 저장
    base_name = os.path.splitext(img_path)[0]
    output_path = f"{base_name}_offset.png"
    offset_img.save(output_path)
    print(f"✅ 오프셋 저장: {output_path}")
    print(f"   -> 중앙의 십자 경계선을 포토샵/GIMP에서 수정하세요")

    os.system(f'open "{output_path}"')

    return output_path

def slice_to_tiles(img_path, tile_size=64):
    """이미지를 64x64 타일로 자르기"""
    img = Image.open(img_path)
    w, h = img.size

    tiles_x = w // tile_size
    tiles_y = h // tile_size

    base_name = os.path.splitext(os.path.basename(img_path))[0]
    output_dir = f"{base_name}_tiles"
    os.makedirs(output_dir, exist_ok=True)

    count = 0
    for y in range(tiles_y):
        for x in range(tiles_x):
            left = x * tile_size
            top = y * tile_size
            tile = img.crop((left, top, left + tile_size, top + tile_size))
            tile.save(f"{output_dir}/tile_{y}_{x}.png")
            count += 1

    print(f"✅ {count}개 타일 생성: {output_dir}/")
    print(f"   타일 크기: {tile_size}x{tile_size}")

    return output_dir

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법:")
        print("  python check_seamless.py <이미지파일> [명령]")
        print("")
        print("명령:")
        print("  (없음)  - 2x2 타일링 테스트")
        print("  offset  - 오프셋 미리보기 (경계선을 중앙으로)")
        print("  slice   - 64x64 타일로 자르기")
        print("")
        print("예시:")
        print("  python check_seamless.py grass.png")
        print("  python check_seamless.py grass.png offset")
        print("  python check_seamless.py grass.png slice")
        sys.exit(1)

    img_path = sys.argv[1]
    command = sys.argv[2] if len(sys.argv) > 2 else "check"

    if not os.path.exists(img_path):
        print(f"❌ 파일을 찾을 수 없음: {img_path}")
        sys.exit(1)

    if command == "offset":
        create_offset_preview(img_path)
    elif command == "slice":
        slice_to_tiles(img_path)
    else:
        check_seamless(img_path)
