# Script para publicar la biblioteca en el registro NPM privado
Write-Host "🚀 Publicando fintech-personal-common en el registro privado local..."
Write-Host "🔍 Validando especificaciones OpenAPI..."
npm run validate:specs
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Falló la validación de especificaciones OpenAPI. Abortando."
    exit 1
}

Write-Host "🏗️ Construyendo la biblioteca..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Falló la construcción. Abortando."
    exit 1
}

Write-Host "🧪 Ejecutando tests..."
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Falló la ejecución de tests. Abortando."
    exit 1
}

Write-Host "📦 Publicando paquete en el registro local..."
npm publish
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Falló la publicación. Verifica que Verdaccio esté ejecutándose en http://localhost:4873."
    exit 1
}

Write-Host "✅ La biblioteca ha sido publicada correctamente."
Write-Host "🔖 Versión publicada: $(npm view fintech-personal-common version)"
