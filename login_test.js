import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// 📌 Cargar usuarios y contraseñas desde CSV
// Archivo: users.csv con columnas: user,passwd
const users = new SharedArray('usuarios', function () {
  return open('./users.csv')
    .split('\n')
    .slice(1) // saltar encabezado
    .filter(line => line.trim() !== '')
    .map(line => {
      const [user, passwd] = line.split(',');
      return { user: user.trim(), passwd: passwd.trim() };
    });
});

// 📌 Configuración del test
export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 20,            // 20 peticiones por segundo
      timeUnit: '1s',
      duration: '1m',      // duración del test
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1500'], // 95% < 1.5s
    http_req_failed: ['rate<0.03'],    // error < 3%
  },
};

// 📌 Endpoint de login (ajusta si el curl original es diferente)
const BASE_URL = 'https://fakestoreapi.com/auth/login';

export default function () {
  // seleccionar un usuario aleatorio del CSV
  const user = users[Math.floor(Math.random() * users.length)];

  const payload = JSON.stringify({
    username: user.user,
    password: user.passwd,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(BASE_URL, payload, params);

  // 📌 Validaciones
  check(res, {
    'status es 201 (Created)': (r) => r.status === 201,
    'respuesta contiene token': (r) => r.json('token') !== undefined,
  });

  sleep(1);
}
