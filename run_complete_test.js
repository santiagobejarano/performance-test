const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando test de performance completo...\n');

try {
    // 1. Ejecutar el test de k6
    console.log('1️⃣ Ejecutando test de k6...');
    execSync('k6 run --summary-export=summary.json login_test.js', { stdio: 'inherit' });
    
    // 2. Verificar que se generó el summary
    if (!fs.existsSync('./summary.json')) {
        throw new Error('No se generó el archivo summary.json');
    }
    
    console.log('\n2️⃣ Generando reporte HTML personalizado...');
    
    // 3. Ejecutar el generador de reporte personalizado
    execSync('node create_custom_report.js', { stdio: 'inherit' });
    
    // 4. Mostrar resumen
    const summaryData = JSON.parse(fs.readFileSync('./summary.json', 'utf8'));
    const metrics = summaryData.metrics;
    
    console.log('\n🎉 ¡Test completado exitosamente!');
    console.log('================================');
    console.log(`📊 Total de requests: ${metrics.http_reqs.count}`);
    console.log(`⚡ Requests por segundo: ${metrics.http_reqs.rate.toFixed(2)}`);
    console.log(`⏱️  Tiempo promedio: ${metrics.http_req_duration.avg.toFixed(2)}ms`);
    console.log(`📈 P95: ${metrics.http_req_duration['p(95)'].toFixed(2)}ms`);
    console.log(`❌ Tasa de error: ${(metrics.http_req_failed.value * 100).toFixed(2)}%`);
    console.log('================================');
    console.log(`📁 Reporte disponible en: ${path.resolve('./login_performance_report.html')}`);
    console.log('👆 ¡Abre este archivo en tu navegador para ver el reporte completo!');
    
} catch (error) {
    console.error('\n❌ Error durante la ejecución:', error.message);
    process.exit(1);
}