import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, taskService, userService } from '../services/api';
import { LogOut, Plus, Trash2, CheckCircle, Clock, Layout, Users, BarChart3, Search, AlertCircle, X } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'pending', userId: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');

  useEffect(() => {
    fetchTasks();
    if (isAdmin) {
      fetchUsers();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch tasks.';
      setError(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskToCreate = { ...newTask };
      if (!taskToCreate.userId) delete taskToCreate.userId;
      
      await taskService.createTask(taskToCreate);
      setNewTask({ title: '', description: '', status: 'pending', userId: '' });
      setIsAdding(false);
      fetchTasks();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create task.';
      setError(`Error creating task: ${msg}`);
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(id);
        fetchTasks();
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to delete task.';
        setError(`Error deleting task: ${msg}`);
      }
    }
  };

  const handleUpdateStatus = async (task, newStatus) => {
    try {
      const updatePayload = {
        title: task.title,
        description: task.description,
        status: newStatus,
        userId: task.user?.id
      };
      await taskService.updateTask(task.id, updatePayload);
      fetchTasks();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update status.';
      setError(`Error updating status: ${msg}`);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.user?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                TaskPro
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900">{currentUser?.username}</p>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
                  {isAdmin ? 'Admin' : 'Member'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Tasks', value: stats.total, color: 'blue', icon: BarChart3 },
            { label: 'Pending', value: stats.pending, color: 'slate', icon: Clock },
            { label: 'In Progress', value: stats.inProgress, color: 'amber', icon: Clock },
            { label: 'Completed', value: stats.completed, color: 'emerald', icon: CheckCircle },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 group hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-slate-900">{stat.value}</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search tasks or users..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <div className="flex bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
              {['all', 'pending', 'in-progress', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${
                    filter === f ? 'bg-white text-blue-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f.replace('-', ' ')}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold whitespace-nowrap"
            >
              {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isAdding ? 'Close' : 'Add Task'}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-600 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-bold text-red-900">{error}</p>
            </div>
            <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {/* Add Task Form */}
        {isAdding && (
          <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
            <form onSubmit={handleCreateTask} className="bg-white p-8 rounded-[2rem] shadow-2xl border border-blue-50 max-w-2xl mx-auto">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                Create New Task
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                  <input
                    type="text"
                    placeholder="Task summary..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                </div>
                
                {isAdmin && (
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assign to Team Member</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer font-medium"
                        value={newTask.userId}
                        onChange={(e) => setNewTask({ ...newTask, userId: e.target.value })}
                      >
                        <option value="">Myself ({currentUser?.username})</option>
                        {users.filter(u => u.id !== currentUser.id).map(user => (
                          <option key={user.id} value={user.id}>{user.username} ({user.email})</option>
                        ))}
                      </select>
                      {users.length <= 1 && (
                        <p className="mt-2 text-[10px] text-amber-600 font-bold uppercase tracking-wider ml-1">
                          Note: No other users registered yet
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                  <textarea
                    placeholder="Provide details about the task..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows="4"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-10">
                <button type="submit" className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all font-black uppercase tracking-widest shadow-xl shadow-blue-200">
                  Create Task
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Task Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-6">
            <div className="animate-spin rounded-full h-16 w-16 border-[6px] border-blue-100 border-t-blue-600"></div>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Syncing Tasks</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTasks.length === 0 ? (
              <div className="col-span-full text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-inner">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Layout className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No tasks found</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">Create a new task to start tracking your progress.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all group flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
                      task.status === 'in-progress' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {task.status.replace('-', ' ')}
                    </div>
                    <button 
                      onClick={() => handleDeleteTask(task.id)} 
                      className="p-2 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm mb-8 line-clamp-4 leading-relaxed flex-grow">
                    {task.description}
                  </p>
                  
                  <div className="mt-auto space-y-6">
                    {isAdmin && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned to</span>
                          <span className="text-xs font-bold text-slate-900 truncate">{task.user?.username}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl shadow-inner">
                        <button 
                          onClick={() => handleUpdateStatus(task, 'pending')}
                          className={`p-2.5 rounded-xl transition-all ${task.status === 'pending' ? 'bg-white shadow-lg text-slate-900 scale-110' : 'text-slate-300 hover:text-slate-500'}`}
                          title="Pending"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(task, 'in-progress')}
                          className={`p-2.5 rounded-xl transition-all ${task.status === 'in-progress' ? 'bg-white shadow-lg text-amber-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}
                          title="In Progress"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(task, 'completed')}
                          className={`p-2.5 rounded-xl transition-all ${task.status === 'completed' ? 'bg-white shadow-lg text-emerald-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}
                          title="Completed"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 tracking-tighter">#REF_{task.id}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
