# Script PowerShell pour mettre à jour les couleurs du site
# Noir Or Beige palette

$files = Get-ChildItem -Path "src/app/components" -Filter "*.html" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Remplacement des dégradés bleu-purple-pink par gold-beige
    $content = $content -replace 'from-blue-600 via-purple-600 to-pink-600', 'from-gold-500 via-gold-600 to-beige-700'
    $content = $content -replace 'from-blue-600 to-purple-600', 'from-gold-500 to-gold-700'
    $content = $content -replace 'from-purple-600 to-pink-600', 'from-gold-600 to-beige-800'
    $content = $content -replace 'from-pink-600 to-blue-600', 'from-beige-800 to-gold-500'
    $content = $content -replace 'from-blue-600 to-blue-700', 'from-gold-500 to-gold-600'
    $content = $content -replace 'from-purple-600 to-pink-600', 'from-gold-600 to-gold-700'

    # Backgrounds
    $content = $content -replace 'from-blue-50 via-white to-purple-50', 'from-beige-50 via-white to-beige-100'
    $content = $content -replace 'from-blue-50 to-transparent', 'from-beige-100 to-transparent'
    $content = $content -replace 'from-blue-100 to-purple-100', 'from-gold-100 to-beige-200'
    $content = $content -replace 'from-purple-100 to-pink-100', 'from-gold-200 to-beige-300'
    $content = $content -replace 'from-pink-100 to-orange-100', 'from-beige-200 to-gold-200'
    $content = $content -replace 'from-white to-blue-50', 'from-white to-beige-50'
    $content = $content -replace 'from-white to-purple-50', 'from-white to-beige-100'
    $content = $content -replace 'from-blue-50 to-purple-50', 'from-beige-50 to-beige-100'

    # Textes
    $content = $content -replace 'text-blue-600', 'text-gold-600'
    $content = $content -replace 'text-blue-400', 'text-gold-400'
    $content = $content -replace 'text-purple-600', 'text-gold-700'
    $content = $content -replace 'text-purple-400', 'text-gold-500'
    $content = $content -replace 'text-pink-600', 'text-beige-800'
    $content = $content -replace 'hover:text-blue-600', 'hover:text-gold-600'
    $content = $content -replace 'hover:text-blue-700', 'hover:text-gold-700'
    $content = $content -replace 'hover:text-purple-600', 'hover:text-gold-700'
    $content = $content -replace 'hover:text-pink-600', 'hover:text-gold-600'

    # Borders
    $content = $content -replace 'border-purple-500', 'border-gold-500'
    $content = $content -replace 'border-blue-500', 'border-gold-500'
    $content = $content -replace 'border-blue-200', 'border-beige-200'
    $content = $content -replace 'border-purple-200', 'border-beige-300'
    $content = $content -replace 'border-t-4 border-blue-500', 'border-t-4 border-gold-500'
    $content = $content -replace 'border-t-4 border-purple-500', 'border-t-4 border-gold-600'
    $content = $content -replace 'border-t-4 border-pink-500', 'border-t-4 border-beige-700'

    # Backgrounds gradients pour cards
    $content = $content -replace 'bg-blue-100', 'bg-gold-100'
    $content = $content -replace 'bg-purple-100', 'bg-beige-100'
    $content = $content -replace 'bg-pink-100', 'bg-beige-200'
    $content = $content -replace 'bg-blue-200/30', 'bg-gold-200/30'
    $content = $content -replace 'bg-purple-200/30', 'bg-beige-300/30'
    $content = $content -replace 'bg-pink-200/20', 'bg-gold-300/20'
    $content = $content -replace 'bg-blue-300/20', 'bg-gold-300/20'
    $content = $content -replace 'bg-purple-300/20', 'bg-beige-300/20'
    $content = $content -replace 'bg-pink-300/20', 'bg-gold-400/20'

    # Backgrounds process
    $content = $content -replace 'bg-purple-200/20', 'bg-beige-200/20'
    $content = $content -replace 'bg-blue-200/20', 'bg-gold-200/20'

    # Buttons et badges
    $content = $content -replace 'from-blue-600 to-purple-600 text-white', 'from-gold-500 to-gold-700 text-black'
    $content = $content -replace 'from-purple-600 to-pink-600', 'from-gold-600 to-beige-800'

    # Process timeline
    $content = $content -replace 'from-blue-600 to-purple-600', 'from-gold-500 to-beige-700'
    $content = $content -replace 'from-blue-400 to-purple-400', 'from-gold-400 to-beige-600'

    # Text colors about
    $content = $content -replace 'text-blue-500 to-blue-600', 'text-gold-500 to-gold-600'
    $content = $content -replace 'from-purple-500 to-purple-600', 'from-gold-600 to-gold-700'
    $content = $content -replace 'from-pink-500 to-pink-600', 'from-beige-700 to-beige-800'
    $content = $content -replace 'from-orange-500 to-orange-600', 'from-gold-500 to-gold-600'
    $content = $content -replace 'from-indigo-500 to-indigo-600', 'from-beige-600 to-beige-700'

    # Hover colors
    $content = $content -replace 'hover:from-blue-200 hover:to-blue-300', 'hover:from-gold-200 hover:to-gold-300'
    $content = $content -replace 'hover:from-purple-200 hover:to-purple-300', 'hover:from-gold-300 hover:to-gold-400'
    $content = $content -replace 'hover:from-pink-200 hover:to-pink-300', 'hover:from-beige-300 hover:to-beige-400'
    $content = $content -replace 'hover:from-orange-200 hover:to-orange-300', 'hover:from-gold-200 hover:to-gold-300'
    $content = $content -replace 'hover:from-indigo-200 hover:to-indigo-300', 'hover:from-beige-300 hover:to-beige-400'

    # Footer
    $content = $content -replace 'from-blue-400 via-purple-400 to-pink-400', 'from-gold-400 via-gold-500 to-beige-600'
    $content = $content -replace 'from-blue-400 to-purple-400', 'from-gold-400 to-gold-600'
    $content = $content -replace 'text-blue-400', 'text-gold-400'
    $content = $content -replace 'text-purple-400', 'text-gold-500'

    # Services big numbers
    $content = $content -replace 'text-blue-600 mb-1', 'text-gold-600 mb-1'
    $content = $content -replace 'text-pink-600 mb-1', 'text-gold-700 mb-1'

    Set-Content -Path $file.FullName -Value $content
}

Write-Host "Couleurs mises à jour dans tous les fichiers HTML!" -ForegroundColor Green
