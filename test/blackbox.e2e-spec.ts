import request from 'supertest';

const BASE_URL = process.env.API_URL ?? 'http://localhost:3000';
const api = () => request(BASE_URL);
const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tokenOf = (b: any): string => b?.access_token ?? b?.accessToken ?? b?.token;

const stamp = Date.now();
const PASS = 'Test1234!';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

const student = {
  email: `qa_${stamp}@test.com`,
  password: PASS,
  firstName: 'QA',
  lastNameP: 'Tester',
  lastNameM: 'Uno',
  institutionId: 0, // se llena en beforeAll
};

let studentToken = '';
let adminToken = '';
let researcherToken = '';
let researcherUserId = 0;
let researcherId = 0;
let pubId = 0;
let adminProvisionedViaOpenUsersRoute = false;

// IDs de lo que crea el test, para limpiarlo al final
const createdUserIds: number[] = [];
const createdResearcherIds: number[] = [];
const createdPublicationIds: number[] = [];

// Registra un estudiante y recuerda su ID para limpieza
async function register(body: Record<string, unknown>) {
  const res = await api().post('/auth/register/student').send(body);
  if (res.status === 201 && res.body?.userId) createdUserIds.push(res.body.userId);
  return res;
}

// Precondición para casos que requieren investigador/admin
function requireResearcher() {
  if (!researcherToken || !researcherUserId) {
    throw new Error(
      'NO VERIFICABLE: no se pudo obtener un investigador (sin ADMIN_EMAIL/ADMIN_PASSWORD y POST /users no permitió crear admin).',
    );
  }
}
function requireAdmin() {
  if (!adminToken) throw new Error('NO VERIFICABLE: no hay token de administrador.');
}

beforeAll(async () => {
  const inst = await api().get('/institutions');
  student.institutionId = inst.body?.[0]?.id;

  // ---- Obtener un admin ----
  if (ADMIN_EMAIL && ADMIN_PASS) {
    const a = await api().post('/auth/login').send({ email: ADMIN_EMAIL, password: ADMIN_PASS });
    adminToken = tokenOf(a.body) ?? '';
  }
  if (!adminToken) {
    // Plan B: POST /users sin guard (si existe ese defecto, esto funciona)
    const email = `qa_admin_${stamp}@test.com`;
    const c = await api().post('/users').send({ email, password: PASS, role: 'admin' });
    if ([200, 201].includes(c.status)) {
      adminProvisionedViaOpenUsersRoute = true;
      if (c.body?.id) createdUserIds.push(c.body.id);
      const l = await api().post('/auth/login').send({ email, password: PASS });
      adminToken = tokenOf(l.body) ?? '';
    }
  }

  // ---- Crear un investigador usando el admin ----
  if (adminToken) {
    const rEmail = `qa_res_${stamp}@test.com`;
    const cr = await api().post('/researchers').set(auth(adminToken))
      .send({ email: rEmail, password: PASS, firstName: 'QA', lastNameP: 'Res' });
    if ([200, 201].includes(cr.status)) {
      researcherId = cr.body?.id ?? 0;
      if (researcherId) createdResearcherIds.push(researcherId);
      const rl = await api().post('/auth/login').send({ email: rEmail, password: PASS });
      researcherToken = tokenOf(rl.body) ?? '';
      researcherUserId = rl.body?.user?.id ?? 0;
      if (researcherUserId) createdUserIds.push(researcherUserId);
    }
  }
});

afterAll(async () => {
  // Limpieza por HTTP (si la API protege estas rutas, falla en silencio)
  for (const id of createdPublicationIds) {
    await api().delete(`/publications/${id}`).set(auth(researcherToken || adminToken)).catch(() => undefined);
  }
  for (const id of createdResearcherIds) {
    await api().delete(`/researchers/${id}`).set(auth(adminToken)).catch(() => undefined);
  }
  for (const id of createdUserIds) {
    await api().delete(`/users/${id}`).set(auth(adminToken)).catch(() => undefined);
  }
  if (adminProvisionedViaOpenUsersRoute) {
    console.warn('AVISO: se creó un admin vía POST /users sin sesión (ver CP-36).');
  }
});

