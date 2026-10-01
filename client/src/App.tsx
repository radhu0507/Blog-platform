import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { CreatePost } from './pages/CreatePost';
import { EditPost } from './pages/EditPost';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { MyPosts } from './pages/MyPosts';
import { NotFound } from './pages/NotFound';
import { PostDetails } from './pages/PostDetails';
import { Register } from './pages/Register';

export function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/posts/:id" element={<PostDetails />} />

        {/* Requires a signed-in user; otherwise ProtectedRoute redirects. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/posts/new" element={<CreatePost />} />
          <Route path="/posts/:id/edit" element={<EditPost />} />
          <Route path="/my-posts" element={<MyPosts />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}