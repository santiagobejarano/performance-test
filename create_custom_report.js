const fs = require('fs');
const path = require('path');

function createCustomReport() {
    // Leer los datos del summary.json
    const summaryData = JSON.parse(fs.readFileSync('./summary.json', 'utf8'));
    const metrics = summaryData.metrics;
    const checks = summaryData.root_group.checks;
    
    // Obtener timestamp actual
    const now = new Date();
    const timestamp = now.toLocaleString('es-ES');
    
    // Preparar datos para el reporte
    const reportData = {
        timestamp: timestamp,
        totalRequests: metrics.http_reqs.count,
        requestsPerSecond: metrics.http_reqs.rate.toFixed(2),
        avgResponseTime: metrics.http_req_duration.avg.toFixed(2),
        minResponseTime: metrics.http_req_duration.min.toFixed(2),
        maxResponseTime: metrics.http_req_duration.max.toFixed(2),
        p90ResponseTime: metrics.http_req_duration['p(90)'].toFixed(2),
        p95ResponseTime: metrics.http_req_duration['p(95)'].toFixed(2),
        errorRate: (metrics.http_req_failed.value * 100).toFixed(2),
        totalIterations: metrics.iterations.count,
        iterationsPerSecond: metrics.iterations.rate.toFixed(2),
        minVUs: metrics.vus.min,
        maxVUs: metrics.vus.max,
        maxVUsConfig: metrics.vus_max.value,
        dataReceived: (metrics.data_received.count / 1024).toFixed(2), // KB
        dataSent: (metrics.data_sent.count / 1024).toFixed(2), // KB
        checksTotal: checks['status es 201 (Created)'].passes + checks['status es 201 (Created)'].fails + checks['respuesta contiene token'].passes + checks['respuesta contiene token'].fails,
        checksPassed: checks['respuesta contiene token'].passes + checks['status es 201 (Created)'].passes,
        checksFailed: checks['status es 201 (Created)'].fails + checks['respuesta contiene token'].fails,
        checksSuccessRate: (((checks['respuesta contiene token'].passes + checks['status es 201 (Created)'].passes) / (checks['respuesta contiene token'].passes + checks['respuesta contiene token'].fails + checks['status es 201 (Created)'].passes + checks['status es 201 (Created)'].fails)) * 100).toFixed(1)
    };

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Performance - Login Test</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            border-left: 5px solid #2196F3;
            transition: transform 0.3s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .metric-title {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        
        .metric-unit {
            font-size: 0.8em;
            color: #888;
            margin-left: 5px;
        }
        
        .status-good { color: #4CAF50; }
        .status-warning { color: #FF9800; }
        .status-error { color: #F44336; }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 1.5em;
            color: #333;
            margin-bottom: 20px;
            border-bottom: 2px solid #2196F3;
            padding-bottom: 10px;
        }
        
        .checks-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .checks-table th,
        .checks-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .checks-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        
        .check-passed { color: #4CAF50; font-weight: bold; }
        .check-failed { color: #F44336; font-weight: bold; }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
            transition: width 0.3s ease;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
        
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .stat-box {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-number {
            font-size: 1.8em;
            font-weight: bold;
            color: #2196F3;
            display: block;
        }
        
        .stat-label {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Reporte de Performance</h1>
            <p>Login Test - Generado el ${reportData.timestamp}</p>
        </div>
        
        <div class="content">
            <!-- Resumen General -->
            <div class="section">
                <h2 class="section-title">📊 Resumen Ejecutivo</h2>
                <div class="summary-stats">
                    <div class="stat-box">
                        <span class="stat-number">${reportData.totalRequests}</span>
                        <div class="stat-label">Total Requests</div>
                    </div>
                    <div class="stat-box">
                        <span class="stat-number">${reportData.requestsPerSecond}</span>
                        <div class="stat-label">Requests/seg</div>
                    </div>
                    <div class="stat-box">
                        <span class="stat-number ${reportData.errorRate > 3 ? 'status-error' : 'status-good'}">${reportData.errorRate}%</span>
                        <div class="stat-label">Tasa de Error</div>
                    </div>
                    <div class="stat-box">
                        <span class="stat-number">${reportData.avgResponseTime}</span>
                        <div class="stat-label">Tiempo Respuesta Promedio (ms)</div>
                    </div>
                </div>
            </div>

            <!-- Métricas de Performance -->
            <div class="section">
                <h2 class="section-title">⚡ Métricas de Performance</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-title">Tiempo de Respuesta HTTP</div>
                        <div class="metric-value">${reportData.avgResponseTime}<span class="metric-unit">ms</span></div>
                        <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                            Min: ${reportData.minResponseTime}ms | Max: ${reportData.maxResponseTime}ms<br>
                            P90: ${reportData.p90ResponseTime}ms | P95: ${reportData.p95ResponseTime}ms
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-title">Throughput</div>
                        <div class="metric-value">${reportData.requestsPerSecond}<span class="metric-unit">req/s</span></div>
                        <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                            Total de ${reportData.totalRequests} requests procesados
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-title">Usuarios Virtuales</div>
                        <div class="metric-value">${reportData.maxVUs}<span class="metric-unit">VUs</span></div>
                        <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                            Rango: ${reportData.minVUs} - ${reportData.maxVUs} VUs activos
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-title">Tasa de Error</div>
                        <div class="metric-value ${reportData.errorRate > 3 ? 'status-error' : 'status-good'}">${reportData.errorRate}<span class="metric-unit">%</span></div>
                        <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                            Threshold: < 3% ${reportData.errorRate <= 3 ? '✅' : '❌'}
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-title">Datos Transferidos</div>
                        <div class="metric-value">${reportData.dataReceived}<span class="metric-unit">KB</span></div>
                        <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                            Enviados: ${reportData.dataSent}KB
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-title">Iteraciones</div>
                        <div class="metric-value">${reportData.totalIterations}</div>
                        <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                            ${reportData.iterationsPerSecond} iteraciones/segundo
                        </div>
                    </div>
                </div>
            </div>

            <!-- Validaciones -->
            <div class="section">
                <h2 class="section-title">✅ Validaciones y Checks</h2>
                <div style="margin-bottom: 20px;">
                    <strong>Tasa de Éxito General: ${reportData.checksSuccessRate}%</strong>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${reportData.checksSuccessRate}%"></div>
                    </div>
                </div>
                
                <table class="checks-table">
                    <thead>
                        <tr>
                            <th>Check</th>
                            <th>Pasaron</th>
                            <th>Fallaron</th>
                            <th>Tasa de Éxito</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Status es 201 (Created)</td>
                            <td class="check-passed">${checks['status es 201 (Created)'].passes}</td>
                            <td class="check-failed">${checks['status es 201 (Created)'].fails}</td>
                            <td>${((checks['status es 201 (Created)'].passes / (checks['status es 201 (Created)'].passes + checks['status es 201 (Created)'].fails)) * 100).toFixed(1)}%</td>
                            <td>${checks['status es 201 (Created)'].passes > 0 ? '✅' : '❌'}</td>
                        </tr>
                        <tr>
                            <td>Respuesta contiene token</td>
                            <td class="check-passed">${checks['respuesta contiene token'].passes}</td>
                            <td class="check-failed">${checks['respuesta contiene token'].fails}</td>
                            <td>${((checks['respuesta contiene token'].passes / (checks['respuesta contiene token'].passes + checks['respuesta contiene token'].fails)) * 100).toFixed(1)}%</td>
                            <td>${checks['respuesta contiene token'].passes > 0 ? '✅' : '❌'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Thresholds -->
            <div class="section">
                <h2 class="section-title">🎯 Thresholds</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-title">P95 Response Time</div>
                        <div class="metric-value ${reportData.p95ResponseTime < 1500 ? 'status-good' : 'status-error'}">${reportData.p95ResponseTime}ms</div>
                        <div style="margin-top: 10px; font-size: 0.9em;">
                            Threshold: < 1500ms ${reportData.p95ResponseTime < 1500 ? '✅ PASSED' : '❌ FAILED'}
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-title">Error Rate</div>
                        <div class="metric-value ${reportData.errorRate < 3 ? 'status-good' : 'status-error'}">${reportData.errorRate}%</div>
                        <div style="margin-top: 10px; font-size: 0.9em;">
                            Threshold: < 3% ${reportData.errorRate < 3 ? '✅ PASSED' : '❌ FAILED'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>📈 Reporte generado con k6 Performance Testing | ${timestamp}</p>
            <p>🔧 Script: login_test.js | Endpoint: https://fakestoreapi.com/auth/login</p>
        </div>
    </div>
</body>
</html>`;

    return htmlContent;
}

// Crear el reporte
try {
    const reportContent = createCustomReport();
    const outputPath = './login_performance_report.html';
    
    fs.writeFileSync(outputPath, reportContent);
    console.log(`✅ Reporte personalizado creado exitosamente: ${path.resolve(outputPath)}`);
    console.log(`📊 Abre el archivo en tu navegador para ver el reporte completo y funcional`);
    
} catch (error) {
    console.error('❌ Error al crear el reporte:', error.message);
}