$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$wordDir = Join-Path $root "public\assets\thai-kingdom\words"
$audioDir = Join-Path $root "public\assets\thai-kingdom\audio"
New-Item -ItemType Directory -Force -Path $wordDir, $audioDir | Out-Null

$items = @(
  @{ id="ka"; word="กา"; emoji="🐦"; color="#FDE8F3" }, @{ id="kha"; word="ขา"; emoji="🦵"; color="#E7F7F2" },
  @{ id="cha"; word="ชา"; emoji="🍵"; color="#FFF1D6" }, @{ id="na"; word="นา"; emoji="🌾"; color="#EAF7E4" },
  @{ id="pa"; word="ปา"; emoji="🥎"; color="#E9E8FF" }, @{ id="fa"; word="ฝา"; emoji="🫙"; color="#E6F3FF" },
  @{ id="ya"; word="ยา"; emoji="💊"; color="#FDE8F3" }, @{ id="maa"; word="ม้า"; emoji="🐴"; color="#FFF1D6" },
  @{ id="khii"; word="ขี่"; emoji="🚲"; color="#E7F7F2" }, @{ id="chii"; word="ชี้"; emoji="☝️"; color="#FFF1D6" },
  @{ id="dii"; word="ดี"; emoji="👍"; color="#EAF7E4" }, @{ id="tii"; word="ตี"; emoji="🥁"; color="#FDE8F3" },
  @{ id="pii"; word="ปี"; emoji="📅"; color="#E6F3FF" }, @{ id="phii"; word="ผี"; emoji="👻"; color="#E9E8FF" },
  @{ id="mii"; word="มี"; emoji="🎁"; color="#FFF1D6" }, @{ id="sii"; word="สี"; emoji="🎨"; color="#FDE8F3" },
  @{ id="khuu"; word="คู่"; emoji="🧦"; color="#E6F3FF" }, @{ id="nguu"; word="งู"; emoji="🐍"; color="#EAF7E4" },
  @{ id="chuu"; word="ชู"; emoji="🙋"; color="#FFF1D6" }, @{ id="duu"; word="ดู"; emoji="👀"; color="#E9E8FF" },
  @{ id="puu"; word="ปู"; emoji="🦀"; color="#FDE8F3" }, @{ id="ruu"; word="รู"; emoji="🕳️"; color="#E6F3FF" },
  @{ id="huu"; word="หู"; emoji="👂"; color="#FFF1D6" }, @{ id="tuu"; word="ตู้"; emoji="🗄️"; color="#E7F7F2" }
)

foreach ($item in $items) {
  $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <rect width="320" height="320" rx="72" fill="$($item.color)"/>
  <circle cx="160" cy="150" r="108" fill="#ffffff" opacity=".82"/>
  <text x="160" y="205" text-anchor="middle" font-size="132" font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji">$($item.emoji)</text>
</svg>
"@
  Set-Content -LiteralPath (Join-Path $wordDir "$($item.id).svg") -Value $svg -Encoding utf8
}

$speaker = New-Object -ComObject SAPI.SpVoice
$thaiVoice = @($speaker.GetVoices()) | Where-Object { $_.GetDescription() -like "*Pattara*" } | Select-Object -First 1
if ($thaiVoice) { $speaker.Voice = $thaiVoice }
$speaker.Rate = -2
$speaker.Volume = 100
foreach ($item in $items) {
  $path = Join-Path $audioDir "$($item.id).wav"
  $stream = New-Object -ComObject SAPI.SpFileStream
  $stream.Open($path, 3, $false)
  $speaker.AudioOutputStream = $stream
  [void]$speaker.Speak($item.word)
  $stream.Close()
}

foreach ($vowel in @(@{id="aa"; text="สระอา"}, @{id="ii"; text="สระอี"}, @{id="uu"; text="สระอู"})) {
  $path = Join-Path $audioDir "vowel-$($vowel.id).wav"
  $stream = New-Object -ComObject SAPI.SpFileStream
  $stream.Open($path, 3, $false)
  $speaker.AudioOutputStream = $stream
  [void]$speaker.Speak($vowel.text)
  $stream.Close()
}

Write-Host "Generated $($items.Count) word images, $($items.Count) word audio files, and 3 vowel audio files."
