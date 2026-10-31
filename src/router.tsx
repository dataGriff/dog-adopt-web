import { createBrowserRouter, type RouteObject } from 'react-router';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/Home';
import { DogDetailPage } from '@/pages/DogDetail';
import { RescuesPage } from '@/pages/Rescues';
import { RescueDetailPage } from '@/pages/RescueDetail';
import { AboutPage } from '@/pages/About';
import { NotFoundPage } from '@/pages/NotFound';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/dogs/:dogId', element: <DogDetailPage /> },
      { path: '/rescues', element: <RescuesPage /> },
      { path: '/rescues/:rescueId', element: <RescueDetailPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
