/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Share2, 
  ArrowLeft, 
  MapPin, 
  PawPrint, 
  Weight, 
  CheckCircle2, 
  MessageCircle, 
  Home, 
  Search, 
  Mail, 
  User, 
  Bell, 
  ChevronRight, 
  Settings, 
  Shield, 
  HelpCircle, 
  LogOut, 
  Plus, 
  Info,
  History,
  Lock,
  X,
  Send,
  Stethoscope,
  Smile,
  Check,
  Smartphone,
  Award,
  Clock,
  Calendar,
  ShoppingBag,
  MoreHorizontal,
  Phone,
  HelpCircle as QuestionIcon,
  MessageSquare,
  Search as SearchIcon,
  ThumbsUp,
  AlertCircle,
  Loader2,
  Sparkles,
  Star
} from 'lucide-react';
import { cn } from './lib/utils';
import { Pet, Shelter, ChatSession, Application, Listing } from './types';
import { api } from './api';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from './screens/AuthScreen';
import ListingScreen from './screens/ListingScreen';
import { supabase } from './lib/supabase';

export const DataContext = React.createContext<{
  pets: Pet[];
  shelters: Shelter[];
  chats: ChatSession[];
}>({ pets: [], shelters: [], chats: [] });

// --- Components ---

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'tonal';
  size?: 'sm' | 'md' | 'lg';
}) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20',
    secondary: 'bg-secondary text-white hover:bg-secondary/95 shadow-lg shadow-secondary/20',
    ghost: 'hover:bg-surface-variant/50 text-on-surface-variant',
    outline: 'border border-outline-variant text-on-surface hover:bg-surface-variant/30',
    tonal: 'bg-primary-container/10 text-on-primary-container border border-primary/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-3 text-sm font-semibold',
    lg: 'px-8 py-4 text-lg font-bold',
  };

  return (
    <button 
      className={cn(
        'rounded-full transition-all active:scale-95 flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Chip = ({ children, className, variant = 'default' }: { children: React.ReactNode; className?: string; variant?: 'default' | 'success' | 'warning', key?: string | number }) => {
  const variants = {
    default: 'bg-surface-variant text-on-surface-variant',
    success: 'bg-secondary-container/30 text-on-secondary-container',
    warning: 'bg-tertiary-container/30 text-on-tertiary-container',
  };
  return (
    <span className={cn('px-3 py-1 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
};

// --- Screens ---

const HomeScreen = ({ onSelectPet, onSelectCategory, onGoToListingPost }: { onSelectPet: (pet: Pet) => void, onSelectCategory: (cat: string) => void, onGoToListingPost: () => void }) => {
  const { pets: PETS } = React.useContext(DataContext);
  return (
    <div className="pb-24 pt-4">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-5 h-16 flex justify-between items-center mb-4">
        <div className="flex items-center gap-1 text-primary">
          <MapPin size={24} />
          <span className="text-xs font-bold text-on-surface">上海, 静安区</span>
        </div>
        <h1 className="text-xl font-bold text-primary">PawsAdopt</h1>
        <button className="p-2 rounded-full hover:bg-surface-variant transition-colors">
          <Bell size={24} className="text-on-surface-variant" />
        </button>
      </header>

      <main className="px-5 space-y-8">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
          <input 
            type="text" 
            placeholder="搜索你心仪的宠物..." 
            className="w-full h-12 pl-12 pr-4 rounded-full border-none bg-surface-variant focus:bg-white focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex justify-between gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {['全部', '猫咪', '狗狗', '小动物'].map((cat, i) => (
            <button 
              key={cat} 
              onClick={() => onSelectCategory(cat)}
              className="flex flex-col items-center gap-2 group min-w-[70px]"
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-active:scale-95 shadow-sm",
                i === 0 ? "bg-primary-container text-white shadow-lg" : "bg-surface text-on-surface-variant hover:bg-surface-variant"
              )}>
                <PawPrint size={32} />
              </div>
              <span className={cn("text-xs", i === 0 ? "text-primary font-bold" : "text-on-surface-variant")}>
                {cat}
              </span>
            </button>
          ))}
        </div>

        {/* Hero Illustration */}
        <section className="relative rounded-3xl overflow-hidden h-48 flex items-center px-8 shadow-sm">
          <img 
            src="https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?auto=format&fit=crop&q=80&w=1000" 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Hero"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 text-white space-y-2">
            <h2 className="text-2xl font-bold leading-tight">给流浪的它们<br/>一个温暖的家</h2>
            <Button size="sm" variant="tonal" className="bg-primary-container text-white border-none">
              立即了解
            </Button>
          </div>
        </section>

        {/* Pet Grid */}
        <div className="grid grid-cols-2 gap-4">
          {PETS.map((pet) => (
            <motion.div 
              key={pet.id}
              layoutId={`pet-card-${pet.id}`}
              onClick={() => onSelectPet(pet)}
              className="bg-white rounded-2xl overflow-hidden soft-shadow cursor-pointer active:scale-95 transition-transform"
            >
              <div className="relative h-44">
                <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full">
                  <Heart size={18} className="text-primary fill-primary" />
                </div>
                {pet.tags[0] && (
                   <div className="absolute top-2 left-2 bg-secondary-container/90 text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {pet.tags[0]}
                  </div>
                )}
              </div>
              <div className="p-4 space-y-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{pet.name}</h3>
                  <span className={cn("text-xs", pet.gender === 'female' ? "text-pink-500" : "text-blue-500")}>
                    {pet.gender === 'female' ? '♀' : '♂'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Chip className="text-[10px] py-0">{pet.age}</Chip>
                  <Chip className="text-[10px] py-0">{pet.breed}</Chip>
                </div>
                <div className="flex items-center text-outline gap-1 pt-1">
                  <MapPin size={12} />
                  <span className="text-[10px]">距离 {pet.distance}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <button onClick={onGoToListingPost} className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-90 transition-transform z-50">
        <Plus size={32} />
      </button>
    </div>
  );
};

const PetDetailScreen = ({ pet, onBack, onApply, onChat }: { pet: Pet, onBack: () => void, onApply: () => void, onChat: (pet: Pet) => void }) => {
  const { shelters: SHELTERS } = React.useContext(DataContext);
  const shelter = SHELTERS[0] || { name: '未知机构', type: '未知', image: '' };
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      <header className="fixed top-0 left-0 w-full z-50 h-16 flex justify-between items-center px-4">
        <button onClick={onBack} className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-2">
           <button className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
            <Share2 size={24} />
          </button>
          <button className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
            <Heart size={24} />
          </button>
        </div>
      </header>

      <div className="relative h-[60vh]">
        <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
        <div className="absolute bottom-12 right-6 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-white text-xs">
          ID: {pet.id}
        </div>
      </div>

      <div className="relative -mt-10 bg-white rounded-t-[40px] px-6 pt-8 pb-32 soft-shadow min-h-[50vh]">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">{pet.name}</h2>
            <div className="flex items-center gap-1 text-on-surface-variant">
              <MapPin size={18} className="text-primary" />
              <span className="text-sm">{pet.location}</span>
            </div>
          </div>
          <Chip variant="success" className="px-4 py-2">{pet.status}</Chip>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Heart className="text-primary" />, label: '性别', value: pet.gender === 'male' ? '男生' : '女生' },
            { icon: <Home className="text-primary" />, label: '品种', value: pet.breed },
            { icon: <Weight className="text-primary" />, label: '体重', value: pet.weight },
          ].map((item, i) => (
            <div key={i} className="bg-surface-variant/50 p-4 rounded-2xl flex flex-col items-center gap-1">
              {item.icon}
              <span className="text-xs text-on-surface-variant">{item.label}</span>
              <span className="font-bold">{item.value}</span>
            </div>
          ))}
        </div>

        <section className="mb-8">
          <h3 className="text-lg font-bold mb-4">关于{pet.name}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {pet.tags.map(tag => <Chip key={tag}>{tag}</Chip>)}
          </div>
          <p className="text-on-surface-variant leading-relaxed text-sm">
            {pet.description}
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-lg font-bold mb-4">健康状况</h3>
          <div className="space-y-3">
            {[
              { label: '疫苗接种', status: pet.health.vaccination },
              { label: '绝育手术', status: pet.health.neutering },
              { label: '定期驱虫', status: pet.health.deworming },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-surface-variant/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-secondary fill-secondary/20" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-xs text-secondary font-bold">{item.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* AI 领养顾问 */}
        <section className="mb-8">
          <button
            onClick={() => onChat(pet)}
            className="w-full p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/30 rounded-2xl flex items-center gap-3 hover:shadow-md active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-purple-500" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-sm text-purple-700">AI 领养顾问</p>
              <p className="text-xs text-on-surface-variant">有疑问？问问我关于{pet.name}的一切</p>
            </div>
            <ChevronRight size={18} className="text-purple-400" />
          </button>
        </section>

        <div className="flex items-center gap-4 p-4 border border-outline-variant rounded-2xl mb-8">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img src={shelter.image} alt="staff" className="w-full h-full object-cover" />
          </div>
          <div className="flex-grow">
            <h4 className="font-bold">{shelter.name}</h4>
            <p className="text-xs text-on-surface-variant">{shelter.type}</p>
          </div>
          <Button onClick={() => onChat(pet)} size="sm" variant="tonal" className="bg-secondary-container text-on-secondary-container">咨询</Button>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-lg p-6 flex gap-4 items-center z-50">
        <button onClick={() => onChat(pet)} className="w-14 h-14 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors">
          <MessageCircle size={28} />
        </button>
        <Button onClick={onApply} className="flex-1 h-14 text-lg" variant="primary">
          申请领养
        </Button>
      </footer>
    </motion.div>
  );
};

const SuccessScreen = ({ onBackHome, onViewProgress }: { onBackHome: () => void, onViewProgress: () => void }) => {
  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="h-16 px-5 flex justify-between items-center fixed top-0 w-full bg-background z-50">
        <MapPin size={24} className="text-primary" />
        <h1 className="text-xl font-bold text-primary">PawsAdopt</h1>
        <Bell size={24} className="text-primary" />
      </header>

      <main className="pt-24 px-5 flex flex-col items-center">
        <div className="w-full bg-white rounded-[40px] p-8 soft-shadow flex flex-col items-center text-center space-y-6">
          <div className="relative w-48 h-48 rounded-full overflow-hidden bg-primary/10">
            <img 
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400" 
              className="w-full h-full object-cover"
              alt="Happy"
            />
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-white border-4 border-white">
                <Check size={28} strokeWidth={4} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold">恭喜你，领养成功！</h2>
            <p className="text-on-surface-variant text-sm">
              您的申请已获得批准。一个小生命正满心期待地等着与您共同开启新生活。
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <div className="bg-surface-variant px-4 py-2 rounded-full flex items-center gap-2">
              <PawPrint size={18} className="text-primary" />
              <span className="text-xs text-on-surface-variant">小七 (金毛寻回犬)</span>
            </div>
            <div className="bg-secondary-container/30 px-4 py-2 rounded-full flex items-center gap-2">
              <CheckCircle2 size={18} className="text-secondary" />
              <span className="text-xs text-on-secondary-container">已完成健康检查</span>
            </div>
          </div>

          <div className="w-full space-y-4">
            <Button onClick={onViewProgress} className="w-full h-14" variant="primary">查看申请进度</Button>
            <Button onClick={onBackHome} className="w-full h-14" variant="tonal">返回首页</Button>
          </div>
        </div>

        <section className="w-full mt-10 space-y-4">
          <h3 className="text-lg font-bold px-2">后续准备工作</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-variant/30 p-5 rounded-3xl space-y-3">
              <div className="w-10 h-10 bg-tertiary-container rounded-xl flex items-center justify-center text-white">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="font-bold text-sm">准备用品</p>
                <p className="text-[10px] text-on-surface-variant">查看必备清单</p>
              </div>
            </div>
            <div className="bg-surface-variant/30 p-5 rounded-3xl space-y-3">
              <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center text-white">
                <Calendar size={24} />
              </div>
              <div>
                <p className="font-bold text-sm">预约见面</p>
                <p className="text-[10px] text-on-surface-variant">选择接回家时间</p>
              </div>
            </div>
          </div>
          <div className="bg-primary/5 p-4 rounded-3xl flex items-center justify-between border border-primary/10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" alt="dr" className="w-full h-full object-cover" />
               </div>
               <div>
                  <p className="font-bold text-sm">林医生</p>
                  <p className="text-[10px] text-on-surface-variant">您的专属领养顾问</p>
               </div>
            </div>
            <Button size="sm" variant="primary">在线咨询</Button>
          </div>
        </section>
      </main>
    </div>
  );
};

const ProfileScreen = ({ onNavigate, onLogout, authEmail, adoptedCount, favoriteCount }: { onNavigate: (view: string) => void; onLogout: () => void; authEmail?: string; adoptedCount?: number; favoriteCount?: number }) => {
  return (
    <div className="pb-32 pt-16 px-5 space-y-8">
      <header className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-md h-16 px-5 flex justify-between items-center z-50">
        <div className="flex items-center gap-1 text-primary">
          <MapPin size={24} />
          <span className="text-xs font-bold text-on-surface">北京</span>
        </div>
        <h1 className="text-xl font-bold text-primary">PawsAdopt</h1>
        <Bell size={24} className="text-on-surface-variant" />
      </header>

      <section className="flex items-center gap-4 mt-8">
        <div className="w-20 h-20 rounded-full border-4 border-white pill-shadow overflow-hidden">
          <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="User" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">林小暖</h2>
          {authEmail && <p className="text-xs text-outline truncate max-w-[200px]">{authEmail}</p>}
          <p className="text-xs text-on-surface-variant">热爱动物，梦想给每个流浪毛孩子一个家</p>
          <div className="flex gap-2 pt-1">
            <Chip variant="success" className="bg-secondary-container/20 py-0.5 px-3">资深领养人</Chip>
            <Chip variant="warning" className="bg-tertiary-container/20 py-0.5 px-3">爱心积分 1280</Chip>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl pill-shadow space-y-1 cursor-pointer active:scale-95 transition-all" onClick={() => onNavigate('my-adoption')}>
          <p className="text-3xl font-bold text-primary">{String(adoptedCount ?? 0).padStart(2, '0')}</p>
          <p className="text-xs text-on-surface-variant">我的领养</p>
        </div>
        <div className="bg-white p-5 rounded-3xl pill-shadow space-y-1 cursor-pointer active:scale-95 transition-all" onClick={() => onNavigate('my-favorites')}>
          <p className="text-3xl font-bold text-primary">{String(favoriteCount ?? 0).padStart(2, '0')}</p>
          <p className="text-xs text-on-surface-variant">我的收藏</p>
        </div>
        <div className="col-span-2 bg-primary-container/10 p-5 rounded-3xl border border-primary/10 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-white">
                <Heart size={20} />
              </div>
              <div>
                 <p className="font-bold">我的贡献</p>
                 <p className="text-xs text-on-surface-variant">已累计捐赠 50kg 宠粮</p>
              </div>
           </div>
           <ChevronRight size={20} className="text-outline" />
        </div>
      </section>

      <section className="bg-white rounded-3xl pill-shadow overflow-hidden">
        {[
          { id: 'adoption-status', icon: <PawPrint size={20} />, label: '领养申请状态', hasBadge: true },
          { id: 'history', icon: <History size={20} />, label: '历史记录' },
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => onNavigate(item.id)}
            className={cn("flex items-center justify-between p-5 hover:bg-surface-variant/30 cursor-pointer", i !== 1 && "border-b border-surface-variant")}
          >
            <div className="flex items-center gap-4">
              <span className="text-on-surface-variant">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.hasBadge && <div className="w-2 h-2 bg-primary rounded-full" />}
              <ChevronRight size={20} className="text-outline" />
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-3xl pill-shadow overflow-hidden">
        {[
          { id: 'account-settings', icon: <Settings size={20} />, label: '账号设置' },
          { id: 'privacy-security', icon: <Shield size={20} />, label: '隐私与安全' },
          { id: 'help-feedback', icon: <HelpCircle size={20} />, label: '帮助与反馈' },
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => onNavigate(item.id)}
            className={cn("flex items-center justify-between p-5 hover:bg-surface-variant/30 cursor-pointer", i !== 2 && "border-b border-surface-variant")}
          >
            <div className="flex items-center gap-4">
              <span className="text-on-surface-variant">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronRight size={20} className="text-outline" />
          </div>
        ))}
      </section>

      <Button onClick={onLogout} className="w-full text-white bg-primary h-14" variant="primary">
        <LogOut size={20} />
        退出登录
      </Button>
    </div>
  );
};

