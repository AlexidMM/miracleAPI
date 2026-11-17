const API_URL = 'https://miracleapi.onrender.com/publications/nearby?lat=20.5888&lng=-100.3899&radius=10';
const CONCURRENCY = 30; // 30 usuarios simultáneos (Estrés)

async function ejecutarPruebaDeEstres() {
  console.log(`--- INICIANDO PRUEBA DE ESTRÉS CON ${CONCURRENCY} PETICIONES CONCURRENTES ---`);
  
  const promesas = [];
  const tiempos = [];
  let exitosas = 0;
  let fallidas = 0;

  const inicioGlobal = performance.now();

  // Lanzamos todas las peticiones al mismo tiempo
  for (let i = 0; i < CONCURRENCY; i++) {
    const inicioPeticion = performance.now();
    const promesa = fetch(API_URL)
      .then(async (res) => {
        const finPeticion = performance.now();
        const tiempo = finPeticion - inicioPeticion;
        tiempos.push(tiempo);
        
        if (res.ok) exitosas++;
        else fallidas++;
      })
      .catch(() => {
        fallidas++;
      });
    promesas.push(promesa);
  }

  // Esperamos a que todas terminen
  await Promise.all(promesas);
  const finGlobal = performance.now();
  const tiempoTotalSegundos = (finGlobal - inicioGlobal) / 1000;

  // Cálculos de métricas (P90, P95, Promedio, RPS)
  tiempos.sort((a, b) => a - b);
  const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
  const p90Index = Math.floor(tiempos.length * 0.90) - 1;
  const p95Index = Math.floor(tiempos.length * 0.95) - 1;
  
  const rps = CONCURRENCY / tiempoTotalSegundos;

  console.log('\n===== RESULTADOS DE LA PRUEBA =====');
  console.log(`Solicitudes Totales: ${CONCURRENCY}`);
  console.log(`Exitosas (HTTP 200): ${exitosas}`);
  console.log(`Fallidas (Errores):  ${fallidas}`);
  console.log(`RPS (Req per sec):   ${rps.toFixed(2)} peticiones/segundo`);
  console.log(`Tiempo Promedio:     ${promedio.toFixed(0)} ms`);
  console.log(`Latencia P90:        ${tiempos[p90Index]?.toFixed(0) || 0} ms`);
  console.log(`Latencia P95:        ${tiempos[p95Index]?.toFixed(0) || 0} ms`);
  console.log(`Tiempo Máximo:       ${tiempos[tiempos.length - 1]?.toFixed(0) || 0} ms`);
  console.log('===================================');
}

ejecutarPruebaDeEstres();