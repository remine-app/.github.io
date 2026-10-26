import{useCallback,useEffect,useState}from'react';
import{Routes,Route,useLocation,NavLink,Navigate}from'react-router-dom';
import{House,Music2,ChartNoAxesColumn}from'lucide-react';
import type{Song,Settings}from'../models/types';
import{loadSongs,revokeSongAudioUrls}from'../services/songs';
import{getSettings,saveSettings,getProgress}from'../repositories/local';
import Home from'../pages/Home';import Songs from'../pages/Songs';import Practice from'../pages/Practice';import SettingsPage from'../pages/Settings';
export default function App(){
  const[songs,setSongs]=useState<Song[]>([]),[settings,setSettings]=useState(getSettings),[error,setError]=useState(''),[loading,setLoading]=useState(true);const loc=useLocation();
  const refreshSongs=useCallback(async()=>{setLoading(true);setError('');try{const next=await loadSongs();setSongs(prev=>{revokeSongAudioUrls(prev);return next})}catch(e){setError(String(e))}finally{setLoading(false)}},[]);
  useEffect(()=>{refreshSongs();return()=>revokeSongAudioUrls(songs)},[]);
  function change(s:Settings){setSettings(s);saveSettings(s)}
  const last=Object.values(getProgress()).sort((a,b)=>b.lastPracticedAt.localeCompare(a.lastPracticedAt))[0];
  return <div className="shell"><main className="main">{error&&<p className="error">콘텐츠를 읽지 못했어: {error}</p>}<Routes><Route path="/" element={<Home songs={songs} last={last} loading={loading}/>}/><Route path="/songs" element={<Songs songs={songs} loading={loading}/>}/><Route path="/practice/:songId" element={<Practice songs={songs} settings={settings} onSettings={change} onAudioInstalled={refreshSongs}/>}/><Route path="/practice" element={last?<Navigate to={`/practice/${last.songId}`}/>:songs[0]?<Navigate to={`/practice/${songs[0].songId}`}/>:<Navigate to="/songs"/>}/><Route path="/settings" element={<SettingsPage settings={settings} onChange={change} songs={songs} onAudioChanged={refreshSongs}/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes></main><nav className="bottom-nav" aria-label="메인 메뉴"><NavLink to="/" end><House size={24}/><span>홈</span></NavLink><NavLink to="/songs"><Music2 size={24}/><span>곡 목록</span></NavLink><NavLink to={last?`/practice/${last.songId}`:songs[0]?`/practice/${songs[0].songId}`:'/songs'} className={loc.pathname.startsWith('/practice')?'active':''}><ChartNoAxesColumn size={24}/><span>연습</span></NavLink></nav></div>}