// --- Sub-Screens ---

const CategoryScreen = ({ category, onBack, onSelectPet }: { category: string, onBack: () => void, onSelectPet: (pet: Pet) => void }) => {
  const { pets: PETS } = React.useContext(DataContext);
  const [activeSub, setActiveSub] = useState('全部');

  const subCategories: Record<string, string[]> = {
    '猫咪': ['全部', '英短', '美短', '布偶', '加菲', '橘猫'],
    '狗狗': ['全部', '金毛', '柴犬', '边牧', '泰迪', '法斗'],
    '小动物': ['全部', '兔子', '仓鼠', '龙猫', '小鸟'],
  };

  const currentSubs = subCategories[category] || ['全部'];

  const filteredPets = PETS.filter(p => {
    // Stage 1: Main category
    let match = category === '全部';
    if (category === '猫咪') match = p.breed.includes('猫') || p.breed === '蓝猫' || p.breed === '英短' || p.breed === '橘猫';
    if (category === '狗狗') match = p.breed.includes('狗') || p.breed === '金毛' || p.breed === '柴犬' || p.breed === '泰迪' || p.breed === '比熊';
    if (category === '小动物') match = !p.breed.includes('猫') && !p.breed.includes('狗') && !p.breed.includes('金毛') && !p.breed.includes('柴犬') && !p.breed.includes('比熊');
    
    if (!match) return false;

    // Stage 2: Sub category
    if (activeSub === '全部') return true;
    return p.breed.includes(activeSub);
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="h-16 px-5 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-xl font-bold text-primary">{category}</h1>
        </div>
        <Search size={22} className="text-outline" />
      </header>
      <main className="px-5 pt-4 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          {currentSubs.map(sub => (
            <button 
              key={sub} 
              onClick={() => setActiveSub(sub)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                activeSub === sub ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface-variant/50 text-on-surface-variant hover:bg-primary-container/10"
              )}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pb-20">
          {filteredPets.map(pet => (
            <div key={pet.id} onClick={() => onSelectPet(pet)} className="bg-white rounded-3xl overflow-hidden soft-shadow group active:scale-95 transition-all">
              <div className="relative h-40">
                <img src={pet.image} alt={pet.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                <div className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-primary">
                  <Heart size={14} className={cn(pet.isFavorite && "fill-primary")} />
                </div>
              </div>
              <div className="p-4 space-y-0.5">
                <h3 className="font-bold text-sm">{pet.name}</h3>
                <p className="text-[10px] text-on-surface-variant">{pet.breed} · {pet.age}</p>
                <div className="flex items-center text-outline gap-1 pt-1">
                  <MapPin size={10} />
                  <span className="text-[9px]">{pet.location.split(' · ')[1]}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredPets.length === 0 && (
            <div className="col-span-2 py-20 text-center space-y-3 opacity-40">
               <PawPrint size={48} className="mx-auto" />
               <p className="text-sm font-bold">暂时没有这类小伙伴哦</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const SimpleListScreen = ({ title, items, onBack }: { title: string, items: { icon: React.ReactNode, label: string, desc?: string, onClick?: () => void }[], onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="h-16 px-5 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="text-xl font-bold text-primary">{title}</h1>
      </header>
      <main className="px-5 py-4 space-y-4">
        {items.map((item, i) => (
          <div 
            key={i} 
            onClick={item.onClick}
            className="bg-white p-5 rounded-3xl pill-shadow flex items-center justify-between hover:bg-surface-variant/30 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="text-primary transition-transform group-active:scale-95">{item.icon}</div>
              <div>
                <p className="font-bold text-sm">{item.label}</p>
                {item.desc && <p className="text-[10px] text-on-surface-variant">{item.desc}</p>}
              </div>
            </div>
            <ChevronRight size={20} className="text-outline" />
          </div>
        ))}
      </main>
    </div>
  );
};

const AdoptionStatusScreen = ({ onBack, applications }: { onBack: () => void, applications: Application[] }) => {
  const statusMap: Record<string, { label: string; active: boolean }> = {
    pending: { label: '已提交申请', active: false },
    reviewing: { label: '资料审核中', active: false },
    approved: { label: '申请成功', active: true },
    rejected: { label: '未通过', active: false },
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 px-5 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="text-xl font-bold text-primary">领养申请状态</h1>
      </header>
      <main className="px-5 py-6 space-y-6">
        {applications.length === 0 ? (
          <div className="text-center py-20 space-y-3 opacity-50">
            <PawPrint size={48} className="mx-auto" />
            <p className="text-sm">还没有提交过领养申请</p>
          </div>
        ) : (
          applications.map((app, idx) => {
            const s = statusMap[app.status] || statusMap.pending;
            return (
              <div key={app.id} className="bg-white p-6 rounded-[32px] soft-shadow space-y-6">
                <div>
                  <p className="font-bold text-lg">申请单号: {app.id.slice(0, 16)}</p>
                  <p className="text-xs text-on-surface-variant">宠物ID: {app.pet_id}</p>
                </div>
                <div className="space-y-4 relative ml-4">
                  <div className="absolute left-[-13px] top-1 bottom-1 w-0.5 bg-primary/20" />
                  {['pending', 'reviewing', 'approved'].map((status, i) => {
                    const step = statusMap[status];
                    const isActive = app.status === status || (app.status === 'approved' && status !== 'rejected');
                    const isPast = ['rejected'].includes(app.status) ? false :
                      (status === 'pending' || (status === 'reviewing' && ['reviewing', 'approved'].includes(app.status)) || (status === 'approved' && app.status === 'approved'));
                    return (
                      <div key={i} className="flex gap-4 relative">
                        <div className={cn("w-3 h-3 rounded-full absolute left-[-18px] top-1 z-10",
                          isActive ? "bg-primary scale-125" : "bg-primary/20")} />
                        <div className="flex-1 space-y-1">
                          <p className={cn("font-bold text-sm", isActive ? "text-primary" : "text-on-surface-variant")}>{step.label}</p>
                          <p className="text-[10px] text-outline">{app.created_at ? new Date(app.created_at).toLocaleDateString('zh-CN') : ''}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

const MessagesScreen = ({ onNavigate, authUserId }: { onNavigate: (view: string, data?: any) => void, authUserId?: string }) => {
  const { chats: CHATS } = React.useContext(DataContext);
  // 过滤当前用户参与的会话
  const myChats = authUserId
    ? CHATS.filter(c => {
        const pIds: string[] = (c as any).participantIds || (c as any).participant_ids || [];
        return pIds.length === 0 || pIds.includes(authUserId);
      })
    : CHATS;
  return (
    <div className="pb-32 pt-16 px-5 space-y-6">
      <header className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-md h-16 px-5 flex justify-between items-center z-50">
        <h1 className="text-xl font-bold text-primary">消息中心</h1>
        <Bell size={24} className="text-on-surface-variant" />
      </header>

      <section className="grid grid-cols-3 gap-4 pt-4">
        {[
          { id: 'notifications', icon: <Bell size={24} className="fill-primary/20" />, label: '系统通知', color: 'bg-primary/10 text-primary' },
          { id: 'adoption-status', icon: <CheckCircle2 size={24} className="fill-secondary/20" />, label: '领养进度', color: 'bg-secondary/10 text-secondary' },
          { id: 'contact-support', icon: <MessageCircle size={24} className="fill-tertiary/20" />, label: '在线咨询', color: 'bg-tertiary/10 text-tertiary' },
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => onNavigate(item.id)}
            className="bg-white p-4 rounded-2xl soft-shadow flex flex-col items-center gap-2 text-center cursor-pointer hover:bg-surface-variant transition-colors"
          >
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", item.color)}>
              {item.icon}
            </div>
            <span className="text-xs text-on-surface-variant font-medium">{item.label}</span>
          </div>
        ))}
      </section>

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">最近会话</h3>
        <button className="text-primary text-xs font-bold">全部已读</button>
      </div>

      <div className="space-y-3">
        {myChats.map((chat) => (
          <div 
            key={chat.id} 
            onClick={() => onNavigate('chat-detail', chat)}
            className="bg-white p-4 rounded-2xl soft-shadow flex items-center gap-4 hover:bg-surface-variant/30 cursor-pointer border border-transparent hover:border-primary/5 transition-all"
          >
            <div className="relative w-14 h-14 flex-shrink-0">
              <img src={chat.image} className="w-full h-full object-cover rounded-full" alt="avatar" />
              {chat.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-secondary border-2 border-white rounded-full" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm truncate">{chat.name}</span>
                <span className="text-[10px] text-outline">{chat.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-on-surface-variant truncate pr-4">{chat.lastMessage}</p>
                {chat.unreadCount && (
                  <div className="w-5 h-5 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ApplicationFormScreen = ({ pet, onBack, onSubmit }: { pet: Pet, onBack: () => void, onSubmit: () => void }) => {
  const [appName, setAppName] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appHousing, setAppHousing] = useState('');
  const [appNote, setAppNote] = useState('');
  const [commitment, setCommitment] = useState([false, false, false]);
  const [submitting, setSubmittingApp] = useState(false);
  const [error, setErrorApp] = useState('');

  const allCommit = commitment.every(Boolean);

  const handleSubmit = async () => {
    if (!appName.trim()) { setErrorApp('请输入姓名'); return; }
    if (!appPhone.trim()) { setErrorApp('请输入联系电话'); return; }
    if (!allCommit) { setErrorApp('请同意全部领养承诺'); return; }
    setSubmittingApp(true);
    setErrorApp('');
    try {
      await api.submitApplication({
        pet_id: pet.id,
        applicant_name: appName.trim(),
        applicant_phone: appPhone.trim(),
        housing_type: appHousing,
        note: appNote.trim(),
      });
      onSubmit();
    } catch (err: any) {
      setErrorApp(err.message || '提交失败，请重试');
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 px-5 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
           <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-variant transition-colors">
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <h1 className="text-lg font-bold text-primary">领养申请表</h1>
        </div>
        <Info size={24} className="text-on-surface-variant" />
      </header>

      <main className="px-5 py-6 space-y-8 pb-32">
        {/* Progress */}
        <div className="flex items-center justify-between px-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-[10px] font-bold text-primary">个人信息</span>
          </div>
          <div className="h-0.5 flex-1 bg-primary/20 mx-2" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-[10px] font-bold text-on-surface-variant">居住环境</span>
          </div>
          <div className="h-0.5 flex-1 bg-surface-variant mx-2" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-[10px] font-bold text-on-surface-variant">养宠意愿</span>
          </div>
        </div>

        <section className="bg-white rounded-2xl p-4 soft-shadow flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
             <img src={pet.image} className="w-full h-full object-cover" alt="pet" />
          </div>
          <div>
            <h2 className="text-lg font-bold">申请领养：{pet.name}</h2>
            <p className="text-xs text-on-surface-variant">{pet.breed} · {pet.age} · {pet.gender === 'male' ? '公' : '母'}</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h3 className="font-bold text-lg">基本信息</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant ml-2">姓名</label>
              <input type="text" value={appName} onChange={e => setAppName(e.target.value)} placeholder="请输入您的真实姓名" className="w-full h-12 px-4 rounded-2xl border-none bg-surface-variant/50 focus:bg-white focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant ml-2">联系电话</label>
              <input type="tel" value={appPhone} onChange={e => setAppPhone(e.target.value)} placeholder="请输入手机号" className="w-full h-12 px-4 rounded-2xl border-none bg-surface-variant/50 focus:bg-white focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm" />
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-xs font-bold text-on-surface-variant ml-2">住房情况</label>
             <div className="grid grid-cols-2 gap-3">
                {['自有住房', '租房居住'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setAppHousing(type)}
                    className={`h-14 rounded-2xl text-sm font-medium transition-all active:scale-[0.98] ${appHousing === type ? 'bg-primary text-white' : 'bg-surface-variant/50 hover:bg-primary-container/10 hover:text-primary'}`}
                  >
                    {type}
                  </button>
                ))}
             </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-secondary rounded-full" />
            <h3 className="font-bold text-lg">领养承诺</h3>
          </div>
          <div className="space-y-4 bg-surface-variant/20 p-4 rounded-2xl">
            {[
              '我承诺会给予宠物充足的陪伴，不离不弃。',
              '我承诺按时为宠物接种疫苗、驱虫，适龄绝育。',
              '我承诺绝不随意遗弃宠物。',
            ].map((text, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={commitment[i]}
                  onChange={() => setCommitment(prev => prev.map((v, j) => j === i ? !v : v))}
                  className="mt-1 w-5 h-5 rounded border-outline text-primary focus:ring-primary-container"
                />
                <span className="text-xs text-on-surface-variant leading-tight">{text}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-2">
           <label className="text-xs font-bold text-on-surface-variant ml-2">补充说明</label>
           <textarea rows={4} value={appNote} onChange={e => setAppNote(e.target.value)} placeholder="说说您想说的话..." className="w-full p-4 rounded-2xl border-none bg-surface-variant/50 focus:bg-white focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm resize-none" />
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md p-6 flex flex-col items-center z-50">
        {error && <p className="text-xs text-red-500 mb-2 flex items-center gap-1"><AlertCircle size={14} />{error}</p>}
        <Button onClick={handleSubmit} disabled={submitting} className="w-full h-14" variant="primary">
          {submitting ? <><Loader2 size={18} className="animate-spin" /> 提交中...</> : '提交领养申请'}
        </Button>
        <p className="mt-2 text-[10px] text-outline">提交即代表您同意《PawsAdopt 领养协议》</p>
      </footer>
    </div>
  );
};

const FAQScreen = ({ onBack }: { onBack: () => void }) => {
  const faqs = [
    { q: '如何申请领养？', a: '在宠物详情页点击“申请领养”按钮，填写个人信息和领养承诺即可提交。' },
    { q: '领养审核需要多久？', a: '通常在提交申请后的3-5个工作日内，我们会通过系统消息通知您结果。' },
    { q: '领养是免费的吗？', a: '大部分救助机构提供的领养是免费的，但可能需要支付基本的疫苗或芯片费用。' },
    { q: '如果领养后无法继续养怎么办？', a: '请第一时间联系原救助机构，切勿私自遗弃。' },
  ];

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="h-16 px-5 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="text-xl font-bold text-primary">常见问题</h1>
      </header>
      <main className="px-5 py-4 space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl soft-shadow space-y-2">
            <h4 className="font-bold text-sm text-primary">Q: {faq.q}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">A: {faq.a}</p>
          </div>
        ))}
      </main>
    </div>
  );
};

const FeedbackScreen = ({ onBack }: { onBack: () => void }) => {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center text-secondary mb-6 shadow-lg">
          <Check size={40} strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-bold mb-2">感谢反馈</h2>
        <p className="text-on-surface-variant text-sm mb-8">您的建议是我们进步的动力，我们会尽快跟进。</p>
        <Button onClick={onBack} className="w-full max-w-sm">返回</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 px-5 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="text-xl font-bold text-primary">意见反馈</h1>
      </header>
      <main className="px-5 py-6 space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-bold text-on-surface-variant ml-2">问题/建议描述</label>
          <textarea rows={6} placeholder="请描述您遇到的问题或您的宝贵建议..." className="w-full p-4 rounded-3xl border-none bg-surface-variant/50 focus:bg-white focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm resize-none" />
        </div>
        <div className="space-y-4">
          <label className="text-xs font-bold text-on-surface-variant ml-2">联系方式 (可选)</label>
          <input type="text" placeholder="手机号或邮箱" className="w-full h-12 px-4 rounded-2xl border-none bg-surface-variant/50 focus:bg-white focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm" />
        </div>
        <Button onClick={() => setSubmitted(true)} className="w-full h-14">提交反馈</Button>
      </main>
    </div>
  );
};

const ContactSupportScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 px-5 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="text-xl font-bold text-primary">联系客服</h1>
      </header>
      <main className="px-5 py-8 flex flex-col items-center">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-8 animate-pulse">
           <MessageCircle size={48} />
        </div>
        <div className="text-center mb-12">
          <h2 className="text-xl font-bold mb-2">我们需要为您提供什么帮助？</h2>
          <p className="text-on-surface-variant text-sm">客服在线时间 09:00 - 21:00</p>
        </div>
        <div className="w-full space-y-4">
          <div className="bg-white p-5 rounded-3xl soft-shadow flex items-center justify-between group active:scale-95 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                 <MessageSquare size={24} />
              </div>
              <div>
                 <p className="font-bold text-sm">在线文字咨询</p>
                 <p className="text-[10px] text-on-surface-variant">极速响应，实时沟通</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-outline" />
          </div>
          <div className="bg-white p-5 rounded-3xl soft-shadow flex items-center justify-between group active:scale-95 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                 <Phone size={24} />
              </div>
              <div>
                 <p className="font-bold text-sm">拨打客服电话</p>
                 <p className="text-[10px] text-on-surface-variant">专业解答，语音服务</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-outline" />
          </div>
          <div className="bg-white p-5 rounded-3xl soft-shadow flex items-center justify-between group active:scale-95 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-tertiary-container/20 rounded-2xl flex items-center justify-center text-tertiary">
                 <Mail size={24} />
              </div>
              <div>
                 <p className="font-bold text-sm">发送邮件反映</p>
                 <p className="text-[10px] text-on-surface-variant">support@pawsadopt.com</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-outline" />
          </div>
        </div>
      </main>
    </div>
  );
};

const ChatDetailScreen = ({ chat, onBack, authUserId }: { chat: ChatSession, onBack: () => void, authUserId?: string }) => {
  const [messages, setMessages] = useState<{ id: number; text: string; fromUser: boolean; time: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [msgLoading, setMsgLoading] = useState(true);

  // 从 Supabase 加载历史消息
  useEffect(() => {
    const load = async () => {
      try {
        const msgs = await api.getMessages(chat.id);
        const formatted = msgs.map(m => ({
          id: m.id,
          text: m.text,
          fromUser: m.sender_id === authUserId,
          time: m.created_at ? new Date(m.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '',
        }));
        setMessages(formatted.length > 0 ? formatted : [
          { id: 1, text: `您好，这里是${chat.name}，请问有什么可以帮助您的？`, fromUser: false, time: '' },
        ]);
      } catch {
        setMessages([{ id: 1, text: `您好，这里是${chat.name}，请问有什么可以帮助您的？`, fromUser: false, time: '' }]);
      } finally {
        setMsgLoading(false);
      }
    };
    load();
  }, [chat.id, chat.name, authUserId]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue('');
    // 乐观更新 UI
    setMessages(prev => [...prev, { id: Date.now(), text, fromUser: true, time: '刚刚' }]);
    try {
      await api.sendMessage(chat.id, text);
    } catch {
      // 发送失败时静默处理，消息已在本地显示
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 px-5 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50 border-b border-surface-variant">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src={chat.image} className="w-full h-full object-cover" alt="avatar" />
             </div>
             <div className="flex flex-col">
                <h1 className="font-bold text-sm">{chat.name}</h1>
                <span className="text-[10px] text-secondary font-medium">{chat.online ? '在线中' : '离线'}</span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Phone size={20} className="text-primary" />
           <MoreHorizontal size={24} className="text-on-surface-variant" />
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-5 pb-24 space-y-6">
        <div className="text-center py-4">
          <span className="text-[10px] text-outline bg-surface-variant/30 px-3 py-1 rounded-full">{chat.time}</span>
        </div>
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.fromUser ? "flex-row-reverse" : "")}>
            {!msg.fromUser && (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
                <img src={chat.image} className="w-full h-full object-cover" alt="avatar" />
              </div>
            )}
            <div className={cn(
              "max-w-[75%] p-4 rounded-[24px] text-sm leading-relaxed",
              msg.fromUser 
                ? "bg-primary text-white rounded-tr-none" 
                : "bg-white soft-shadow rounded-tl-none text-on-surface-variant"
            )}>
              {msg.text}
              <p className={cn("text-[9px] mt-1 opacity-60", msg.fromUser ? "text-right" : "text-left")}>{msg.time}</p>
            </div>
          </div>
        ))}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-lg flex gap-3 items-center border-t border-surface-variant z-50">
        <button className="p-2 text-on-surface-variant">
          <Plus size={24} />
        </button>
        <div className="flex-1 bg-surface-variant/50 rounded-full flex items-center px-4 h-12">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="打个招呼吧..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
          />
          <button className="p-1 px-2">
            <Smile size={20} className="text-outline" />
          </button>
        </div>
        <button 
          onClick={sendMessage}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            inputValue.trim() ? "bg-primary text-white" : "bg-surface-variant text-outline"
          )}
        >
          <Send size={20} />
        </button>
      </footer>
    </div>
  );
};

const PetListScreen = ({ title, petIds, onBack, onSelectPet }: { title: string, petIds: string[], onBack: () => void, onSelectPet: (p: Pet) => void }) => {
  const { pets: PETS } = React.useContext(DataContext);
  const petsList = PETS.filter(p => petIds.includes(p.id));

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="h-16 px-5 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="text-xl font-bold text-primary">{title}</h1>
      </header>
      <main className="px-5 py-6 space-y-4">
        {petsList.map(pet => (
          <div key={pet.id} onClick={() => onSelectPet(pet)} className="bg-white p-4 rounded-[32px] soft-shadow flex items-center gap-4 cursor-pointer active:scale-95 transition-all">
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
               <img src={pet.image} className="w-full h-full object-cover" alt="pet" />
            </div>
            <div className="flex-1 space-y-1">
               <div className="flex justify-between items-center">
                  <h4 className="font-bold text-base">{pet.name}</h4>
                  <Heart size={18} className={cn(pet.isFavorite ? "text-primary fill-primary" : "text-outline")} />
               </div>
               <p className="text-xs text-on-surface-variant">{pet.breed} · {pet.age} · {pet.gender === 'male' ? '男生' : '女生'}</p>
               <div className="flex gap-2 mt-2">
                  <Chip variant="success" className="py-0.5 text-[10px]">{pet.status}</Chip>
               </div>
            </div>
          </div>
        ))}
        {petsList.length === 0 && (
          <div className="py-40 text-center space-y-4 opacity-50">
             <AlertCircle size={48} className="mx-auto" />
             <p className="text-sm">空空如也，快去看看小伙伴吧</p>
          </div>
        )}
      </main>
    </div>
  );
};

const NotificationsScreen = ({ onBack, applications }: { onBack: () => void, applications: Application[] }) => {
  const notifications = [
    ...applications.map(app => ({
      title: app.status === 'approved' ? '领养申请已通过' : app.status === 'rejected' ? '领养申请未通过' : '领养申请处理中',
      content: `宠物ID: ${app.pet_id} — 当前状态: ${app.status === 'pending' ? '已提交' : app.status === 'reviewing' ? '审核中' : app.status === 'approved' ? '已批准' : '未通过'}`,
      time: app.created_at ? new Date(app.created_at).toLocaleDateString('zh-CN') : '',
      unread: app.status === 'pending' || app.status === 'reviewing',
    })),
    { title: '平台服务通知', content: 'PawsAdopt 闭环功能已全面升级，快来体验新的站内消息和申请追踪功能！', time: '今天', unread: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 px-5 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="text-xl font-bold text-primary">系统通知</h1>
      </header>
      <main className="px-5 py-4 space-y-4">
        {notifications.map((notif, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl soft-shadow space-y-2 relative overflow-hidden group">
            {notif.unread && <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full" />}
            <h4 className="font-bold text-sm">{notif.title}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed pr-6">{notif.content}</p>
            <p className="text-[10px] text-outline pt-2">{notif.time}</p>
          </div>
        ))}
      </main>
    </div>
  );
};

const SearchScreen = ({ onSelectPet, onSearch }: { onSelectPet: (pet: Pet) => void, onSearch?: (query: string) => void }) => {
  const { pets: PETS } = React.useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  
  const trending = ['幼年金毛', '布偶猫', '小型犬', '上海领养', '柯基', '拉布拉多'];
  
  const searchResults = PETS.filter(p => 
    p.name.includes(searchTerm) || p.breed.includes(searchTerm)
  );

  return (
    <div className="pb-32 pt-4 px-5 space-y-8 min-h-screen">
      <div className="relative group mt-12">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索您心仪的小伙伴..." 
          className="w-full h-12 pl-12 pr-4 rounded-full border-none bg-surface-variant focus:bg-white focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline">
            <X size={18} />
          </button>
        )}
      </div>

      {!searchTerm ? (
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Plus size={18} className="text-primary" strokeWidth={3} />
              <h3 className="font-bold">热搜关键词</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {trending.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => { setSearchTerm(tag); onSearch?.(tag); }}
                  className="bg-surface-variant/50 hover:bg-primary-container/10 hover:text-primary transition-all px-5 py-2 rounded-full text-xs text-on-surface-variant font-medium"
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <ThumbsUp size={18} className="text-primary" strokeWidth={3} />
              <h3 className="font-bold">为你推荐</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {PETS.slice(0, 2).map(pet => (
                 <div key={pet.id} onClick={() => onSelectPet(pet)} className="bg-white rounded-3xl overflow-hidden soft-shadow relative cursor-pointer active:scale-95 transition-all">
                    <img src={pet.image} className="w-full h-40 object-cover" alt="rec" />
                    <div className="p-3">
                       <p className="font-bold text-sm text-center">{pet.name}</p>
                    </div>
                 </div>
               ))}
            </div>
          </section>
        </div>
      ) : (
        <section className="space-y-4">
          <p className="text-xs text-outline px-2">搜索结果 ({searchResults.length})</p>
          <div className="grid grid-cols-1 gap-4">
            {searchResults.map(pet => (
              <div key={pet.id} onClick={() => onSelectPet(pet)} className="bg-white rounded-3xl p-4 soft-shadow flex items-center gap-4 cursor-pointer active:scale-95 transition-all">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                   <img src={pet.image} className="w-full h-full object-cover" alt="pet" />
                </div>
                <div>
                   <h4 className="font-bold text-sm">{pet.name}</h4>
                   <p className="text-[10px] text-on-surface-variant">{pet.breed} · {pet.age} · {pet.location}</p>
                   <div className="flex gap-2 mt-2">
                      <Chip className="bg-secondary-container/20 text-on-secondary-container py-0 text-[8px]">{pet.status}</Chip>
                   </div>
                </div>
              </div>
            ))}
            {searchResults.length === 0 && (
              <div className="py-20 text-center space-y-4">
                 <AlertCircle size={48} className="mx-auto opacity-20" />
                 <p className="text-on-surface-variant text-sm">没找到相关的毛孩子，换个关键词试试？</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [appStage, setAppStage] = useState<'loading' | 'onboarding' | 'auth' | 'main'>('loading');
  const [authUser, setAuthUser] = useState<{ id: string; email: string | undefined } | null>(null);
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [adoptedCount, setAdoptedCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [subView, setSubView] = useState<string | null>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);


// 将放养区的 Listing 转为 Pet 格式，以便在首页和搜索中展示
const mapListingToPet = (l: Listing): Pet => ({
  id: l.id, name: l.name, breed: l.breed, age: l.age, gender: l.gender,
  weight: '未知', location: '放养区', distance: '来自用户发布',
  description: l.description, image: l.image,
  tags: [l.status === 'available' ? '待领养' : '已领养', l.breed],
  status: l.status === 'available' ? '可领养' : '已领养',
  isFavorite: false, isAdopted: l.status === 'adopted',
  health: { vaccination: '未知', neutering: '未知', deworming: '未知' },
});
  const fetchData = async () => {
    setLoading(true);
    try {
      const [petsData, sheltersData, chatsData, listingsData, appsData, favsData] = await Promise.all([
        api.getPets(),
        api.getShelters(),
        api.getChats(),
        api.getListings(),
        api.getApplications(),
        api.getFavorites(),
      ]);
      const listingPets: Pet[] = (listingsData || [])
        .filter((l: Listing) => l.status === "available")
        .map(mapListingToPet);
      setPets([...listingPets, ...petsData]);
      setShelters(sheltersData);
      setChats(chatsData);
      setApplications(appsData);
      setAdoptedCount(appsData.filter(a => a.status === 'approved').length);
      setFavoriteCount(favsData.length);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setAuthUser({ id: session.user.id, email: session.user.email ?? undefined });
          await fetchData();
          setAppStage('main');
        } else {
          const hasOnboarded = localStorage.getItem('pawsadopt_onboarded');
          setAppStage(hasOnboarded ? 'auth' : 'onboarding');
        }
      } catch (err) {
        console.error('Init error:', err);
        const hasOnboarded = localStorage.getItem('pawsadopt_onboarded');
        setAppStage(hasOnboarded ? 'auth' : 'onboarding');
      }
    };
    init();
  }, []);

  // Auth handlers
  const handleAuthSuccess = async (user: { id: string; email: string | undefined }) => {
    setAuthUser(user);
    setAppStage('main');
    if (user.id !== 'guest') await fetchData();
  };

  const handleLogout = async () => {
    if (authUser?.id !== 'guest') await supabase.auth.signOut();
    setAuthUser(null);
    setCurrentTab('home');
    setSelectedPet(null);
    setSelectedCategory(null);
    setSubView(null);
    setAppStage('auth');
  };

  // App stage rendering
  if (appStage === 'loading') return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <Loader2 className="text-primary animate-spin" size={32} />
        </div>
        <p className="text-sm text-on-surface-variant font-medium">正在启动...</p>
      </div>
    </div>
  );

  if (appStage === 'onboarding') return (
    <OnboardingScreen
      onComplete={() => {
        localStorage.setItem('pawsadopt_onboarded', '1');
        setAppStage('auth');
      }}
    />
  );

  if (appStage === 'auth') return (
    <AuthScreen onAuthSuccess={handleAuthSuccess} />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary animate-spin" size={36} />
          <p className="text-sm text-on-surface-variant font-medium">加载数据中...</p>
        </div>
      </div>
    );
  }

  // Helper for back navigation
  const goBackSubView = () => {
    setSubView(null);
    setSelectedChat(null);
  };

  const handleNavigate = (view: string, data?: any) => {
    if (view === 'chat-detail' && data) {
      setSelectedChat(data);
    }
    setSubView(view);
  };

  // 从宠物详情发起聊天
  const handlePetChat = async (pet: Pet) => {
    const userId = authUser?.id || 'guest';
    try {
      const chat = await api.getOrCreateChatForPet(pet, userId);
      setChats(prev => prev.find(c => c.id === chat.id) ? prev : [chat, ...prev]);
      setSelectedChat(chat);
      setSubView('chat-detail');
    } catch {
      // fallback: create local chat
    }
  };

  // 从放养详情发起聊天
  const handleListingChat = async (listing: Listing) => {
    const userId = authUser?.id || 'guest';
    try {
      const chat = await api.getOrCreateChatForListing(listing, userId);
      setChats(prev => prev.find(c => c.id === chat.id) ? prev : [chat, ...prev]);
      setSelectedChat(chat);
      setSubView('chat-detail');
    } catch {
      // fallback
    }
  };

  // 从首页跳转到放养区发布
  const handleGoToListingPost = () => {
    // 需要在 ListingScreen 中切换到 post tab
    setCurrentTab('listings');
    // 通过 localStorage 传递意图
    localStorage.setItem('pawsadopt_listing_tab', 'post');
  };

  // Transition screen logic
  if (showSuccess) return (
    <SuccessScreen
      onBackHome={() => { setShowSuccess(false); setShowApplyForm(false); setSelectedPet(null); setSubView(null); setCurrentTab('home'); }}
      onViewProgress={() => {
        setShowSuccess(false);
        setShowApplyForm(false);
        setSubView('adoption-status');
      }}
    />
  );
  if (showApplyForm && selectedPet) return (
    <ApplicationFormScreen
      pet={selectedPet}
      onBack={() => setShowApplyForm(false)}
      onSubmit={async () => {
        setShowSuccess(true);
        // Reload applications data
        try {
          const apps = await api.getApplications();
          setApplications(apps);
          setAdoptedCount(apps.filter(a => a.status === 'approved').length);
        } catch {}
      }}
    />
  );
  if (selectedPet) return (
    <PetDetailScreen
      pet={selectedPet}
      onBack={() => setSelectedPet(null)}
      onApply={() => setShowApplyForm(true)}
      onChat={handlePetChat}
    />
  );
  if (selectedCategory) return <CategoryScreen category={selectedCategory} onBack={() => setSelectedCategory(null)} onSelectPet={setSelectedPet} />;

  // Profile Sub-views
  const favoritedPetIds = pets.filter(p => p.isFavorite).map(p => p.id);
  const adoptedPetIds = pets.filter(p => p.isAdopted).map(p => p.id);

  if (subView === 'chat-detail' && selectedChat) return <ChatDetailScreen onBack={goBackSubView} chat={selectedChat} authUserId={authUser?.id} />;
  
  if (subView === 'my-adoption') return <PetListScreen title="我的领养" petIds={adoptedPetIds} onBack={goBackSubView} onSelectPet={setSelectedPet} />;
  if (subView === 'my-favorites') return <PetListScreen title="我的收藏" petIds={favoritedPetIds} onBack={goBackSubView} onSelectPet={setSelectedPet} />;

  if (subView === 'account-settings') return (
    <SimpleListScreen 
      title="账号设置" 
      onBack={goBackSubView} 
      items={[
        { icon: <User size={20} />, label: '个人资料', desc: '修改头像、昵称、个性签名' },
        { icon: <Smartphone size={20} />, label: '手机号绑定', desc: '138****8888' },
        { icon: <Award size={20} />, label: '实名认证', desc: '已认证' },
      ]} 
    />
  );
  if (subView === 'privacy-security') return (
    <SimpleListScreen 
      title="隐私与安全" 
      onBack={goBackSubView} 
      items={[
        { icon: <Shield size={20} />, label: '隐私设置', desc: '控制谁可以查看我的领养动态' },
        { icon: <Lock size={20} />, label: '账号安全', desc: '修改登录密码、支付密码' },
        { icon: <Info size={20} />, label: '注销账号', desc: '永久注销此账号及其数据' },
      ]} 
    />
  );
  if (subView === 'help-feedback') return (
    <SimpleListScreen 
      title="帮助与反馈" 
      onBack={goBackSubView} 
      items={[
        { id: 'faq', icon: <QuestionIcon size={20} />, label: '常见问题', desc: '领养流程、审核资料等' },
        { id: 'feedback', icon: <MessageCircle size={20} />, label: '意见反馈', desc: '吐槽或建议，我们在听' },
        { id: 'contact-support', icon: <Mail size={20} />, label: '联系客服', desc: '在线客服 09:00 - 21:00' },
      ].map(item => ({ ...item, onClick: () => handleNavigate(item.id) }))} 
    />
  );
  if (subView === 'history') return (
    <SimpleListScreen 
      title="历史记录" 
      onBack={goBackSubView} 
      items={[
        { icon: <Heart size={20} />, label: '申请过的宠物', desc: '糯米、布丁' },
        { icon: <Clock size={20} />, label: '浏览足迹', desc: '您最近看了 24 个宠物' },
        { icon: <History size={20} />, label: '搜索历史', desc: '金毛、柯基、上海领养' },
      ]} 
    />
  );
  if (subView === 'faq') return <FAQScreen onBack={goBackSubView} />;
  if (subView === 'feedback') return <FeedbackScreen onBack={goBackSubView} />;
  if (subView === 'contact-support') return <ContactSupportScreen onBack={goBackSubView} />;
  if (subView === 'notifications') return <NotificationsScreen onBack={goBackSubView} applications={applications} />;
  if (subView === 'adoption-status') return <AdoptionStatusScreen onBack={goBackSubView} applications={applications} />;

  return (
    <DataContext.Provider value={{ pets, shelters, chats }}>
    <div className="min-h-screen bg-background font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {currentTab === 'home' && <HomeScreen onSelectPet={setSelectedPet} onSelectCategory={setSelectedCategory} onGoToListingPost={handleGoToListingPost} />}
          {currentTab === 'listings' && <ListingScreen authUser={authUser} onBack={() => setCurrentTab('home')} onChatWithListing={handleListingChat} />}
          {currentTab === 'messages' && <MessagesScreen onNavigate={handleNavigate} authUserId={authUser?.id} />}
          {currentTab === 'profile' && <ProfileScreen onNavigate={handleNavigate} onLogout={handleLogout} authEmail={authUser?.email} adoptedCount={adoptedCount} favoriteCount={favoriteCount} />}
          {currentTab === 'search' && <SearchScreen onSelectPet={setSelectedPet} onSearch={(q) => { api.saveSearch(q).catch(() => {}); }} />}
        </motion.div>
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 w-full h-20 bg-white/80 backdrop-blur-lg flex justify-around items-center px-4 pb-safe border-t border-surface-variant z-40 rounded-t-3xl pill-shadow">
        {[
          { id: 'home', label: '首页', icon: <Home size={24} /> },
          { id: 'search', label: '搜索', icon: <Search size={24} /> },
          { id: 'listings', label: '放养', icon: <PawPrint size={24} /> },
          { id: 'messages', label: '消息', icon: <Mail size={24} /> },
          { id: 'profile', label: '个人', icon: <User size={24} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300",
              currentTab === tab.id 
                ? "bg-primary-container text-white scale-110 shadow-md px-5" 
                : "text-on-surface-variant hover:text-primary"
            )}
          >
            {tab.icon}
            <span className="text-[10px] mt-1 font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
    </DataContext.Provider>
  );
}

// force redeploy
