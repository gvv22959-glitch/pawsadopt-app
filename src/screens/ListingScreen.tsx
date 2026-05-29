import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PawPrint, Plus, Send, X, MapPin, Heart, ArrowLeft, 
  Loader2, CheckCircle2, AlertCircle, Menu, User, Calendar,
  MessageCircle, Phone, ExternalLink, Trash2, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Listing } from '../types';

// ===== Utility =====
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

// ===== ListingScreen Component =====
export default function ListingScreen({ 
  authUser,
  onBack
}: { 
  authUser: { id: string; email: string | undefined } | null;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<'browse' | 'post'>('browse');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);

  // 表单状态
  const [form, setForm] = useState({
    name: '', breed: '', age: '', gender: 'male' as 'male' | 'female',
    description: '', image: '', contact: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // 获取数据
  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setListings(data || []);
      if (authUser?.id) {
        setMyListings((data || []).filter(l => l.owner_id === authUser.id));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [authUser]);

  // 发布
  const handlePost = async () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = '请输入宠物名字';
    if (!form.breed.trim()) errs.breed = '请输入品种';
    if (!form.age.trim()) errs.age = '请输入年龄';
    if (!form.description.trim()) errs.description = '请输入描述';
    if (!form.contact.trim()) errs.contact = '请输入联系方式';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const id = 'list_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      const { error } = await supabase.from('listings').insert([{
        id,
        name: form.name,
        breed: form.breed,
        age: form.age,
        gender: form.gender,
        description: form.description,
        image: form.image || 'https://images.unsplash.com/photo-1543852786-1cf6534b8b4d?auto=format&fit=crop&q=80&w=1000',
        contact: form.contact,
        owner_id: authUser?.id || '',
        owner_email: authUser?.email || '',
        status: 'available',
        created_at: new Date().toISOString(),
      }]);
      if (error) throw error;
      setSuccess('🎉 发布成功！你的宠物已经在放养区了');
      setForm({ name: '', breed: '', age: '', gender: 'male', description: '', image: '', contact: '' });
      setTab('browse');
      fetchListings();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // 下架
  const handleAdopt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'adopted' })
        .eq('id', id);
      if (error) throw error;
      fetchListings();
      setSelectedListing(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 删除
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条放养记录吗？')) return;
    try {
      const { error } = await supabase.from('listings').delete().eq('id', id);
      if (error) throw error;
      fetchListings();
      setSelectedListing(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 格式化时间
  const formatTime = (t: string) => {
    if (!t) return '';
    const d = new Date(t);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  // ===== 详情弹窗 =====
  if (selectedListing) {
    const l = selectedListing;
    const isMine = authUser?.id === l.owner_id;
    return (
      <div className="min-h-screen bg-background">
        <div className="relative h-72">
          <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button onClick={() => setSelectedListing(null)} className="absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="absolute bottom-5 left-5 right-5">
            <h2 className="text-white text-3xl font-bold">{l.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                {l.breed}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{
                backgroundColor: l.status === 'available' ? '#22c55e' : '#6b7280',
                color: 'white'
              }}>
                {l.status === 'available' ? '待领养' : '已领养'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 space-y-5">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2"><User size={16} className="text-primary" /> {l.gender === 'male' ? '男生' : '女生'}</div>
            <div className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> {l.age}</div>
            <div className="flex items-center gap-2"><Clock size={16} className="text-primary" /> {formatTime(l.created_at)}</div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">关于 {l.name}</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">{l.description}</p>
          </div>

          <div className="p-4 bg-primary/5 rounded-2xl flex items-center gap-3">
            <Phone size={18} className="text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-on-surface-variant">发布者联系方式</p>
              <p className="font-semibold text-sm">{l.contact}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {isMine && l.status === 'available' && (
              <button onClick={() => handleAdopt(l.id)} className="flex-1 h-14 rounded-full font-bold bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all">
                ✅ 标记为已领养
              </button>
            )}
            {isMine && (
              <button onClick={() => handleDelete(l.id)} className="w-14 h-14 rounded-full border-2 border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 active:scale-95 transition-all">
                <Trash2 size={20} />
              </button>
            )}
            {!isMine && l.status === 'available' && (
              <a href={`tel:${l.contact}`} className="flex-1 h-14 rounded-full font-bold bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Phone size={18} /> 联系发布者
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 头部 */}
      <div className="bg-gradient-to-b from-primary/10 to-background pt-14 pb-4 px-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">🐾 放养区</h1>
          <div className="w-10" />
        </div>

        {/* 子 Tab */}
        <div className="flex bg-white/70 backdrop-blur-sm rounded-2xl p-1 shadow-sm">
          {[
            { id: 'browse', label: '🐾 浏览放养' },
            { id: 'post', label: '📤 发布放养' },
          ].map(t => (
            <button key={t.id}
              onClick={() => { setTab(t.id as 'browse' | 'post'); setError(''); setSuccess(''); }}
              className={cn(
                "flex-1 h-10 rounded-xl text-sm font-bold transition-all",
                tab === t.id ? "bg-primary text-white shadow-md" : "text-on-surface-variant"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 提示消息 */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-5 mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
            <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-5 mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 浏览放养 ===== */}
      {tab === 'browse' && (
        <div className="px-5 pt-5">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <PawPrint size={48} className="mx-auto text-outline mb-4" />
              <p className="text-on-surface-variant font-medium">还没有放养的宠物</p>
              <p className="text-sm text-outline mt-1">点击「发布放养」来添加吧～</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {listings.map(l => (
                <motion.div
                  key={l.id}
                  layoutId={`listing-${l.id}`}
                  onClick={() => setSelectedListing(l)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <div className="relative h-36">
                    <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                    <span className={cn(
                      "absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-semibold text-white",
                      l.status === 'available' ? 'bg-green-500' : 'bg-gray-500'
                    )}>
                      {l.status === 'available' ? '待领养' : '已领养'}
                    </span>
                    {authUser?.id === l.owner_id && (
                      <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-500 text-white font-semibold">
                        我的
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold">{l.name}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">{l.breed} · {l.age}</p>
                    <p className="text-xs text-outline mt-1.5 flex items-center gap-1">
                      <MapPin size={10} /> {l.gender === 'male' ? '♂' : '♀'} · {formatTime(l.created_at)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== 发布放养 ===== */}
      {tab === 'post' && (
        <div className="px-5 pt-5">
          {!authUser || authUser.id === 'guest' ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <User size={48} className="mx-auto text-outline mb-4" />
              <p className="font-semibold">请先登录再发布放养</p>
              <button onClick={onBack} className="mt-4 px-6 h-12 rounded-full bg-primary text-white font-bold shadow-lg shadow-primary/30">
                去登录
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">宠物名字 *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className={cn("w-full h-12 px-4 rounded-xl border-2 bg-surface-variant/20 outline-none text-sm transition-all",
                    formErrors.name ? 'border-red-300' : 'border-transparent focus:border-primary/30')}
                  placeholder="给宠物取个名字" />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">品种 *</label>
                  <input value={form.breed} onChange={e => setForm(f => ({...f, breed: e.target.value}))}
                    className={cn("w-full h-12 px-4 rounded-xl border-2 bg-surface-variant/20 outline-none text-sm transition-all",
                      formErrors.breed ? 'border-red-300' : 'border-transparent focus:border-primary/30')}
                    placeholder="如：橘猫、泰迪" />
                  {formErrors.breed && <p className="text-xs text-red-500 mt-1">{formErrors.breed}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">年龄 *</label>
                  <input value={form.age} onChange={e => setForm(f => ({...f, age: e.target.value}))}
                    className={cn("w-full h-12 px-4 rounded-xl border-2 bg-surface-variant/20 outline-none text-sm transition-all",
                      formErrors.age ? 'border-red-300' : 'border-transparent focus:border-primary/30')}
                    placeholder="如：2岁、3个月" />
                  {formErrors.age && <p className="text-xs text-red-500 mt-1">{formErrors.age}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">性别</label>
                <div className="flex gap-3">
                  {[
                    { value: 'male', label: '♂ 男生' },
                    { value: 'female', label: '♀ 女生' },
                  ].map(g => (
                    <button key={g.value} onClick={() => setForm(f => ({...f, gender: g.value as 'male' | 'female'}))}
                      className={cn("flex-1 h-12 rounded-xl font-semibold text-sm border-2 transition-all",
                        form.gender === g.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-on-surface-variant'
                      )}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">描述 *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  className={cn("w-full h-24 px-4 py-3 rounded-xl border-2 bg-surface-variant/20 outline-none text-sm resize-none transition-all",
                    formErrors.description ? 'border-red-300' : 'border-transparent focus:border-primary/30')}
                  placeholder="描述一下这只宠物的性格、健康状况、为什么需要送养……" />
                {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">图片 URL（可选）</label>
                <input value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))}
                  className="w-full h-12 px-4 rounded-xl border-2 border-transparent bg-surface-variant/20 outline-none text-sm focus:border-primary/30 transition-all"
                  placeholder="粘贴图片链接，不填会用默认图片" />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1.5 block">联系方式 *</label>
                <input value={form.contact} onChange={e => setForm(f => ({...f, contact: e.target.value}))}
                  className={cn("w-full h-12 px-4 rounded-xl border-2 bg-surface-variant/20 outline-none text-sm transition-all",
                    formErrors.contact ? 'border-red-300' : 'border-transparent focus:border-primary/30')}
                  placeholder="手机号、微信号等" />
                {formErrors.contact && <p className="text-xs text-red-500 mt-1">{formErrors.contact}</p>}
              </div>

              <button onClick={handlePost} disabled={submitting}
                className="w-full h-14 rounded-full font-bold text-base bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2">
                {submitting ? <><Loader2 size={20} className="animate-spin" /> 发布中...</> : <><Send size={18} /> 发布放养</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 我的放养 - 快捷入口 */}
      {tab === 'browse' && authUser && authUser.id !== 'guest' && myListings.length > 0 && (
        <div className="px-5 mt-8">
          <h3 className="text-sm font-bold mb-3">📋 我的放养 ({myListings.length})</h3>
          <div className="space-y-2">
            {myListings.map(l => (
              <div key={l.id} onClick={() => setSelectedListing(l)}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-95 transition-all cursor-pointer">
                <img src={l.image} className="w-14 h-14 rounded-xl object-cover" alt={l.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{l.name}</p>
                  <p className="text-xs text-on-surface-variant">{l.breed} · {l.age}</p>
                </div>
                <span className={cn(
                  "text-xs px-3 py-1 rounded-full font-semibold",
                  l.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                )}>
                  {l.status === 'available' ? '待领养' : '已领养'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
