import { useState } from 'react';
import { registerUser } from '../services/auth.service';

const Register = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await registerUser(form.email, form.password);
    if (res && res.message) {
      setMessage(res.message);
    } else {
      setMessage('Usuario registrado correctamente');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Registro de Usuario</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-xl"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-xl"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-2 px-4 rounded-xl mt-2"
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-indigo-600">{message}</p>}
    </div>
  );
};

export default Register;
