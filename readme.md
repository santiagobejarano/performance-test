# PERFORMANCE TESTING - LOGIN SERVICE

## 📌 Descripción
Este proyecto implementa un **sistema completo de pruebas de performance** sobre el servicio de **login** de [FakeStore API](https://fakestoreapi.com/), utilizando la herramienta **K6**.  
El objetivo principal fue validar el comportamiento del servicio bajo carga de **20 TPS (transacciones por segundo)**, garantizando que los tiempos de respuesta y la tasa de error cumplan con los **SLA definidos**.

Se diseñó un flujo automatizado que incluye:
- Ejecución de pruebas de carga con K6.
- Parametrización de datos de usuarios mediante archivo CSV.
- Validaciones funcionales de respuesta.
- Generación de reportes personalizados en HTML.

---

## 🔧 1. Prerrequisitos

### Sistema
- **Sistema operativo**: Windows 10 o superior  
- **IDE recomendado**: IntelliJ IDEA 2023.1 o Visual Studio Code  

### Herramientas instaladas
1. **Node.js**  
   - Versión: `22.15.1`  
   - Incluye `npm` en versión `11.4.0`.  
   - Instalación realizada mediante instalador `.msi` de [Node.js](https://nodejs.org/).

   Verificación en consola:  
   ```bash
   node -v
   npm -v
   ```

2. **K6**  
   - Versión instalada: `k6.exe v1.2.3 (commit/e4a5a88f7c, go1.24.6, windows/amd64)`  
   - Instalación realizada mediante el instalador `.msi` de [K6](https://k6.io/docs/getting-started/installation/).

   Verificación en consola:  
   ```bash
   k6 version
   ```

---

## 📥 2. Instalación de dependencias

Inicializar proyecto con Node.js:

```bash
npm init -y
```

Instalar librerías necesarias para reportes:

```bash
npm install
```

*(En este caso el core del test se ejecuta con `k6.exe`, por lo que no es necesario instalar dependencias adicionales para la ejecución del test base.)*

---

## ▶️ 3. Instrucciones de ejecución

### Ejecución completa (incluye generación de reporte)
```bash
node run_complete_test.js
```

Este comando ejecuta:
1. El script principal de K6 (`login_test.js`).
2. Exporta los resultados a `summary.json`.
3. Genera un reporte HTML (`login_performance_report.html`).

### Ejecución por partes
- **Solo correr el test K6**:
  ```bash
  k6 run --summary-export=summary.json login_test.js
  ```
- **Solo generar el reporte**:
  ```bash
  node create_custom_report.js
  ```

---

## 📂 4. Archivos importantes del proyecto

- **`login_test.js`** → Script principal de K6 con:
  - Parametrización desde `users.csv`.
  - Configuración de carga constante a 20 TPS.
  - Validaciones de status `201` y presencia de `token`.
  - Thresholds de SLA (`p95 < 1500ms`, `error rate < 3%`).

- **`users.csv`** → Archivo de datos parametrizados con usuarios y contraseñas.  
  Ejemplo:
  ```csv
  user,passwd
  donero,ewedon
  kevinryan,kev02937@
  johnd,m38rmF$
  derek,jklg*_56
  mor_2314,83r5^_
  ```

- **`run_complete_test.js`** → Orquestador de la ejecución. Llama a `k6 run`, valida la creación de `summary.json` y genera el reporte HTML.

- **`create_custom_report.js`** → Generador de reportes visuales. Lee `summary.json` y produce `login_performance_report.html`.

- **`summary.json`** → Archivo con métricas exportadas automáticamente por K6.

- **`login_performance_report.html`** → Reporte visual con estadísticas, métricas y resultados del test.

---

## 📊 5. Reportes

Existen dos formas de revisar los resultados:

1. **Consola K6** → muestra métricas en tiempo real.  
   Ejemplo:
   ```
   http_req_duration..............: avg=350.22ms p(95)=365.41ms
   http_req_failed................: 0.00%
   iterations.....................: 1201 (≈20 req/s)
   ```

2. **Reporte HTML personalizado** → abrir con navegador:
   ```
   login_performance_report.html
   ```
   Contiene:
   - Tarjetas con métricas principales.
   - Validaciones SLA.
   - Gráficas de rendimiento.
   - Información de throughput, errores, latencia.

---

## ℹ️ 6. Información adicional

- Se cumplen los objetivos del ejercicio:
  - **20 TPS** alcanzados consistentemente.
  - **P95 < 1500 ms** → obtenido ~365 ms.
  - **Error rate < 3%** → obtenido 0.00%.
- El proyecto incluye **documentación completa** en este `README.md` y análisis en `conclusiones.txt`.
- La estructura permite ser ejecutada en **CI/CD pipelines** con exportación de métricas a JSON y reportes HTML.


---

👨‍💻 Autor: **Santiago Bejarano**  
📅 Fecha: Septiembre 2025