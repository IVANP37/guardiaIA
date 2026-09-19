import { Users, UserPlus, Mail, ShieldAlert } from 'lucide-react';

export function UsersView() {
  const users = [
    { id: 'usr-01', name: 'Dr. Alejandro Ríos', role: 'INSTRUCTOR', email: 'arios@hospital.edu', lastActive: 'Hace 2 horas', status: 'ACTIVE' },
    { id: 'usr-02', name: 'Laura Gómez', role: 'STUDENT', email: 'lgomez@student.edu', lastActive: 'Ahora', status: 'ACTIVE' },
    { id: 'usr-03', name: 'Martín Silva', role: 'STUDENT', email: 'msilva@student.edu', lastActive: 'Ayer', status: 'INACTIVE' },
    { id: 'usr-04', name: 'Dra. Elena Vargas', role: 'ADMIN', email: 'evargas@hospital.edu', lastActive: 'Hace 5 días', status: 'ACTIVE' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#05070A] sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-slate-400">Administra instructores, estudiantes y permisos de la institución</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Invitar
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex gap-4">
              <input 
                type="text" 
                placeholder="Buscar por nombre o email..." 
                className="bg-[#05070A] border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 w-80"
              />
              <select className="bg-[#05070A] border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                <option>Todos los roles</option>
                <option>Estudiantes</option>
                <option>Instructores</option>
                <option>Administradores</option>
              </select>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#05070A] border-b border-slate-800 text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="p-4 font-bold">Usuario</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Rol</th>
                  <th className="p-4 font-bold">Última Actividad</th>
                  <th className="p-4 font-bold text-center">Estado</th>
                  <th className="p-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{user.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{user.id}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">{user.email}</td>
                    <td className="p-4">
                      {user.role === 'ADMIN' && <span className="text-[10px] px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded uppercase font-bold tracking-wider flex items-center gap-1 w-max"><ShieldAlert className="w-3 h-3" /> Administrador</span>}
                      {user.role === 'INSTRUCTOR' && <span className="text-[10px] px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded uppercase font-bold tracking-wider w-max">Instructor</span>}
                      {user.role === 'STUDENT' && <span className="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded uppercase font-bold tracking-wider w-max">Estudiante</span>}
                    </td>
                    <td className="p-4 text-sm text-slate-400">{user.lastActive}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-600'}`}></span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