describe('Pruebas de caja negra - MiracleAPI', () => {
  // ================= RF-01: REGISTRO =================
  describe('RF-01 Registro de estudiante', () => {
    it('CP-01: registra estudiante con datos válidos (201)', async () => {
      const res = await register(student);
      expect(res.status).toBe(201);
    });
    it('CP-02: la respuesta no expone la contraseña', async () => {
      const res = await register({ ...student, email: `qa2_${stamp}@test.com` });
      expect(JSON.stringify(res.body).toLowerCase()).not.toContain('"password"');
    });
  });

  // ================= RV: VALIDACIONES =================
  describe('RV Validaciones de entrada', () => {
    it('CP-03: rechaza correo duplicado (400/409)', async () => {
      const res = await register(student);
      expect([400, 409]).toContain(res.status);
    });
    it('CP-04: rechaza correo con formato inválido (400)', async () => {
      const res = await register({ ...student, email: `juan${stamp}@` });
      expect(res.status).toBe(400);
    });
    it('CP-05: rechaza body vacío sin responder "correo ya registrado"', async () => {
      const res = await register({});
      expect(res.status).toBe(400);
      expect(JSON.stringify(res.body).toLowerCase()).not.toContain('ya está registrado');
    });
    it('CP-05b: rechaza registro sin nombre (400, no 500)', async () => {
      const res = await register({ ...student, email: `qa5b_${stamp}@test.com`, firstName: undefined });
      expect(res.status).toBe(400);
    });
    it('CP-06: rechaza institución inexistente (400/404, no 500)', async () => {
      const res = await register({ ...student, email: `qa3_${stamp}@test.com`, institutionId: 999999 });
      expect([400, 404]).toContain(res.status);
    });
    it('CP-07: rechaza JSON mal formado (400)', async () => {
      const res = await api().post('/auth/register/student')
        .set('Content-Type', 'application/json').send('{"email": ');
      expect(res.status).toBe(400);
    });
  });

  // ================= RF-02: LOGIN =================
  describe('RF-02 Login', () => {
    it('CP-08: login correcto devuelve token', async () => {
      const res = await api().post('/auth/login').send({ email: student.email, password: student.password });
      expect([200, 201]).toContain(res.status);
      studentToken = tokenOf(res.body);
      expect(studentToken).toBeDefined();
    });
    it('CP-09: contraseña incorrecta devuelve 401', async () => {
      const res = await api().post('/auth/login').send({ email: student.email, password: 'mal' });
      expect(res.status).toBe(401);
    });
    it('CP-10: usuario inexistente devuelve 401', async () => {
      const res = await api().post('/auth/login').send({ email: 'noexiste@x.com', password: 'abc12345' });
      expect(res.status).toBe(401);
    });
    it('CP-11: login con body vacío devuelve 400/401 (no 500)', async () => {
      const res = await api().post('/auth/login').send({});
      expect([400, 401]).toContain(res.status);
    });
  });

  // ================= RN: PERMISOS Y ROLES =================
  describe('RN-01 Rutas protegidas exigen sesión', () => {
    it('CP-12: /auth/profile sin token (401)', async () => {
      expect((await api().get('/auth/profile')).status).toBe(401);
    });
    it('CP-13: /auth/profile con token falso (401)', async () => {
      expect((await api().get('/auth/profile').set(auth('falso'))).status).toBe(401);
    });
    it('CP-14: /auth/profile con token válido (200)', async () => {
      expect((await api().get('/auth/profile').set(auth(studentToken))).status).toBe(200);
    });
    it('CP-15: GET /users sin token debe ser 401', async () => {
      expect((await api().get('/users')).status).toBe(401);
    });
    it('CP-16: GET /users no expone contraseñas (aun con token)', async () => {
      const res = await api().get('/users').set(auth(studentToken));
      expect(JSON.stringify(res.body).toLowerCase()).not.toContain('"password"');
    });
    it('CP-17: GET /contacts sin token debe ser 401', async () => {
      expect((await api().get('/contacts')).status).toBe(401);
    });
  });

  describe('RN-02 Permisos por rol (estudiante)', () => {
    it('CP-18: estudiante NO puede crear publicación (403)', async () => {
      const res = await api().post('/publications').set(auth(studentToken))
        .send({ title: 'x', description: 'x', authorId: 1 });
      expect(res.status).toBe(403);
    });
    it('CP-19: estudiante NO ve /publications/mine (403)', async () => {
      expect((await api().get('/publications/mine').set(auth(studentToken))).status).toBe(403);
    });
    it('CP-20: estudiante NO puede cambiar estado de publicación (403)', async () => {
      const res = await api().patch('/publications/1/status').set(auth(studentToken)).send({ status: false });
      expect(res.status).toBe(403);
    });
    it('CP-21: estudiante NO puede crear laboratorio (403)', async () => {
      const res = await api().post('/laboratories').set(auth(studentToken))
        .send({ name: `QA Lab ${stamp}`, description: 'x' }); // AJUSTA al DTO real
      expect(res.status).toBe(403);
    });
  });

  describe('RN-03 Escalada de privilegios', () => {
    it('CP-36: sin sesión NO se puede crear un usuario admin (401)', async () => {
      const res = await api().post('/users')
        .send({ email: `evil_${stamp}@test.com`, password: PASS, role: 'admin' });
      if ([200, 201].includes(res.status) && res.body?.id) createdUserIds.push(res.body.id);
      expect(res.status).toBe(401);
    });
    it('CP-37: sin sesión NO se puede eliminar un usuario (401)', async () => {
      const victim = await register({ ...student, email: `victim_${stamp}@test.com` });
      const res = await api().delete(`/users/${victim.body?.userId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('RN-04 Permisos sobre /researchers', () => {
    const body = { email: `x_${stamp}@test.com`, password: PASS, firstName: 'X', lastNameP: 'Y' };
    it('CP-38: sin sesión NO crea investigador (401)', async () => {
      expect((await api().post('/researchers').send(body)).status).toBe(401);
    });
    it('CP-39: estudiante NO crea investigador (403)', async () => {
      expect((await api().post('/researchers').set(auth(studentToken)).send(body)).status).toBe(403);
    });
    it('CP-40: admin SÍ crea investigador (201)', async () => {
      requireAdmin();
      const res = await api().post('/researchers').set(auth(adminToken))
        .send({ ...body, email: `y_${stamp}@test.com` });
      if ([200, 201].includes(res.status)) {
        if (res.body?.id) createdResearcherIds.push(res.body.id);
      }
      expect(res.status).toBe(201);
    });
    it('CP-41: estudiante NO puede editar un investigador (403)', async () => {
      const res = await api().patch(`/researchers/${researcherId || 1}`)
        .set(auth(studentToken)).send({ firstName: 'Hack' });
      expect(res.status).toBe(403);
    });
    it('CP-42: estudiante NO puede asociar disciplinas a un investigador (403)', async () => {
      const res = await api().post(`/researchers/${researcherId || 1}/disciplines/1`).set(auth(studentToken));
      expect(res.status).toBe(403);
    });
  });

  // ================= RF-03/04 + RP: CRUD Y CONSISTENCIA =================
  describe('RF-03/04 + RP CRUD de publicaciones y consistencia', () => {
    it('CP-22: investigador crea publicación (201)', async () => {
      requireResearcher();
      const res = await api().post('/publications').set(auth(researcherToken))
        .send({ title: `QA ${stamp}`, description: 'prueba', type: 'article', authorId: researcherUserId });
      expect(res.status).toBe(201);
      pubId = res.body?.id;
      if (pubId) createdPublicationIds.push(pubId);
      expect(pubId).toBeDefined();
    });
    it('CP-23: la publicación creada se consulta con los mismos datos', async () => {
      requireResearcher();
      const res = await api().get(`/publications/${pubId}`);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe(`QA ${stamp}`);
    });
    it('CP-24: aparece en el listado general', async () => {
      requireResearcher();
      const res = await api().get('/publications');
      expect(JSON.stringify(res.body)).toContain(`QA ${stamp}`);
    });
    it('CP-25: aparece en /publications/mine del investigador', async () => {
      requireResearcher();
      const res = await api().get('/publications/mine').set(auth(researcherToken));
      expect(JSON.stringify(res.body)).toContain(`QA ${stamp}`);
    });
    it('CP-26: modificar título se conserva al reconsultar', async () => {
      requireResearcher();
      await api().patch(`/publications/${pubId}`).set(auth(researcherToken)).send({ title: `QA edit ${stamp}` });
      const res = await api().get(`/publications/${pubId}`);
      expect(res.body.title).toBe(`QA edit ${stamp}`);
    });
    it('CP-27: cambiar estado se refleja al reconsultar', async () => {
      requireResearcher();
      await api().patch(`/publications/${pubId}/status`).set(auth(researcherToken)).send({ status: false });
      const res = await api().get(`/publications/${pubId}`);
      expect(res.body.status).toBe(false);
    });
    it('CP-28: usuario SIN sesión no puede modificar (401)', async () => {
      requireResearcher();
      const res = await api().patch(`/publications/${pubId}`).send({ title: 'hackeado' });
      expect(res.status).toBe(401);
    });
    it('CP-29: investigador no puede publicar a nombre de otro autor', async () => {
      requireResearcher();
      const res = await api().post('/publications').set(auth(researcherToken))
        .send({ title: `Suplantada ${stamp}`, description: 'x', authorId: researcherUserId + 9999 });
      if ([200, 201].includes(res.status) && res.body?.id) createdPublicationIds.push(res.body.id);
      expect([400, 403]).toContain(res.status);
    });
    it('CP-30: usuario SIN sesión no puede eliminar (401)', async () => {
      requireResearcher();
      const tmp = await api().post('/publications').set(auth(researcherToken))
        .send({ title: `Borrable ${stamp}`, description: 'x', authorId: researcherUserId });
      const tmpId = tmp.body?.id;
      if (tmpId) createdPublicationIds.push(tmpId);
      const res = await api().delete(`/publications/${tmpId}`);
      expect(res.status).toBe(401);
    });
    it('CP-31: eliminar y ya no se puede consultar (404)', async () => {
      requireResearcher();
      await api().delete(`/publications/${pubId}`).set(auth(researcherToken));
      expect((await api().get(`/publications/${pubId}`)).status).toBe(404);
    });
  });

  describe('RP-02 Consistencia de relaciones investigador-disciplina', () => {
    let disciplineId = 0;
    let disciplineName = '';
    beforeAll(async () => {
      const d = await api().get('/disciplines');
      disciplineId = d.body?.[0]?.id ?? 0;
      disciplineName = d.body?.[0]?.name ?? '';
    });
    it('CP-43: asociar disciplina se refleja al consultar al investigador', async () => {
      requireResearcher();
      if (!disciplineId || !researcherId) throw new Error('NO VERIFICABLE: faltan disciplinas o ID de investigador.');
      const add = await api().post(`/researchers/${researcherId}/disciplines/${disciplineId}`).set(auth(researcherToken));
      expect([200, 201]).toContain(add.status);
      const res = await api().get(`/researchers/${researcherId}`);
      expect(JSON.stringify(res.body)).toContain(disciplineName);
    });
    it('CP-44: desasociar disciplina la quita de la consulta', async () => {
      requireResearcher();
      if (!disciplineId || !researcherId) throw new Error('NO VERIFICABLE: faltan disciplinas o ID de investigador.');
      await api().delete(`/researchers/${researcherId}/disciplines/${disciplineId}`).set(auth(researcherToken));
      const res = await api().get(`/researchers/${researcherId}`);
      expect(JSON.stringify(res.body)).not.toContain(disciplineName);
    });
  });

  // ================= RE: ERRORES =================
  describe('RE Manejo de errores', () => {
    it('CP-32: ruta inexistente (404)', async () => {
      expect((await api().get('/ruta-que-no-existe')).status).toBe(404);
    });
    it('CP-33: ID inexistente en publications (404)', async () => {
      expect((await api().get('/publications/999999')).status).toBe(404);
    });
    it('CP-34: ID inexistente en researchers (404)', async () => {
      expect((await api().get('/researchers/999999')).status).toBe(404);
    });
    it('CP-35: ID no numérico devuelve 400, no 500', async () => {
      expect((await api().get('/publications/abc')).status).toBe(400);
    });
  });
});