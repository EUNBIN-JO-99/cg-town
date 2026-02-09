#!/usr/bin/env python3
"""
Tiled JSON 맵 생성기
코드로 타일맵을 생성합니다.
"""

import json
import os

# 맵 설정
MAP_WIDTH = 24   # 타일 개수 (가로)
MAP_HEIGHT = 12  # 타일 개수 (세로)
TILE_SIZE = 64   # 타일 크기 (px)

# 타일셋 설정 (1024x1024 이미지, 16x16 타일 그리드)
TILESET_TILE_COUNT = 256  # 16 * 16
TILESET_COLUMNS = 16

def create_tilemap():
    """기본 타일맵 생성 - 잔디 베이스 + 강"""

    # 레이어 데이터 생성
    # 0 = 빈 타일, 1부터 시작 = 타일 ID (Tiled 형식)

    # 베이스 레이어: 전체 잔디 (타일 ID 1 사용)
    base_layer = [1] * (MAP_WIDTH * MAP_HEIGHT)

    # 강 레이어: 특정 위치에 강 배치
    # 예: 맵 오른쪽에 세로로 강 배치
    water_layer = [0] * (MAP_WIDTH * MAP_HEIGHT)

    # 강 위치 설정 (x=20~23 열에 강)
    for y in range(MAP_HEIGHT):
        for x in range(20, 24):
            idx = y * MAP_WIDTH + x
            water_layer[idx] = 257  # river tileset 첫 번째 타일 (grass 256개 다음)

    # 경계 레이어: 잔디-강 경계
    edge_layer = [0] * (MAP_WIDTH * MAP_HEIGHT)

    # x=19 열에 경계 타일
    for y in range(MAP_HEIGHT):
        idx = y * MAP_WIDTH + 19
        edge_layer[idx] = 513  # edge tileset 첫 번째 타일

    # Tiled JSON 형식 맵 생성
    tilemap = {
        "compressionlevel": -1,
        "height": MAP_HEIGHT,
        "width": MAP_WIDTH,
        "infinite": False,
        "orientation": "orthogonal",
        "renderorder": "right-down",
        "tiledversion": "1.11.2",
        "tileheight": TILE_SIZE,
        "tilewidth": TILE_SIZE,
        "type": "map",
        "version": "1.10",
        "layers": [
            {
                "id": 1,
                "name": "ground",
                "type": "tilelayer",
                "visible": True,
                "opacity": 1,
                "x": 0,
                "y": 0,
                "width": MAP_WIDTH,
                "height": MAP_HEIGHT,
                "data": base_layer
            },
            {
                "id": 2,
                "name": "water",
                "type": "tilelayer",
                "visible": True,
                "opacity": 1,
                "x": 0,
                "y": 0,
                "width": MAP_WIDTH,
                "height": MAP_HEIGHT,
                "data": water_layer
            },
            {
                "id": 3,
                "name": "edge",
                "type": "tilelayer",
                "visible": True,
                "opacity": 1,
                "x": 0,
                "y": 0,
                "width": MAP_WIDTH,
                "height": MAP_HEIGHT,
                "data": edge_layer
            }
        ],
        "tilesets": [
            {
                "columns": TILESET_COLUMNS,
                "firstgid": 1,
                "image": "../images/tiles/workspace/grass.png",
                "imageheight": 1024,
                "imagewidth": 1024,
                "margin": 0,
                "name": "grass",
                "spacing": 0,
                "tilecount": TILESET_TILE_COUNT,
                "tileheight": TILE_SIZE,
                "tilewidth": TILE_SIZE
            },
            {
                "columns": TILESET_COLUMNS,
                "firstgid": 257,  # 256 + 1
                "image": "../images/tiles/workspace/river.png",
                "imageheight": 1024,
                "imagewidth": 1024,
                "margin": 0,
                "name": "river",
                "spacing": 0,
                "tilecount": TILESET_TILE_COUNT,
                "tileheight": TILE_SIZE,
                "tilewidth": TILE_SIZE
            },
            {
                "columns": TILESET_COLUMNS,
                "firstgid": 513,  # 512 + 1
                "image": "../images/tiles/workspace/grass_river_edge.png",
                "imageheight": 1024,
                "imagewidth": 1024,
                "margin": 0,
                "name": "grass_river_edge",
                "spacing": 0,
                "tilecount": TILESET_TILE_COUNT,
                "tileheight": TILE_SIZE,
                "tilewidth": TILE_SIZE
            }
        ]
    }

    return tilemap

def save_map(tilemap, output_path):
    """맵을 JSON 파일로 저장"""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(tilemap, f, indent=2)
    print(f"✅ 맵 저장 완료: {output_path}")

if __name__ == "__main__":
    # 맵 생성
    tilemap = create_tilemap()

    # 저장 경로
    output_path = "/Volumes/ELITE SE880/cg-town/frontend/public/maps/main.json"

    save_map(tilemap, output_path)

    print(f"""
맵 정보:
  - 크기: {MAP_WIDTH} x {MAP_HEIGHT} 타일
  - 타일 크기: {TILE_SIZE}px
  - 레이어: ground, water, edge
  - 타일셋: grass, river, grass_river_edge

Tiled에서 열어서 수정하실 수 있습니다:
  open -a Tiled "{output_path}"
""")
