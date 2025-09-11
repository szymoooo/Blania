#!/usr/bin/env python3
"""
Skrypt do optymalizacji obrazów PNG
Konwertuje PNG do WebP i optymalizuje rozmiary
"""

import os
import subprocess
import sys
from PIL import Image
import io

def check_dependencies():
    """Sprawdza czy są zainstalowane wymagane biblioteki"""
    try:
        import PIL
        print("✅ PIL (Pillow) jest zainstalowane")
    except ImportError:
        print("❌ PIL (Pillow) nie jest zainstalowane")
        print("Zainstaluj: pip install Pillow")
        return False
    
    # Sprawdź czy cwebp jest dostępne
    try:
        subprocess.run(['cwebp', '-version'], capture_output=True, check=True)
        print("✅ cwebp jest zainstalowane")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️ cwebp nie jest zainstalowane - używam PIL do konwersji")
    
    return True

def optimize_png_to_webp(input_path, output_path, quality=85):
    """Konwertuje PNG do WebP z optymalizacją"""
    try:
        with Image.open(input_path) as img:
            # Konwertuj do RGB jeśli ma przezroczystość
            if img.mode in ('RGBA', 'LA'):
                # Stwórz białe tło
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'RGBA':
                    background.paste(img, mask=img.split()[-1])
                else:
                    background.paste(img)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Zapisz jako WebP
            img.save(output_path, 'WebP', quality=quality, optimize=True)
            
            # Pobierz rozmiary
            original_size = os.path.getsize(input_path)
            new_size = os.path.getsize(output_path)
            reduction = ((original_size - new_size) / original_size) * 100
            
            print(f"✅ {os.path.basename(input_path)}: {original_size/1024:.1f}KB → {new_size/1024:.1f}KB ({reduction:.1f}% mniej)")
            return True
            
    except Exception as e:
        print(f"❌ Błąd konwersji {input_path}: {e}")
        return False

def optimize_png(input_path, output_path, quality=95):
    """Optymalizuje PNG bez zmiany formatu"""
    try:
        with Image.open(input_path) as img:
            # Zapisz z optymalizacją
            img.save(output_path, 'PNG', optimize=True, compress_level=9)
            
            # Pobierz rozmiary
            original_size = os.path.getsize(input_path)
            new_size = os.path.getsize(output_path)
            reduction = ((original_size - new_size) / original_size) * 100
            
            print(f"✅ {os.path.basename(input_path)}: {original_size/1024:.1f}KB → {new_size/1024:.1f}KB ({reduction:.1f}% mniej)")
            return True
            
    except Exception as e:
        print(f"❌ Błąd optymalizacji {input_path}: {e}")
        return False

def resize_large_images(input_path, output_path, max_width=800, max_height=600):
    """Zmniejsza rozmiar dużych obrazów"""
    try:
        with Image.open(input_path) as img:
            # Sprawdź czy obraz jest za duży
            if img.width > max_width or img.height > max_height:
                # Oblicz nowe wymiary zachowując proporcje
                ratio = min(max_width/img.width, max_height/img.height)
                new_width = int(img.width * ratio)
                new_height = int(img.height * ratio)
                
                # Zmniejsz obraz
                img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                img_resized.save(output_path, 'PNG', optimize=True, compress_level=9)
                
                original_size = os.path.getsize(input_path)
                new_size = os.path.getsize(output_path)
                reduction = ((original_size - new_size) / original_size) * 100
                
                print(f"📏 {os.path.basename(input_path)}: {img.width}x{img.height} → {new_width}x{new_height} ({original_size/1024:.1f}KB → {new_size/1024:.1f}KB, {reduction:.1f}% mniej)")
                return True
            else:
                # Skopiuj bez zmian
                img.save(output_path, 'PNG', optimize=True, compress_level=9)
                print(f"📏 {os.path.basename(input_path)}: rozmiar OK, tylko optymalizacja")
                return True
                
    except Exception as e:
        print(f"❌ Błąd zmiany rozmiaru {input_path}: {e}")
        return False

def main():
    print("🚀 Optymalizacja obrazów PNG")
    print("=" * 50)
    
    if not check_dependencies():
        return
    
    # Utwórz katalogi
    os.makedirs('optimized', exist_ok=True)
    os.makedirs('webp', exist_ok=True)
    
    png_files = [f for f in os.listdir('.') if f.endswith('.png')]
    
    if not png_files:
        print("❌ Nie znaleziono plików PNG")
        return
    
    print(f"📁 Znaleziono {len(png_files)} plików PNG")
    print()
    
    total_original = 0
    total_optimized = 0
    total_webp = 0
    
    for png_file in png_files:
        print(f"🔄 Przetwarzanie: {png_file}")
        
        # 1. Optymalizuj PNG
        optimized_png = f"optimized/{png_file}"
        if optimize_png(png_file, optimized_png):
            total_original += os.path.getsize(png_file)
            total_optimized += os.path.getsize(optimized_png)
        
        # 2. Zmniejsz duże obrazy
        resized_png = f"optimized/resized_{png_file}"
        if resize_large_images(optimized_png, resized_png):
            # Zastąp zoptymalizowany plik zmniejszonym
            os.replace(resized_png, optimized_png)
        
        # 3. Konwertuj do WebP
        webp_file = f"webp/{png_file.replace('.png', '.webp')}"
        if optimize_png_to_webp(optimized_png, webp_file):
            total_webp += os.path.getsize(webp_file)
        
        print()
    
    # Podsumowanie
    print("📊 PODSUMOWANIE:")
    print(f"   Oryginalne PNG: {total_original/1024:.1f}KB")
    print(f"   Zoptymalizowane PNG: {total_optimized/1024:.1f}KB")
    print(f"   WebP: {total_webp/1024:.1f}KB")
    
    png_reduction = ((total_original - total_optimized) / total_original) * 100
    webp_reduction = ((total_original - total_webp) / total_original) * 100
    
    print(f"   Redukcja PNG: {png_reduction:.1f}%")
    print(f"   Redukcja WebP: {webp_reduction:.1f}%")
    
    print()
    print("✅ Optymalizacja zakończona!")
    print("📁 Sprawdź katalogi 'optimized/' i 'webp/'")

if __name__ == "__main__":
    main()
