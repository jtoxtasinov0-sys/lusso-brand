# Rasmni kichraytiradi (eng uzun tomoni 1200px, JPEG) va telefon
# suratlaridagi aylantirishni (EXIF) to'g'rilaydi. import.js chaqiradi.
param([string]$Src, [string]$Dst, [int]$Max = 1200, [long]$Quality = 82)

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($Src)
try {
  if ($img.PropertyIdList -contains 0x0112) {
    $o = [BitConverter]::ToUInt16($img.GetPropertyItem(0x0112).Value, 0)
    $flip = @{ 2 = 'RotateNoneFlipX'; 3 = 'Rotate180FlipNone'; 4 = 'Rotate180FlipX';
               5 = 'Rotate90FlipX'; 6 = 'Rotate90FlipNone'; 7 = 'Rotate270FlipX'; 8 = 'Rotate270FlipNone' }
    if ($flip.ContainsKey([int]$o)) { $img.RotateFlip([System.Drawing.RotateFlipType]$flip[[int]$o]) }
  }

  $scale = [Math]::Min(1.0, $Max / [Math]::Max($img.Width, $img.Height))
  $w = [int]($img.Width * $scale); $h = [int]($img.Height * $scale)

  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::White)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.SmoothingMode = 'HighQuality'
  $g.PixelOffsetMode = 'HighQuality'
  $g.DrawImage($img, 0, 0, $w, $h)
  $g.Dispose()

  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $params = New-Object System.Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $Quality
  $bmp.Save($Dst, $codec, $params)
  $bmp.Dispose()
} finally {
  $img.Dispose()
}
