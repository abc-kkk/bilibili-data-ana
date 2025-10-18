#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# ==============================================================================
# Bilibili Chrome Extension Icon Converter (Python Version)
# ------------------------------------------------------------------------------
# 这个脚本可以将SVG矢量图标转换为Chrome插件所需的PNG格式图片。
#
# 使用方法:
# 1. 确保你安装了 Python 3 和 pip。
# 2. 安装所需的库。在终端或命令提示符中运行:
#    pip install svglib reportlab
# 3. 将这个脚本和所有 .svg 文件放在同一个文件夹中。
# 4. 运行脚本: python convert_icons.py
#
# 脚本会自动在当前目录下生成 icon16.png, icon48.png, 和 icon128.png。
# ==============================================================================

import os

try:
    from svglib.svglib import svg2rlg
    from reportlab.graphics import renderPM
except ImportError:
    print("错误: 'svglib' 或 'reportlab' 库未找到。")
    print("请先通过 'pip install svglib reportlab' 命令来安装它们。")
    exit(1)

def convert_icons():
    """
    查找并转换当前目录下的SVG图标文件。
    """
    print("开始转换SVG图标为PNG...")

    # 定义图标尺寸
    sizes = [16, 48, 128]
    success_count = 0
    fail_count = 0

    # 循环处理每个尺寸
    for size in sizes:
        input_file = f"icon{size}.svg"
        output_file = f"icon{size}.png"

        # 检查SVG源文件是否存在
        if os.path.exists(input_file):
            print(f"正在转换 {input_file} -> {output_file}")
            try:
                # 将SVG文件转换为ReportLab的图形对象
                drawing = svg2rlg(input_file)

                # 计算缩放比例以匹配目标尺寸
                if drawing.width and drawing.height:
                    scale_factor = size / drawing.width
                    drawing.scale(scale_factor, scale_factor)
                    drawing.width = size
                    drawing.height = size
                
                # 使用renderPM将图形对象渲染为PNG文件
                renderPM.drawToFile(drawing, output_file, fmt='PNG')
                success_count += 1
            except Exception as e:
                print(f"转换 {input_file} 时发生错误: {e}")
                fail_count += 1
        else:
            print(f"警告: 源文件 {input_file} 未找到，跳过。")
            fail_count += 1
    
    print("\n所有图标转换完成！")
    print(f"成功: {success_count}, 失败/跳过: {fail_count}")

if __name__ == "__main__":
    convert_icons()

