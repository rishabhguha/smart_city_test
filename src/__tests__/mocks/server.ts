import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Default handlers used by component tests. Override per-test with server.use().
export const server = setupServer(
  http.get('/api/categories', () =>
    HttpResponse.json([
      { id: 'cat_1', name: 'Pothole', departmentName: 'Public Works' },
      { id: 'cat_2', name: 'Streetlight Out', departmentName: 'DPW Lighting' },
    ])
  ),

  http.get('/api/me', () =>
    HttpResponse.json({ id: 'user_1', role: 'citizen', name: 'Test User' })
  ),

  http.post('/api/requests', () =>
    HttpResponse.json({ id: 'req_new' }, { status: 201 })
  ),

  http.post('/api/upload', () =>
    HttpResponse.json({ url: 'https://blob.vercel.app/test.jpg' })
  ),
);
